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

