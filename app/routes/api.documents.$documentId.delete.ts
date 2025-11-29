import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { unlink } from "fs/promises";
import path from "path";
import { getDocument, archiveDocument, logDocumentAccess } from "~/lib/dal-crud";

const UPLOAD_DIR = path.join(process.cwd(), "data", "documents", "uploads");

export async function action({ params, request }: ActionFunctionArgs) {
  if (request.method !== "DELETE") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { documentId } = params;

    if (!documentId) {
      return json({ error: "Document ID is required" }, { status: 400 });
    }

    // TODO: Get actual user ID from session
    const userId = 1;

    // Get document metadata
    const document = getDocument(documentId);

    if (!document || document.user_id !== userId) {
      return json({ error: "Document not found" }, { status: 404 });
    }

    // Check if document is already archived
    if (document.is_archived === 1) {
      return json({ error: "Document is already deleted" }, { status: 400 });
    }

    // Build full file path
    const filePath = path.join(UPLOAD_DIR, document.file_path);

    // Log the deletion attempt
    logDocumentAccess(document.id, userId, "delete_attempt");

    // Mark document as archived in database (soft delete)
    archiveDocument(documentId);

    // Optionally, remove the file from disk
    // For now, we'll keep the file for recovery purposes
    // In production, you might want to move it to a "trash" folder
    try {
      // await unlink(filePath);
      console.log(`Document ${documentId} marked as deleted, file preserved at ${filePath}`);
    } catch (fileError) {
      console.warn(`Failed to delete file ${filePath}:`, fileError);
      // Continue with the operation even if file deletion fails
    }

    // Log successful deletion
    logDocumentAccess(document.id, userId, "delete_success");

    return json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return json({ error: "Failed to delete document" }, { status: 500 });
  }
}
