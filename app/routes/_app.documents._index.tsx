import { useState } from "react";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Download, FileText } from "lucide-react";
import { EmptyState } from "~/components/ui/empty";
import { Button } from "~/components/ui/button";
import { DocumentUploadModal } from "~/components/ui/document-upload-modal";
import { Card } from "~/components/ui/card";
import { formatFileSize, formatDate } from "~/utils/format";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  // Fetch documents from API
  const response = await fetch(`http://localhost:5175/api/documents/list?${searchParams}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    return json({ documents: [], error: "Failed to load documents" });
  }
  
  const data = await response.json();
  return json({ documents: data.documents || [], error: null });
}

interface Document {
  id: string;
  name: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  category: string;
  description: string | null;
  status: string;
  uploaded_at: string;
  tags: string[];
}

export default function DocumentsPage() {
  const { documents, error } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const filteredDocuments = documents.filter((doc: Document) => {
    const matchesSearch = !searchQuery || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (documentId: string) => {
    window.open(`/api/documents/${documentId}/download`, '_blank');
  };

  const handleUploadSuccess = () => {
    // Refresh the page to show new document
    fetcher.load("/documents");
  };

  const categories = Array.from(new Set(documents.map((doc: Document) => doc.category))) as string[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">
            Manage your estate planning documents
          </p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)}>
          Upload Document
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents found"
          description={searchQuery || selectedCategory ? "Try adjusting your filters" : "Upload your first document to get started"}
          actions={[
            {
              label: "Upload Document",
              onClick: () => setIsUploadModalOpen(true),
              variant: "primary"
            }
          ]}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc: Document) => (
            <Card key={doc.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <FileText className="h-10 w-10 text-blue-500" />
                <span className={`px-2 py-1 text-xs rounded-full ${
                  doc.status === 'verified' 
                    ? 'bg-green-100 text-green-700 dark:text-green-300' 
                    : 'bg-yellow-100 text-yellow-700 dark:text-yellow-300'
                }`}>
                  {doc.status}
                </span>
              </div>
              
              <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                {doc.name}
              </h3>
              
              {doc.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-2 line-clamp-2">
                  {doc.description}
                </p>
              )}
              
              <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 space-y-1 mb-3">
                <div>Type: {doc.file_type}</div>
                <div>Size: {formatFileSize(doc.file_size)}</div>
                <div>Uploaded: {formatDate(doc.uploaded_at)}</div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDownload(doc.id)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </Card>
          ))}
        </div>
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