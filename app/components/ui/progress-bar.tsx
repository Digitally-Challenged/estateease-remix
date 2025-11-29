import { cn } from "~/utils/cn";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
  variant?: "default" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
}

const variantStyles = {
  default: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
};

const sizeStyles = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
  label,
  variant = "default",
  size = "md",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("space-y-1", className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>}
          {showLabel && (
            <span className="text-gray-500 dark:text-gray-400">{Math.round(percentage)}%</span>
          )}
        </div>
      )}

      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700",
          sizeStyles[size],
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-in-out",
            variantStyles[variant],
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
