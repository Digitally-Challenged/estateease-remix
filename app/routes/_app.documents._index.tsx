import { useState } from "react";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import FileText from "lucide-react/dist/esm/icons/file-text";
import { EmptyState } from "~/components/ui/empty";
import { Button } from "~/components/ui/button";
import { DocumentUploadModal } from "~/components/ui/document-upload-modal";
import { DocumentList } from "~/components/documents/document-list";
import { getDocuments } from "~/lib/dal-crud";

export { RouteErrorBoundary as ErrorBoundary } from "~/components/ui/error/route-error-boundary";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  try {
    // Extract query parameters
    const category = searchParams.get("category") || undefined;
    const relatedEntityType = searchParams.get("relatedEntityType") || undefined;
    const relatedEntityId = searchParams.get("relatedEntityId") || undefined;
    const status = searchParams.get("status") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined;

    // Get documents using DAL function
    const result = await getDocuments({
      userId: 1, // TODO: Get actual user ID from session
      category,
      relatedEntityType,
      relatedEntityId,
      status,
      limit,
      offset,
    });

    return json({ documents: result.documents, total: result.total, error: null });
  } catch (error) {
    console.error("Error loading documents:", error);
    return json({ documents: [], total: 0, error: "Failed to load documents" });
  }
}

export default function DocumentsPage() {
  const { documents, error } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleDownload = (documentId: string) => {
    window.open(`/api/documents/${documentId}/download`, "_blank");
  };

  const handleUploadSuccess = () => {
    // Refresh the page to show new document
    fetcher.load("/documents");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400 dark:text-gray-500">
            Manage your estate planning documents
          </p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)}>Upload Document</Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Document List */}
      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents found"
          description="Upload your first document to get started"
        />
      ) : (
        <DocumentList documents={documents} onDownload={handleDownload} showBulkActions={true} />
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
