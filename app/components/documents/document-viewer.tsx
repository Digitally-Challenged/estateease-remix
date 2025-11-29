import { useState, useEffect } from "react";
import X from "lucide-react/dist/esm/icons/x";
import Download from "lucide-react/dist/esm/icons/download";
import Printer from "lucide-react/dist/esm/icons/printer";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Image from "lucide-react/dist/esm/icons/image";
import FileCode from "lucide-react/dist/esm/icons/file-code";
import Maximize2 from "lucide-react/dist/esm/icons/maximize-2";
import Minimize2 from "lucide-react/dist/esm/icons/minimize-2";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/loading";
import { formatFileSize, formatDate } from "~/utils/format";

interface DocumentViewerProps {
  documentId: string;
  documentName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  onClose: () => void;
}

export function DocumentViewer({
  documentId,
  documentName,
  fileType,
  fileSize,
  uploadedAt,
  onClose,
}: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  useEffect(() => {
    // Generate the document URL
    const url = `/api/documents/${documentId}/download`;
    setDocumentUrl(url);
    setIsLoading(false);
  }, [documentId]);

  const handleDownload = () => {
    if (documentUrl) {
      window.open(documentUrl, "_blank");
    }
  };

  const handlePrint = () => {
    if (documentUrl) {
      const printWindow = window.open(documentUrl, "_blank");
      if (printWindow) {
        printWindow.addEventListener("load", () => {
          printWindow.print();
        });
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getFileIcon = () => {
    if (fileType.includes("pdf")) return FileText;
    if (fileType.includes("image")) return Image;
    return FileCode;
  };

  const FileIcon = getFileIcon();

  const renderViewer = () => {
    if (isLoading) {
      return (
        <div className="flex h-96 items-center justify-center">
          <Spinner size="lg" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-96 flex-col items-center justify-center text-gray-500">
          <FileIcon className="mb-4 h-16 w-16" />
          <p className="text-lg font-medium">Unable to preview this document</p>
          <p className="mt-2 text-sm">{error}</p>
          <Button variant="primary" onClick={handleDownload} className="mt-4">
            <Download className="mr-2 h-4 w-4" />
            Download File
          </Button>
        </div>
      );
    }

    // For PDF files, use an iframe
    if (fileType === "pdf" || fileType === "application/pdf") {
      return (
        <iframe
          src={documentUrl || ""}
          className="h-full w-full"
          title={documentName}
          onError={() => setError("Failed to load PDF. Try downloading the file.")}
        />
      );
    }

    // For images, show the image directly
    if (fileType.startsWith("image/")) {
      return (
        <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-gray-900">
          <img
            src={documentUrl || ""}
            alt={documentName}
            className="max-h-full max-w-full object-contain"
            onError={() => setError("Failed to load image. Try downloading the file.")}
          />
        </div>
      );
    }

    // For other file types, show a download prompt
    return (
      <div className="flex h-96 flex-col items-center justify-center text-gray-500">
        <FileIcon className="mb-4 h-16 w-16" />
        <p className="text-lg font-medium">Preview not available</p>
        <p className="mt-2 text-sm">This file type cannot be previewed in the browser</p>
        <Button variant="primary" onClick={handleDownload} className="mt-4">
          <Download className="mr-2 h-4 w-4" />
          Download File
        </Button>
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-50 flex ${isFullscreen ? "" : "items-center justify-center"}`}>
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close document viewer"
      />
      <div
        className={`relative bg-white shadow-lg dark:bg-gray-800 ${
          isFullscreen ? "h-full w-full" : "mx-4 h-[85vh] w-full max-w-5xl rounded-lg"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <FileIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div>
              <h2 className="text-lg font-semibold">{documentName}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(fileSize)} • Uploaded {formatDate(uploadedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handlePrint} title="Print document">
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownload} title="Download document">
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} title="Close viewer">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className={`${isFullscreen ? "h-[calc(100%-73px)]" : "h-[calc(85vh-73px)]"}`}>
          {renderViewer()}
        </div>
      </div>
    </div>
  );
}
