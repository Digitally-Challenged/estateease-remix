import type { ActionFunctionArgs } from "@remix-run/node";
import {
  json,
  unstable_parseMultipartFormData,
  unstable_createMemoryUploadHandler,
} from "@remix-run/node";
import { writeFile, mkdir, access, constants } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { createDocument, logDocumentAccess, getDocument } from "~/lib/dal-crud";
import { formatFileSize } from "~/utils/format";
import { getUserIdFromSession } from "~/lib/auth.server";

const UPLOAD_DIR = path.join(process.cwd(), "data", "documents", "uploads");

// Configure upload handler with file size limit
const uploadHandler = unstable_createMemoryUploadHandler({
  maxPartSize: 10_000_000, // 10MB limit
});

// Allowed file types
const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/msword": ".doc",
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
};

export async function action({ request }: ActionFunctionArgs) {
  try {
    const userId = await getUserIdFromSession(request);

    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

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
      return json(
        { error: "Missing required fields: file, name, and category are required" },
        { status: 400 },
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES[file.type]) {
      const allowedExtensions = Object.values(ALLOWED_TYPES).join(", ");
      return json(
        {
          error: `Invalid file type '${file.type}'. Allowed types: ${allowedExtensions}`,
        },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > 10_000_000) {
      return json(
        {
          error: `File size ${formatFileSize(file.size)} exceeds maximum allowed size of ${formatFileSize(10_000_000)}`,
        },
        { status: 400 },
      );
    }

    // Validate file content (basic security check)
    if (file.size === 0) {
      return json({ error: "File is empty" }, { status: 400 });
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

    // Check if directory is writable
    try {
      await access(path.dirname(fullPath), constants.W_OK);
    } catch {
      return json({ error: "Upload directory is not writable" }, { status: 500 });
    }

    // Save file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(fullPath, buffer);

    // Verify file was written correctly
    try {
      await access(fullPath, constants.R_OK);
    } catch {
      return json({ error: "Failed to write file to disk" }, { status: 500 });
    }

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
      tags: tags ? tags.split(",").map((t) => t.trim()) : undefined,
    });

    // Get the created document to return full details
    const createdDocument = getDocument(documentId);
    if (!createdDocument) {
      throw new Error("Failed to retrieve created document");
    }

    // Log the upload action
    logDocumentAccess(createdDocument.id, userId, "upload");

    return json({
      success: true,
      document: {
        id: documentId,
        name,
        category,
        fileType: extension.substring(1).toUpperCase(),
        fileSize: file.size,
        uploadedAt: createdDocument.uploaded_at,
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        description: description || null,
        relatedEntityType: relatedEntityType || null,
        relatedEntityId: relatedEntityId || null,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("ENOSPC")) {
        return json({ error: "Insufficient disk space" }, { status: 500 });
      }
      if (error.message.includes("EMFILE") || error.message.includes("ENFILE")) {
        return json({ error: "Too many open files, please try again" }, { status: 500 });
      }
      if (error.message.includes("EACCES")) {
        return json({ error: "Permission denied" }, { status: 500 });
      }
    }

    return json({ error: "Failed to upload document. Please try again." }, { status: 500 });
  }
}
