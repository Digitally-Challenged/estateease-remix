import { useState, useCallback } from "react";
import { X, Upload, FileText, AlertCircle } from "lucide-react";
import { Button } from "./button";
import { Input } from "./forms/input";
import { Select } from "./forms/select";
import { Textarea } from "./forms/textarea";
import { useFetcher } from "@remix-run/react";

interface UploadedDocument {
  id: string;
  name: string;
  category: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType?: string;
  entityId?: string;
  onUploadSuccess?: (document: UploadedDocument) => void;
}

const DOCUMENT_CATEGORIES = [
  { value: "estate-planning", label: "Estate Planning" },
  { value: "insurance", label: "Insurance Policies" },
  { value: "financial", label: "Financial Documents" },
  { value: "property", label: "Property Documents" },
  { value: "legal", label: "Legal Documents" },
  { value: "healthcare", label: "Healthcare Directives" },
  { value: "tax", label: "Tax Documents" },
  { value: "other", label: "Other" },
];

export function DocumentUploadModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  onUploadSuccess,
}: DocumentUploadModalProps) {
  const fetcher = useFetcher<{
    success?: boolean;
    document?: UploadedDocument;
    error?: string;
  }>();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [validationError, setValidationError] = useState("");

  const isUploading = fetcher.state === "submitting";

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateAndSetFile = useCallback((selectedFile: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setValidationError("Please upload a PDF, Word document, or image file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setValidationError("File size must be less than 10MB.");
      return;
    }

    setFile(selectedFile);
    if (!documentName) {
      setDocumentName(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  }, [documentName, setValidationError, setFile, setDocumentName]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setValidationError("");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  }, [validateAndSetFile, setDragActive, setValidationError]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError("");
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !documentName || !category) {
      setValidationError("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", documentName);
    formData.append("category", category);
    formData.append("description", description);
    
    if (entityType) {
      formData.append("relatedEntityType", entityType);
    }
    if (entityId) {
      formData.append("relatedEntityId", entityId);
    }

    fetcher.submit(formData, {
      method: "POST",
      action: "/api/documents/upload",
      encType: "multipart/form-data",
    });
  };

  // Handle upload response
  if (fetcher.data && !isUploading) {
    if (fetcher.data.success && fetcher.data.document) {
      onUploadSuccess?.(fetcher.data.document);
      onClose();
      // Reset form
      setFile(null);
      setDocumentName("");
      setCategory("");
      setDescription("");
      setValidationError("");
    } else if (fetcher.data.error) {
      setUploadError(fetcher.data.error);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClose();
          }
        }}
        aria-label="Close modal"
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Upload Document</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            disabled={isUploading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Error messages */}
          {(validationError || uploadError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <p className="text-sm text-red-600">{validationError || uploadError}</p>
            </div>
          )}

          {/* File upload area */}
          <div
            className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="ml-4 text-red-500 hover:text-red-700"
                  disabled={isUploading}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 mb-2">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  PDF, Word, or image files up to 10MB
                </p>
                <input
                  type="file"
                  onChange={handleFileInput}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  className="hidden"
                  id="file-input"
                  disabled={isUploading}
                />
                <label
                  htmlFor="file-input"
                  className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
                >
                  Select File
                </label>
              </>
            )}
          </div>

          {/* Document details */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Document Name *
              </label>
              <Input
                id="name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="e.g., 2024 Estate Planning Documents"
                required
                disabled={isUploading}
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">
                Category *
              </label>
              <Select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                disabled={isUploading}
                options={DOCUMENT_CATEGORIES}
              >
                <option value="">Select a category</option>
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes about this document..."
                rows={3}
                disabled={isUploading}
              />
            </div>

            {entityType && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  This document will be linked to:{" "}
                  <span className="font-medium">{entityType}</span>
                  {entityId && (
                    <>
                      {" "}
                      (ID: <span className="font-mono">{entityId}</span>)
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!file || !documentName || !category || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 