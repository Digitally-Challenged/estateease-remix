import * as React from "react"
import { cn } from "~/lib/utils"
import { Spinner } from "./spinner"

export interface PageLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Loading message to display
   */
  message?: string
  /**
   * Whether to show a backdrop
   */
  backdrop?: boolean
  /**
   * Whether to make it fullscreen
   */
  fullScreen?: boolean
}

/**
 * Full page loading component
 * 
 * @example
 * ```tsx
 * // Simple page loader
 * <PageLoader />
 * 
 * // With custom message
 * <PageLoader message="Loading your data..." />
 * 
 * // Fullscreen with backdrop
 * <PageLoader fullScreen backdrop message="Please wait..." />
 * ```
 */
export function PageLoader({
  message = "Loading...",
  backdrop = false,
  fullScreen = false,
  className,
  ...props
}: PageLoaderProps) {
  const containerClasses = cn(
    "flex flex-col items-center justify-center",
    {
      "fixed inset-0 z-50": fullScreen,
      "min-h-[400px] w-full": !fullScreen,
    },
    className
  )

  const content = (
    <div className={containerClasses} {...props}>
      <Spinner size="lg" />
      {message && (
        <p className="mt-4 text-sm text-gray-600">
          {message}
        </p>
      )}
    </div>
  )

  if (backdrop && fullScreen) {
    return (
      <>
        <div className="fixed inset-0 bg-black/20 z-40" aria-hidden="true" />
        {content}
      </>
    )
  }

  return content
}