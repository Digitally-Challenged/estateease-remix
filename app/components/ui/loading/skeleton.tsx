import * as React from "react"
import { cn } from "~/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Shape of the skeleton
   */
  variant?: 'text' | 'rectangular' | 'circular'
  /**
   * Width of the skeleton (CSS value)
   */
  width?: string | number
  /**
   * Height of the skeleton (CSS value)
   */
  height?: string | number
  /**
   * Whether to animate the skeleton
   */
  animate?: boolean
}

/**
 * Skeleton component for content placeholders
 * 
 * @example
 * ```tsx
 * // Text skeleton (multiple lines)
 * <Skeleton variant="text" />
 * <Skeleton variant="text" width="60%" />
 * 
 * // Avatar skeleton
 * <Skeleton variant="circular" width={40} height={40} />
 * 
 * // Card skeleton
 * <Skeleton variant="rectangular" height={200} />
 * 
 * // Custom skeleton
 * <Skeleton className="rounded-xl" width={300} height={150} />
 * ```
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  animate = true,
  className,
  style,
  ...props
}: SkeletonProps) {
  const baseClasses = cn(
    "bg-gray-200",
    {
      "animate-pulse": animate,
      "rounded": variant === 'text',
      "rounded-md": variant === 'rectangular',
      "rounded-full": variant === 'circular',
    },
    className
  )

  const defaultSizes = {
    text: { height: '1em', width: '100%' },
    rectangular: { height: '100px', width: '100%' },
    circular: { height: '40px', width: '40px' },
  }

  const skeletonStyle: React.CSSProperties = {
    width: width || defaultSizes[variant].width,
    height: height || defaultSizes[variant].height,
    ...style,
  }

  return (
    <div
      className={baseClasses}
      style={skeletonStyle}
      aria-hidden="true"
      {...props}
    />
  )
}

/**
 * Skeleton container for wrapping multiple skeleton elements
 */
export interface SkeletonContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of skeleton items to render
   */
  count?: number
  /**
   * Spacing between skeleton items
   */
  spacing?: 'sm' | 'md' | 'lg'
}

/**
 * Container for multiple skeleton elements
 * 
 * @example
 * ```tsx
 * // List skeleton
 * <SkeletonContainer count={3}>
 *   <Skeleton variant="text" />
 * </SkeletonContainer>
 * 
 * // Card skeleton
 * <SkeletonContainer>
 *   <Skeleton variant="rectangular" height={200} />
 *   <Skeleton variant="text" />
 *   <Skeleton variant="text" width="60%" />
 * </SkeletonContainer>
 * ```
 */
export function SkeletonContainer({
  count = 1,
  spacing = 'md',
  className,
  children,
  ...props
}: SkeletonContainerProps) {
  const spacingClasses = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
  }

  const containerClasses = cn(
    spacingClasses[spacing],
    className
  )

  if (count > 1 && React.Children.count(children) === 1) {
    return (
      <div className={containerClasses} {...props}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index}>
            {children}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={containerClasses} {...props}>
      {children}
    </div>
  )
}