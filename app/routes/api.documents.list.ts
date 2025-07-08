import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getDocuments } from "~/lib/dal-crud";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const entityType = url.searchParams.get("entityType");
    const entityId = url.searchParams.get("entityId");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    
    // TODO: Get actual user ID from session
    const userId = 1;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get documents using DAL
    const { documents, total } = getDocuments({
      userId,
      category: category || undefined,
      relatedEntityType: entityType || undefined,
      relatedEntityId: entityId || undefined,
      limit,
      offset,
    });
    
    // Parse tags from JSON string and format response
    const formattedDocuments = documents.map(doc => ({
      id: doc.document_id,
      name: doc.name,
      originalFilename: doc.original_filename,
      fileType: doc.file_type,
      fileSize: doc.file_size,
      category: doc.category,
      description: doc.description,
      relatedEntityType: doc.related_entity_type,
      relatedEntityId: doc.related_entity_id,
      status: doc.status,
      uploadedAt: doc.uploaded_at,
      tags: doc.tags ? JSON.parse(doc.tags) : [],
    }));
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;
    
    return json({ 
      documents: formattedDocuments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      }
    });
    
  } catch (error) {
    console.error("Error fetching documents:", error);
    return json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}