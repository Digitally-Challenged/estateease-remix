import type { ActionFunctionArgs } from "@remix-run/node";
import { json, unstable_parseMultipartFormData, unstable_createMemoryUploadHandler } from "@remix-run/node";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { createDocument, logDocumentAccess, getDocument } from "~/lib/dal-crud";

const UPLOAD_DIR = path.join(process.cwd(), "data", "documents", "uploads");

// Configure upload handler with file size limit
const uploadHandler = unstable_createMemoryUploadHandler({
  maxPartSize: 10_000_000, // 10MB limit
});

// Allowed file types
const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/msword': '.doc',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
};

export async function action({ request }: ActionFunctionArgs) {
  try {
    // Parse multipart form data using Remix's built-in handler
    const formData = await unstable_parseMultipartFormData(request, uploadHandler);
    
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const relatedEntityType = formData.get("relatedEntityType") as string;
    const relatedEntityId = formData.get("relatedEntityId") as string;
    const tags = formData.get("tags") as string;

    // Validate required fields
    if (!file || !name || !category) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES[file.type]) {
      return json({ error: "Invalid file type" }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString("hex");
    const extension = ALLOWED_TYPES[file.type];
    const filename = `${timestamp}-${randomString}${extension}`;
    const relativePath = path.join(category.toLowerCase(), filename);
    const fullPath = path.join(UPLOAD_DIR, relativePath);

    // Ensure directory exists
    await mkdir(path.dirname(fullPath), { recursive: true });

    // Save file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(fullPath, buffer);

    // Create document record using DAL
    const documentId = createDocument({
      name,
      original_filename: file.name,
      file_path: relativePath,
      file_size: file.size,
      file_type: extension.substring(1).toUpperCase(),
      mime_type: file.type,
      category,
      description: description || undefined,
      related_entity_type: relatedEntityType || undefined,
      related_entity_id: relatedEntityId || undefined,
      tags: tags ? tags.split(',').map(t => t.trim()) : undefined,
    });

    // Get the created document to return full details
    const createdDocument = getDocument(documentId);
    if (!createdDocument) {
      throw new Error("Failed to retrieve created document");
    }

    // Log the upload action
    const userId = 1; // TODO: Get actual user ID from session
    logDocumentAccess(createdDocument.id, userId, 'upload');

    return json({
      success: true,
      document: {
        id: documentId,
        name,
        category,
        fileType: extension.substring(1).toUpperCase(),
        fileSize: file.size,
        uploadedAt: createdDocument.uploaded_at
      }
    });

  } catch (error) {
    console.error("Upload error:", error);
    return json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}