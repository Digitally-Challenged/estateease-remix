import * as React from "react";
import { cn } from "~/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Current progress value (0-100)
   */
  value: number;
  /**
   * Maximum value (default: 100)
   */
  max?: number;
  /**
   * Size of the progress bar
   */
  size?: "sm" | "md" | "lg";
  /**
   * Color variant
   */
  variant?: "primary" | "success" | "warning" | "danger";
  /**
   * Whether to show the percentage label
   */
  showLabel?: boolean;
  /**
   * Whether to animate the progress bar
   */
  animate?: boolean;
}

/**
 * Progress bar component for showing completion status
 *
 * @example
 * ```tsx
 * // Simple progress bar
 * <Progress value={60} />
 *
 * // Progress with label
 * <Progress value={75} showLabel />
 *
 * // Animated success progress
 * <Progress value={100} variant="success" animate />
 *
 * // Large progress bar
 * <Progress value={30} size="lg" />
 * ```
 */
export function Progress({
  value,
  max = 100,
  size = "md",
  variant = "primary",
  showLabel = false,
  animate = false,
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-4",
  };

  const variantClasses = {
    primary: "bg-blue-600",
    success: "bg-green-600",
    warning: "bg-yellow-600",
    danger: "bg-red-600",
  };

  const containerClasses = cn(
    "w-full bg-gray-200 rounded-full overflow-hidden",
    sizeClasses[size],
    className,
  );

  const barClasses = cn("h-full transition-all duration-300 ease-out", variantClasses[variant], {
    "animate-pulse": animate && percentage < 100,
  });

  return (
    <div className="w-full">
      <div
        className={containerClasses}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        <div className={barClasses} style={{ width: `${percentage}%` }} />
      </div>
      {showLabel && (
        <div className="mt-1 text-right text-sm text-gray-600">{Math.round(percentage)}%</div>
      )}
    </div>
  );
}
