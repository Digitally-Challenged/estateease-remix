import { useState } from "react";
import { Download, FileText, Search, Calendar, Tag, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/forms/input";
import { Select } from "~/components/ui/forms/select";
import { formatFileSize, formatDate } from "~/utils/format";
import { DocumentViewer } from "./document-viewer";

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
  related_entity_type?: string;
  related_entity_id?: string;
}

interface DocumentListProps {
  documents: Document[];
  onDownload?: (documentId: string) => void;
  onDelete?: (documentId: string) => void;
  showBulkActions?: boolean;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

const SORT_OPTIONS = [
  { value: "date-desc", label: "Newest First" },
  { value: "date-asc", label: "Oldest First" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "size-desc", label: "Largest First" },
  { value: "size-asc", label: "Smallest First" },
];

const STATUS_COLORS = {
  verified: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400",
};

export function DocumentList({
  documents,
  onDownload,
  onDelete,
  showBulkActions = false,
  relatedEntityType,
  relatedEntityId,
}: DocumentListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract unique categories and statuses
  const categories = Array.from(new Set(documents.map((doc) => doc.category)));
  const statuses = Array.from(new Set(documents.map((doc) => doc.status)));

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      !searchQuery ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    const matchesStatus = !selectedStatus || doc.status === selectedStatus;

    const matchesEntity =
      !relatedEntityType ||
      !relatedEntityId ||
      (doc.related_entity_type === relatedEntityType && doc.related_entity_id === relatedEntityId);

    return matchesSearch && matchesCategory && matchesStatus && matchesEntity;
  });

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case "date-asc":
        return new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
      case "date-desc":
        return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "size-asc":
        return a.file_size - b.file_size;
      case "size-desc":
        return b.file_size - a.file_size;
      default:
        return 0;
    }
  });

  const handleSelectAll = () => {
    if (selectedDocuments.size === sortedDocuments.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(sortedDocuments.map((doc) => doc.id)));
    }
  };

  const handleSelectDocument = (documentId: string) => {
    const newSelection = new Set(selectedDocuments);
    if (newSelection.has(documentId)) {
      newSelection.delete(documentId);
    } else {
      newSelection.add(documentId);
    }
    setSelectedDocuments(newSelection);
  };

  const handleBulkDownload = () => {
    selectedDocuments.forEach((docId) => {
      if (onDownload) {
        onDownload(docId);
      }
    });
  };

  const handleViewDocument = (document: Document) => {
    setViewingDocument(document);
  };

  const handleDeleteDocument = async (documentId: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/documents/${documentId}/delete`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      // Call the onDelete callback if provided
      if (onDelete) {
        onDelete(documentId);
      }

      // Remove from selected documents if it was selected
      if (selectedDocuments.has(documentId)) {
        const newSelection = new Set(selectedDocuments);
        newSelection.delete(documentId);
        setSelectedDocuments(newSelection);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      // You might want to show a toast notification here
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDocuments.size === 0) return;

    setIsDeleting(true);
    try {
      const promises = Array.from(selectedDocuments).map((documentId) =>
        fetch(`/api/documents/${documentId}/delete`, { method: "DELETE" }),
      );

      await Promise.all(promises);

      // Call the onDelete callback for each document
      if (onDelete) {
        selectedDocuments.forEach((documentId) => onDelete(documentId));
      }

      setSelectedDocuments(new Set());
    } catch (error) {
      console.error("Error deleting documents:", error);
      // You might want to show a toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, JSX.Element> = {
      "estate-planning": <FileText className="h-5 w-5" />,
      insurance: <FileText className="h-5 w-5" />,
      financial: <FileText className="h-5 w-5" />,
      property: <FileText className="h-5 w-5" />,
      legal: <FileText className="h-5 w-5" />,
      healthcare: <FileText className="h-5 w-5" />,
      tax: <FileText className="h-5 w-5" />,
      other: <FileText className="h-5 w-5" />,
    };
    return icons[category] || <FileText className="h-5 w-5" />;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="pl-10"
            />
          </div>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-48"
            options={[
              { value: "", label: "All Categories" },
              ...categories.map((category) => ({
                value: category,
                label: category.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
              })),
            ]}
          />
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-40"
            options={[
              { value: "", label: "All Status" },
              ...statuses.map((status) => ({
                value: status,
                label: status.charAt(0).toUpperCase() + status.slice(1),
              })),
            ]}
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-48"
            options={SORT_OPTIONS}
          />
        </div>

        {/* Bulk Actions */}
        {showBulkActions && selectedDocuments.size > 0 && (
          <div className="flex items-center gap-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <span className="text-sm font-medium">
              {selectedDocuments.size} document{selectedDocuments.size > 1 ? "s" : ""} selected
            </span>
            <Button size="sm" variant="secondary" onClick={handleBulkDownload}>
              <Download className="mr-1 h-4 w-4" />
              Download Selected
            </Button>
            {onDelete && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete Selected"}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {sortedDocuments.length} document{sortedDocuments.length !== 1 ? "s" : ""} found
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={viewMode === "grid" ? "primary" : "ghost"}
            onClick={() => setViewMode("grid")}
          >
            Grid
          </Button>
          <Button
            size="sm"
            variant={viewMode === "list" ? "primary" : "ghost"}
            onClick={() => setViewMode("list")}
          >
            List
          </Button>
        </div>
      </div>

      {/* Documents Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedDocuments.map((doc) => (
            <Card key={doc.id} className="p-4 transition-shadow hover:shadow-lg">
              {showBulkActions && (
                <div className="mb-3">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.has(doc.id)}
                    onChange={() => handleSelectDocument(doc.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                </div>
              )}

              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(doc.category)}
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${STATUS_COLORS[doc.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.draft}`}
                  >
                    {doc.status}
                  </span>
                </div>
              </div>

              <button
                className="mb-1 line-clamp-2 w-full cursor-pointer text-left text-lg font-semibold hover:text-blue-600"
                onClick={() => handleViewDocument(doc)}
                type="button"
              >
                {doc.name}
              </button>

              {doc.description && (
                <p className="mb-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                  {doc.description}
                </p>
              )}

              <div className="mb-3 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(doc.uploaded_at)}
                </div>
                <div>Size: {formatFileSize(doc.file_size)}</div>
              </div>

              {doc.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {doc.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleViewDocument(doc)}
                  className="flex-1"
                >
                  View
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDownload?.(doc.id)}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
                {onDelete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteConfirm(doc.id)}
                    title="Delete"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {showBulkActions && (
            <div className="flex items-center gap-4 border-b p-3">
              <input
                type="checkbox"
                checked={
                  selectedDocuments.size === sortedDocuments.length && sortedDocuments.length > 0
                }
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm font-medium">Select All</span>
            </div>
          )}
          {sortedDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-4 rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {showBulkActions && (
                <input
                  type="checkbox"
                  checked={selectedDocuments.has(doc.id)}
                  onChange={() => handleSelectDocument(doc.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
              )}

              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  {getCategoryIcon(doc.category)}
                  <button
                    className="cursor-pointer text-left font-semibold hover:text-blue-600"
                    onClick={() => handleViewDocument(doc)}
                    type="button"
                  >
                    {doc.name}
                  </button>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${STATUS_COLORS[doc.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.draft}`}
                  >
                    {doc.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{formatFileSize(doc.file_size)}</span>
                  <span>•</span>
                  <span>{formatDate(doc.uploaded_at)}</span>
                  {doc.tags.length > 0 && (
                    <>
                      <span>•</span>
                      <div className="flex gap-1">
                        {doc.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => handleViewDocument(doc)}>
                  View
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDownload?.(doc.id)}>
                  <Download className="h-4 w-4" />
                </Button>
                {onDelete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteConfirm(doc.id)}
                    title="Delete"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <DocumentViewer
          documentId={viewingDocument.id}
          documentName={viewingDocument.name}
          fileType={viewingDocument.file_type}
          fileSize={viewingDocument.file_size}
          uploadedAt={viewingDocument.uploaded_at}
          onClose={() => setViewingDocument(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeleteConfirm(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setDeleteConfirm(null);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close delete confirmation modal"
          />
          <div className="relative mx-4 w-full max-w-md rounded-lg bg-white shadow-lg dark:bg-gray-800">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Delete Document</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to delete this document? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleDeleteDocument(deleteConfirm)}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
