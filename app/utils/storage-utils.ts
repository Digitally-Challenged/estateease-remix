import path from "path";
import { mkdir, access, constants, readdir, stat } from "fs/promises";

/**
 * Storage utilities for document management
 */

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  categories: Record<
    string,
    {
      fileCount: number;
      totalSize: number;
    }
  >;
}

export interface StorageConfig {
  baseDir: string;
  maxFileSize: number;
  maxTotalSize: number;
  allowedCategories: string[];
}

export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  baseDir: path.join(process.cwd(), "data", "documents", "uploads"),
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxTotalSize: 1 * 1024 * 1024 * 1024, // 1GB
  allowedCategories: [
    "estate-planning",
    "insurance",
    "financial",
    "property",
    "legal",
    "healthcare",
    "tax",
    "other",
  ],
};

/**
 * Ensure a directory exists and is writable
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true });
    await access(dirPath, constants.W_OK);
  } catch (error) {
    throw new Error(`Cannot create or write to directory: ${dirPath}`);
  }
}

/**
 * Get storage statistics for a user
 */
export async function getStorageStats(
  userId: string,
  config: StorageConfig = DEFAULT_STORAGE_CONFIG,
): Promise<StorageStats> {
  const userDir = path.join(config.baseDir, userId);
  const stats: StorageStats = {
    totalFiles: 0,
    totalSize: 0,
    categories: {},
  };

  try {
    // Check if user directory exists
    await access(userDir, constants.R_OK);

    // Initialize category stats
    for (const category of config.allowedCategories) {
      stats.categories[category] = {
        fileCount: 0,
        totalSize: 0,
      };
    }

    // Read category directories
    for (const category of config.allowedCategories) {
      const categoryDir = path.join(userDir, category);

      try {
        await access(categoryDir, constants.R_OK);
        const files = await readdir(categoryDir);

        for (const file of files) {
          const filePath = path.join(categoryDir, file);
          const fileStat = await stat(filePath);

          if (fileStat.isFile()) {
            stats.totalFiles++;
            stats.totalSize += fileStat.size;
            stats.categories[category].fileCount++;
            stats.categories[category].totalSize += fileStat.size;
          }
        }
      } catch {
        // Category directory doesn't exist, skip
      }
    }
  } catch {
    // User directory doesn't exist, return empty stats
  }

  return stats;
}

/**
 * Check if storage limits would be exceeded
 */
export async function checkStorageLimits(
  userId: string,
  newFileSize: number,
  config: StorageConfig = DEFAULT_STORAGE_CONFIG,
): Promise<{
  canUpload: boolean;
  reason?: string;
  currentStats?: StorageStats;
}> {
  if (newFileSize > config.maxFileSize) {
    return {
      canUpload: false,
      reason: `File size exceeds maximum allowed size of ${formatBytes(config.maxFileSize)}`,
    };
  }

  const currentStats = await getStorageStats(userId, config);

  if (currentStats.totalSize + newFileSize > config.maxTotalSize) {
    return {
      canUpload: false,
      reason: `Upload would exceed total storage limit of ${formatBytes(config.maxTotalSize)}`,
      currentStats,
    };
  }

  return {
    canUpload: true,
    currentStats,
  };
}

/**
 * Generate a safe file path for storage
 */
export function generateSafeFilePath(
  userId: string,
  category: string,
  originalFilename: string,
  config: StorageConfig = DEFAULT_STORAGE_CONFIG,
): string {
  // Sanitize category
  const safeCategory = category.toLowerCase().replace(/[^a-z0-9-]/g, "-");

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substr(2, 9);
  const extension = path.extname(originalFilename);
  const safeFilename = `${timestamp}-${randomString}${extension}`;

  // Return relative path from base directory
  return path.join(userId, safeCategory, safeFilename);
}

/**
 * Get absolute path for a file
 */
export function getAbsolutePath(
  relativePath: string,
  config: StorageConfig = DEFAULT_STORAGE_CONFIG,
): string {
  return path.join(config.baseDir, relativePath);
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

/**
 * Validate file before storage
 */
export async function validateFile(filePath: string): Promise<{
  isValid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  try {
    const fileStat = await stat(filePath);

    if (!fileStat.isFile()) {
      errors.push("Not a valid file");
    }

    if (fileStat.size === 0) {
      errors.push("File is empty");
    }

    if (fileStat.size > DEFAULT_STORAGE_CONFIG.maxFileSize) {
      errors.push(
        `File exceeds maximum size of ${formatBytes(DEFAULT_STORAGE_CONFIG.maxFileSize)}`,
      );
    }
  } catch (error) {
    errors.push("Cannot access file");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
