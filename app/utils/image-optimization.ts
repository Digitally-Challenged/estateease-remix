/**
 * Image optimization utilities for EstateEase
 * Provides modern image format support and responsive loading
 */

export interface ImageSource {
  srcSet: string;
  type: string;
  media?: string;
}

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  sizes?: string;
  className?: string;
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(basePath: string, sizes: number[] = [200, 400, 800, 1200]): string {
  const ext = basePath.split(".").pop();
  const pathWithoutExt = basePath.replace(`.${ext}`, "");

  return sizes.map((size) => `${pathWithoutExt}-${size}.${ext} ${size}w`).join(", ");
}

/**
 * Generate sources for picture element with modern formats
 */
export function generatePictureSources(imagePath: string): ImageSource[] {
  const pathWithoutExt = imagePath.replace(/\.[^/.]+$/, "");

  return [
    {
      srcSet: `${pathWithoutExt}.avif`,
      type: "image/avif",
    },
    {
      srcSet: `${pathWithoutExt}.webp`,
      type: "image/webp",
    },
    {
      srcSet: imagePath,
      type: `image/${imagePath.split(".").pop()}`,
    },
  ];
}

/**
 * Get optimized image path based on theme
 */
export function getThemedImagePath(
  baseName: string,
  theme: "light" | "dark",
  extension: string = "png",
): string {
  return `/images/${baseName}-${theme}.${extension}`;
}

/**
 * Preload critical images
 */
export function getImagePreloadLinks(images: string[]) {
  return images.map((image) => ({
    rel: "preload" as const,
    as: "image" as const,
    href: image,
    type: image.includes(".webp") ? "image/webp" : "image/png",
  }));
}
