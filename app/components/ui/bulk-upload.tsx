import { useState, useCallback, useMemo } from "react";
import { X, Upload, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "./button";
import { validateFiles, DEFAULT_UPLOAD_CONFIG, type FileUploadConfig } from "~/utils/file-utils";
import { formatFileSize } from "~/utils/format";
import { ProgressBar } from "./progress-bar";
import { Badge } from "./badge";

interface BulkUploadProps {
  onUploadComplete: (results: UploadResult[]) => void;
  onClose: () => void;
  config?: Partial<FileUploadConfig>;
  entityType?: string;
  entityId?: string;
}

interface UploadResult {
  file: File;
  success: boolean;
  documentId?: string;
  error?: string;
}

interface FileUploadStatus {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
  documentId?: string;
}

export function BulkUpload({
  onUploadComplete,
  onClose,
  config = {},
  entityType,
  entityId,
}: BulkUploadProps) {
  const uploadConfig = useMemo(
    () => ({ ...DEFAULT_UPLOAD_CONFIG, ...config, allowMultiple: true }),
    [config],
  );

  const [files, setFiles] = useState<FileUploadStatus[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      setValidationError("");

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const fileList = Array.from(e.dataTransfer.files);
        addFiles(fileList);
      }
    },
    [addFiles],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError("");
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      addFiles(fileList);
    }
  };

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const validation = validateFiles(newFiles, uploadConfig);

      if (!validation.isValid) {
        setValidationError(validation.errors.join("\\n"));
        return;
      }

      const fileStatuses: FileUploadStatus[] = newFiles.map((file) => ({
        file,
        status: "pending",
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...fileStatuses]);
    },
    [uploadConfig],
  );

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const uploadFile = async (fileStatus: FileUploadStatus, index: number): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("file", fileStatus.file);
    formData.append("name", fileStatus.file.name.replace(/\\.[^/.]+$/, ""));
    formData.append("category", "other"); // Default category for bulk upload

    if (entityType) {
      formData.append("relatedEntityType", entityType);
    }
    if (entityId) {
      formData.append("relatedEntityId", entityId);
    }

    try {
      // Update status to uploading
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "uploading" as const, progress: 0 } : f)),
      );

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index && f.status === "uploading"
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f,
          ),
        );
      }, 100);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();

      // Update status to success
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: "success" as const,
                progress: 100,
                documentId: result.document?.id,
              }
            : f,
        ),
      );

      return {
        file: fileStatus.file,
        success: true,
        documentId: result.document?.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";

      // Update status to error
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: "error" as const,
                progress: 0,
                error: errorMessage,
              }
            : f,
        ),
      );

      return {
        file: fileStatus.file,
        success: false,
        error: errorMessage,
      };
    }
  };

  const handleUploadAll = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const results = await Promise.all(
        files.map((fileStatus, index) => uploadFile(fileStatus, index)),
      );

      onUploadComplete(results);
    } catch (error) {
      console.error("Bulk upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusColor = (status: FileUploadStatus["status"]) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-700";
      case "uploading":
        return "bg-blue-100 text-blue-700";
      case "success":
        return "bg-green-100 text-green-700";
      case "error":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: FileUploadStatus["status"]) => {
    switch (status) {
      case "pending":
        return <FileText className="h-4 w-4" />;
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const completedCount = files.filter((f) => f.status === "success").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close bulk upload modal"
      />
      <div className="relative mx-4 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-xl font-semibold">Bulk Document Upload</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            disabled={isUploading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Error display */}
          {validationError && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
              <div className="whitespace-pre-line text-sm text-red-600">{validationError}</div>
            </div>
          )}

          {/* Drop zone */}
          <div
            className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p className="mb-2 text-gray-600">
              Drag and drop multiple files here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              PDF, Word, or image files up to {formatFileSize(uploadConfig.maxFileSize)} each
            </p>
            <input
              type="file"
              onChange={handleFileInput}
              accept={uploadConfig.allowedTypes.join(",")}
              className="hidden"
              id="bulk-file-input"
              multiple
              disabled={isUploading}
            />
            <label
              htmlFor="bulk-file-input"
              className="mt-4 inline-block cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Select Files
            </label>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Files ({files.length})</h3>
                <div className="flex items-center gap-4 text-sm">
                  {completedCount > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {completedCount} completed
                    </Badge>
                  )}
                  {errorCount > 0 && (
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      {errorCount} failed
                    </Badge>
                  )}
                </div>
              </div>

              <div className="max-h-96 space-y-2 overflow-y-auto">
                {files.map((fileStatus, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex-shrink-0">{getStatusIcon(fileStatus.status)}</div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate font-medium">{fileStatus.file.name}</p>
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${getStatusColor(fileStatus.status)}`}
                        >
                          {fileStatus.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(fileStatus.file.size)}
                      </p>

                      {fileStatus.status === "uploading" && (
                        <div className="mt-2">
                          <ProgressBar value={fileStatus.progress} size="sm" showLabel />
                        </div>
                      )}

                      {fileStatus.error && (
                        <p className="mt-1 text-sm text-red-600">{fileStatus.error}</p>
                      )}
                    </div>

                    {fileStatus.status === "pending" && (
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleUploadAll} disabled={files.length === 0 || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                `Upload ${files.length} File${files.length > 1 ? "s" : ""}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
