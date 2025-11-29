/**
 * Utility functions for file operations
 */

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FileUploadConfig {
  maxFileSize: number;
  allowedTypes: string[];
  allowMultiple: boolean;
}

export const DEFAULT_UPLOAD_CONFIG: FileUploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ],
  allowMultiple: false,
};

export const DOCUMENT_CATEGORIES = [
  { value: "estate-planning", label: "Estate Planning" },
  { value: "insurance", label: "Insurance Policies" },
  { value: "financial", label: "Financial Documents" },
  { value: "property", label: "Property Documents" },
  { value: "legal", label: "Legal Documents" },
  { value: "healthcare", label: "Healthcare Directives" },
  { value: "tax", label: "Tax Documents" },
  { value: "other", label: "Other" },
];

/**
 * Validate a single file against the upload configuration
 */
export function validateFile(file: File, config: FileUploadConfig): FileValidationResult {
  const errors: string[] = [];

  // Check file type
  if (!config.allowedTypes.includes(file.type)) {
    const allowedExtensions = config.allowedTypes
      .map((type) => {
        if (type.includes("pdf")) return "PDF";
        if (type.includes("word")) return "Word";
        if (type.includes("png")) return "PNG";
        if (type.includes("jpeg")) return "JPEG";
        return type;
      })
      .join(", ");

    errors.push(`Invalid file type. Allowed types: ${allowedExtensions}`);
  }

  // Check file size
  if (file.size > config.maxFileSize) {
    errors.push(`File size exceeds maximum allowed size of ${formatFileSize(config.maxFileSize)}`);
  }

  // Check if file is empty
  if (file.size === 0) {
    errors.push("File is empty");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate multiple files against the upload configuration
 */
export function validateFiles(files: File[], config: FileUploadConfig): FileValidationResult {
  const errors: string[] = [];

  // Check if multiple files are allowed
  if (!config.allowMultiple && files.length > 1) {
    errors.push("Only one file can be uploaded at a time");
  }

  // Validate each file
  files.forEach((file, index) => {
    const result = validateFile(file, config);
    if (!result.isValid) {
      const prefix = files.length > 1 ? `${file.name}: ` : "";
      errors.push(...result.errors.map((error) => `${prefix}${error}`));
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

/**
 * Get file type icon based on mime type
 */
export function getFileTypeIcon(mimeType: string): string {
  if (mimeType.includes("pdf")) return "📄";
  if (mimeType.includes("word")) return "📝";
  if (mimeType.includes("image")) return "🖼️";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "📊";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "📋";
  return "📎";
}

/**
 * Generate a unique filename with timestamp and random string
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substr(2, 9);
  const extension = getFileExtension(originalName);

  return `${timestamp}-${randomString}${extension ? `.${extension}` : ""}`;
}

/**
 * Check if file type is supported for preview
 */
export function isPreviewSupported(mimeType: string): boolean {
  return mimeType.includes("pdf") || mimeType.includes("image");
}

/**
 * Extract metadata from file
 */
export async function extractFileMetadata(file: File): Promise<{
  name: string;
  size: number;
  type: string;
  lastModified: number;
  extension: string;
}> {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    extension: getFileExtension(file.name),
  };
}

/**
 * Convert file to base64 (for small files only)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Create a thumbnail for image files
 */
export function createImageThumbnail(
  file: File,
  maxWidth: number = 100,
  maxHeight: number = 100,
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image"));
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const { width, height } = img;
      const aspectRatio = width / height;

      let newWidth = maxWidth;
      let newHeight = maxHeight;

      if (aspectRatio > 1) {
        newHeight = maxWidth / aspectRatio;
      } else {
        newWidth = maxHeight * aspectRatio;
      }

      canvas.width = newWidth;
      canvas.height = newHeight;

      ctx?.drawImage(img, 0, 0, newWidth, newHeight);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}
