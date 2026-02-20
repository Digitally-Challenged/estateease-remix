/**
 * Optimized Image Component
 * Provides automatic WebP/AVIF fallback, lazy loading, and responsive sizing
 */

import { useState, useEffect } from "react";
import { cn } from "~/lib/utils";
import {
  generatePictureSources,
  generateSrcSet,
  type OptimizedImageProps,
} from "~/utils/image-optimization";

interface ExtendedImageProps extends OptimizedImageProps {
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  loading = "lazy",
  sizes,
  className,
  fallbackSrc = "/images/placeholder.png",
  onLoad,
  onError,
  priority = false,
}: ExtendedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    // Reset states when src changes
    setImageSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    setImageSrc(fallbackSrc);
    onError?.();
  };

  // Generate sources for modern formats
  const sources = generatePictureSources(src);

  // Generate srcset for responsive images
  const srcSet = sizes ? generateSrcSet(src) : undefined;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Loading skeleton */}
      {isLoading && <div className="absolute inset-0 animate-pulse bg-gray-200" />}

      <picture>
        {/* Modern format sources */}
        {sources.map((source, index) => (
          <source key={index} srcSet={source.srcSet} type={source.type} media={source.media} />
        ))}

        {/* Fallback img element */}
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : loading}
          sizes={sizes}
          srcSet={srcSet}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            hasError && "grayscale filter",
          )}
        />
      </picture>

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-sm text-gray-500">Failed to load image</span>
        </div>
      )}
    </div>
  );
}

/**
 * Logo component with theme-aware optimization
 */
export function OptimizedLogo({
  theme,
  className,
  ...props
}: {
  theme: "light" | "dark";
  className?: string;
} & Omit<ExtendedImageProps, "src" | "alt">) {
  const logoSrc = theme === "dark" ? "/logo-dark" : "/logo-light";

  return (
    <OptimizedImage
      src={`${logoSrc}.png`}
      alt="EstateEase Logo"
      width={200}
      height={50}
      className={className}
      priority // Logos should load eagerly
      {...props}
    />
  );
}

/**
 * Avatar component with optimization
 */
export function OptimizedAvatar({
  src,
  alt,
  size = "md",
  className,
  ...props
}: {
  size?: "sm" | "md" | "lg" | "xl";
} & ExtendedImageProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const sizePixels = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={sizePixels[size]}
      height={sizePixels[size]}
      className={cn("rounded-full", sizeClasses[size], className)}
      {...props}
    />
  );
}
