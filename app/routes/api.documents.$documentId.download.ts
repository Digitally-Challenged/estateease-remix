import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { getDocument, logDocumentAccess } from "~/lib/dal-crud";
import { getUserIdFromSession } from "~/lib/auth.server";

const UPLOAD_DIR = path.join(process.cwd(), "data", "documents", "uploads");

export async function loader({ params, request }: LoaderFunctionArgs) {
  try {
    const { documentId } = params;

    if (!documentId) {
      return json({ error: "Document ID is required" }, { status: 400 });
    }

    const userId = await getUserIdFromSession(request);

    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get document metadata using DAL
    const document = getDocument(documentId);

    if (!document || document.user_id !== userId || document.is_archived === 1) {
      return json({ error: "Document not found" }, { status: 404 });
    }

    // Build full file path
    const filePath = path.join(UPLOAD_DIR, document.file_path);

    // Check if file exists
    try {
      await stat(filePath);
    } catch {
      return json({ error: "File not found on disk" }, { status: 404 });
    }

    // Get client IP and user agent for access log
    const headers = request.headers;
    const ipAddress = headers.get("x-forwarded-for") || headers.get("x-real-ip") || undefined;
    const userAgent = headers.get("user-agent") || undefined;

    // Log the access
    logDocumentAccess(document.id, userId, "download", ipAddress, userAgent);

    // Create file stream and return
    const fileStream = createReadStream(filePath);

    return new Response(fileStream as unknown as BodyInit, {
      headers: {
        "Content-Type": document.mime_type,
        "Content-Disposition": `attachment; filename="${document.original_filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return json({ error: "Failed to download document" }, { status: 500 });
  }
}
