import { useState, useCallback, useEffect } from "react";
import { X, Upload, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "./button";
import { Input } from "./forms/input";
import { Select } from "./forms/select";
import { Textarea } from "./forms/textarea";
import { useFetcher } from "@remix-run/react";
import { Badge } from "./badge";
import { formatFileSize } from "~/utils/format";

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
  allowMultiple?: boolean;
  maxFileSize?: number;
  allowedTypes?: string[];
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
  allowMultiple = false,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ],
}: DocumentUploadModalProps) {
  const fetcher = useFetcher<{
    success?: boolean;
    document?: UploadedDocument;
    error?: string;
  }>();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [documentName, setDocumentName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">(
    "idle",
  );
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

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

  const validateAndSetFiles = useCallback(
    (selectedFiles: FileList | File[]) => {
      const fileArray = Array.from(selectedFiles);
      const validFiles: File[] = [];
      const errors: string[] = [];

      fileArray.forEach((selectedFile) => {
        if (!allowedTypes.includes(selectedFile.type)) {
          errors.push(
            `${selectedFile.name}: Invalid file type. Please upload a PDF, Word document, or image file.`,
          );
          return;
        }

        if (selectedFile.size > maxFileSize) {
          errors.push(
            `${selectedFile.name}: File size must be less than ${formatFileSize(maxFileSize)}.`,
          );
          return;
        }

        validFiles.push(selectedFile);
      });

      if (errors.length > 0) {
        setValidationError(errors.join("\n"));
        return;
      }

      if (!allowMultiple && validFiles.length > 1) {
        setValidationError("Only one file can be uploaded at a time.");
        return;
      }

      setFiles(validFiles);
      if (!documentName && validFiles.length > 0) {
        setDocumentName(validFiles[0].name.replace(/\.[^/.]+$/, ""));
      }
    },
    [allowedTypes, maxFileSize, allowMultiple, documentName],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      setValidationError("");

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        validateAndSetFiles(e.dataTransfer.files);
      }
    },
    [validateAndSetFiles],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError("");
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    if (files.length === 1) {
      setDocumentName("");
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const resetForm = () => {
    setFiles([]);
    setDocumentName("");
    setCategory("");
    setDescription("");
    setTags([]);
    setNewTag("");
    setValidationError("");
    setUploadError("");
    setUploadProgress(0);
    setUploadStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0 || !documentName || !category) {
      setValidationError("Please fill in all required fields and select at least one file.");
      return;
    }

    setUploadStatus("uploading");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", files[0]); // For now, handle single file
    formData.append("name", documentName);
    formData.append("category", category);
    formData.append("description", description);

    if (tags.length > 0) {
      formData.append("tags", tags.join(","));
    }

    if (entityType) {
      formData.append("relatedEntityType", entityType);
    }
    if (entityId) {
      formData.append("relatedEntityId", entityId);
    }

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    fetcher.submit(formData, {
      method: "POST",
      action: "/api/documents/upload",
      encType: "multipart/form-data",
    });
  };

  // Handle upload response
  useEffect(() => {
    if (fetcher.data && !isUploading) {
      if (fetcher.data.success && fetcher.data.document) {
        setUploadProgress(100);
        setUploadStatus("success");

        setTimeout(() => {
          if (fetcher.data && fetcher.data.document) {
            onUploadSuccess?.(fetcher.data.document);
          }
          onClose();
          resetForm();
        }, 1000);
      } else if (fetcher.data.error) {
        setUploadStatus("error");
        setUploadError(fetcher.data.error);
      }
    }
  }, [fetcher.data, isUploading, onUploadSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onClose();
          }
        }}
        aria-label="Close modal"
      />
      <div className="relative mx-4 w-full max-w-2xl rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b p-6">
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
            <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
              <p className="text-sm text-red-600">{validationError || uploadError}</p>
            </div>
          )}

          {/* File upload area */}
          <div
            className={`mb-6 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {files.length > 0 ? (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-blue-500" />
                      <div className="text-left">
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {/* Upload Progress */}
                {uploadStatus === "uploading" && (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm font-medium">Uploading... {uploadProgress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {uploadStatus === "success" && (
                  <div className="mt-4 flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Upload successful!</span>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Upload className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                <p className="mb-2 text-gray-600">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  {allowedTypes.includes("application/pdf") && "PDF, "}
                  {allowedTypes.some((type) => type.includes("word")) && "Word, "}
                  {allowedTypes.some((type) => type.includes("image")) && "Image files "}
                  up to {formatFileSize(maxFileSize)}
                  {allowMultiple && " (multiple files allowed)"}
                </p>
                <input
                  type="file"
                  onChange={handleFileInput}
                  accept={allowedTypes
                    .map((type) => {
                      if (type.includes("pdf")) return ".pdf";
                      if (type.includes("word")) return ".doc,.docx";
                      if (type.includes("png")) return ".png";
                      if (type.includes("jpeg")) return ".jpg,.jpeg";
                      return "";
                    })
                    .join(",")}
                  className="hidden"
                  id="file-input"
                  disabled={isUploading}
                  multiple={allowMultiple}
                />
                <label
                  htmlFor="file-input"
                  className="mt-4 inline-block cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                  Select File
                </label>
              </>
            )}
          </div>

          {/* Document details */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
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
              <label htmlFor="category" className="mb-1 block text-sm font-medium">
                Category *
              </label>
              <Select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                disabled={isUploading}
                options={DOCUMENT_CATEGORIES}
              />
            </div>

            <div>
              <label htmlFor="description" className="mb-1 block text-sm font-medium">
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

            {/* Tags */}
            <div>
              <label htmlFor="tags-input" className="mb-1 block text-sm font-medium">
                Tags
              </label>
              <div className="mb-2 flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-gray-500 hover:text-gray-700"
                      disabled={isUploading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="tags-input"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  className="flex-1"
                  disabled={isUploading}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addTag}
                  disabled={!newTag.trim() || isUploading}
                >
                  Add
                </Button>
              </div>
            </div>

            {entityType && (
              <div className="rounded-md bg-gray-50 p-3">
                <p className="text-sm text-gray-600">
                  This document will be linked to: <span className="font-medium">{entityType}</span>
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
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={files.length === 0 || !documentName || !category || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                `Upload Document${files.length > 1 ? "s" : ""}`
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
