import * as React from "react";
import { cn } from "~/lib/utils";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the spinner
   */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * Text to display next to the spinner
   */
  label?: string;
  /**
   * Whether to center the spinner in its container
   */
  center?: boolean;
  /**
   * Whether to show the spinner inline
   */
  inline?: boolean;
}

/**
 * Spinner component for loading states
 *
 * @example
 * ```tsx
 * // Simple spinner
 * <Spinner />
 *
 * // Spinner with text
 * <Spinner label="Loading..." />
 *
 * // Large centered spinner
 * <Spinner size="lg" center />
 *
 * // Inline spinner in button
 * <Button disabled>
 *   <Spinner size="sm" inline /> Saving...
 * </Button>
 * ```
 */
export function Spinner({
  size = "md",
  label,
  center = false,
  inline = false,
  className,
  ...props
}: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const containerClasses = cn(
    "flex items-center",
    {
      "justify-center": center,
      "inline-flex": inline,
      flex: !inline,
    },
    className,
  );

  return (
    <div className={containerClasses} {...props}>
      <Loader2
        className={cn("animate-spin text-blue-600", sizeClasses[size], label && "mr-2")}
        aria-hidden="true"
      />
      {label && <span className="text-sm text-gray-600">{label}</span>}
      <span className="sr-only">Loading</span>
    </div>
  );
}
