import { useState } from "react";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import { cn } from "~/lib/utils";

export interface RetryButtonProps {
  onRetry: () => Promise<void> | void;
  disabled?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  autoRetry?: boolean;
  autoRetryDelay?: number;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Retry button component with built-in retry logic and state management
 */
export function RetryButton({
  onRetry,
  disabled = false,
  maxRetries = 3,
  retryDelay = 1000,
  variant = "default",
  size = "md",
  showCount = true,
  autoRetry = false,
  autoRetryDelay = 5000,
  className,
  children = "Try Again",
}: RetryButtonProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  const canRetry = retryCount < maxRetries && !disabled;

  const handleRetry = async () => {
    if (!canRetry || isRetrying) return;

    setIsRetrying(true);
    setLastError(null);

    try {
      // Add delay for better UX (prevents button mashing)
      if (retryCount > 0 && retryDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }

      await onRetry();

      // Reset retry count on success
      setRetryCount(0);
    } catch (error) {
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      setLastError(error instanceof Error ? error.message : "Operation failed");

      // Auto-retry if enabled and within limits
      if (autoRetry && newRetryCount < maxRetries) {
        setTimeout(() => {
          if (newRetryCount < maxRetries) {
            handleRetry();
          }
        }, autoRetryDelay);
      }
    } finally {
      setIsRetrying(false);
    }
  };

  const buttonClasses = cn(
    "inline-flex items-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200",
    {
      // Variants
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300":
        variant === "default",
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400":
        variant === "outline",
      "text-blue-600 hover:bg-blue-50 focus:ring-blue-500 disabled:text-blue-300":
        variant === "ghost",

      // Sizes
      "px-3 py-1.5 text-sm": size === "sm",
      "px-4 py-2 text-sm": size === "md",
      "px-6 py-3 text-base": size === "lg",

      // States
      "opacity-50 cursor-not-allowed": !canRetry && !isRetrying,
      "cursor-wait": isRetrying,
    },
    className,
  );

  const iconSize = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size];

  return (
    <div className="space-y-2">
      <button
        onClick={handleRetry}
        disabled={!canRetry || isRetrying}
        className={buttonClasses}
        aria-label={`Retry operation (${retryCount}/${maxRetries} attempts)`}
      >
        <RefreshCw className={cn(iconSize, "mr-2", { "animate-spin": isRetrying })} />
        {isRetrying ? "Retrying..." : children}
        {showCount && retryCount > 0 && (
          <span className="ml-1 text-xs opacity-75">
            ({retryCount}/{maxRetries})
          </span>
        )}
      </button>

      {/* Error message */}
      {lastError && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="mr-1 h-4 w-4 flex-shrink-0" />
          <span className="truncate">{lastError}</span>
        </div>
      )}

      {/* Max retries reached */}
      {retryCount >= maxRetries && (
        <div className="text-sm text-gray-500">
          Maximum retry attempts reached. Please refresh the page or contact support.
        </div>
      )}

      {/* Auto-retry indicator */}
      {autoRetry && isRetrying && retryCount > 0 && retryCount < maxRetries && (
        <div className="text-sm text-blue-600">
          Automatically retrying in {Math.ceil(autoRetryDelay / 1000)} seconds...
        </div>
      )}
    </div>
  );
}

/**
 * Hook for retry logic that can be used with any async operation
 */
export function useRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    exponentialBackoff?: boolean;
    shouldRetry?: (error: unknown, attemptNumber: number) => boolean;
  } = {},
) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = false,
    shouldRetry = () => true,
  } = options;

  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);

  const executeWithRetry = async (): Promise<T> => {
    setIsRetrying(true);
    setLastError(null);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        setRetryCount(0);
        setIsRetrying(false);
        return result;
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        setRetryCount(attempt + 1);
        setLastError(error instanceof Error ? error : new Error(String(error)));

        if (isLastAttempt || !shouldRetry(error, attempt + 1)) {
          setIsRetrying(false);
          throw error;
        }

        // Calculate delay with optional exponential backoff
        const delay = exponentialBackoff ? retryDelay * Math.pow(2, attempt) : retryDelay;

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    setIsRetrying(false);
    throw lastError;
  };

  const reset = () => {
    setRetryCount(0);
    setLastError(null);
    setIsRetrying(false);
  };

  return {
    executeWithRetry,
    isRetrying,
    retryCount,
    lastError,
    reset,
    canRetry: retryCount < maxRetries,
  };
}

/**
 * Higher-order component that adds retry functionality to any component
 */
export function withRetry<P extends object>(
  Component: React.ComponentType<P>,
  retryOptions?: Partial<RetryButtonProps>,
) {
  return function WithRetryComponent(
    props: P & {
      onError?: (error: Error) => void;
      retryProps?: Partial<RetryButtonProps>;
    },
  ) {
    const [error, setError] = useState<Error | null>(null);
    const { onError, retryProps, ...componentProps } = props;

    const handleRetry = async () => {
      setError(null);
      // Component should re-render and retry its operation
    };

    const handleError = (error: Error) => {
      setError(error);
      onError?.(error);
    };

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 p-6">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">Something went wrong</h3>
            <p className="mb-4 text-gray-600">{error.message}</p>
          </div>
          <RetryButton onRetry={handleRetry} {...retryOptions} {...retryProps} />
        </div>
      );
    }

    return <Component {...(componentProps as P)} onError={handleError} />;
  };
}
