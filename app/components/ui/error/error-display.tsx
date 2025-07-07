import * as React from "react";
import { AlertTriangle, Wifi, RefreshCw, AlertCircle, XCircle, Clock, Shield } from "lucide-react";
import { cn } from "~/lib/utils";

export type ErrorType = 
  | 'network'
  | 'validation'
  | 'permission'
  | 'timeout'
  | 'server'
  | 'client'
  | 'unknown';

export interface ErrorDisplayProps {
  error?: Error | string | null;
  type?: ErrorType;
  title?: string;
  message?: string;
  variant?: 'default' | 'minimal' | 'inline' | 'banner';
  showIcon?: boolean;
  showRetry?: boolean;
  onRetry?: () => void;
  retryText?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Error display component for showing user-friendly error messages
 * Supports different error types and display variants
 */
export function ErrorDisplay({
  error,
  type = 'unknown',
  title,
  message,
  variant = 'default',
  showIcon = true,
  showRetry = false,
  onRetry,
  retryText = 'Try Again',
  dismissible = false,
  onDismiss,
  className
}: ErrorDisplayProps) {
  // Auto-detect error type from error object/message if not specified
  const detectedType = React.useMemo(() => {
    if (type !== 'unknown') return type;
    
    const errorMessage = typeof error === 'string' ? error : error?.message || '';
    const lowerMessage = errorMessage.toLowerCase();
    
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) return 'network';
    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) return 'validation';
    if (lowerMessage.includes('permission') || lowerMessage.includes('unauthorized')) return 'permission';
    if (lowerMessage.includes('timeout')) return 'timeout';
    if (lowerMessage.includes('server') || lowerMessage.includes('500')) return 'server';
    
    return 'client';
  }, [error, type]);

  const errorConfig = getErrorConfig(detectedType);
  const displayTitle = title || errorConfig.title;
  const displayMessage = message || (typeof error === 'string' ? error : error?.message) || errorConfig.message;

  const containerClasses = cn(
    "rounded-lg",
    {
      // Default variant - full error display
      "p-4 border bg-white": variant === 'default',
      
      // Minimal variant - compact display
      "p-3 border": variant === 'minimal',
      
      // Inline variant - fits within content
      "p-2 text-sm": variant === 'inline',
      
      // Banner variant - full width alert
      "p-4 border-l-4": variant === 'banner'
    },
    errorConfig.containerClass,
    className
  );

  const iconClasses = cn(
    errorConfig.iconClass,
    {
      "h-5 w-5": variant === 'default',
      "h-4 w-4": variant === 'minimal' || variant === 'inline',
      "h-6 w-6": variant === 'banner'
    }
  );

  const titleClasses = cn(
    "font-medium",
    errorConfig.textClass,
    {
      "text-base": variant === 'default',
      "text-sm": variant === 'minimal' || variant === 'banner',
      "text-xs": variant === 'inline'
    }
  );

  const messageClasses = cn(
    errorConfig.textClass,
    {
      "text-sm opacity-90": variant === 'default',
      "text-xs opacity-80": variant === 'minimal' || variant === 'banner',
      "text-xs opacity-75": variant === 'inline'
    }
  );

  if (!error && !message) return null;

  return (
    <div className={containerClasses} role="alert" aria-live="polite">
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className="flex-shrink-0 mt-0.5">
            <errorConfig.icon className={iconClasses} />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {displayTitle && (
            <h4 className={titleClasses}>
              {displayTitle}
            </h4>
          )}
          
          {displayMessage && (
            <p className={cn(messageClasses, { "mt-1": displayTitle })}>
              {displayMessage}
            </p>
          )}
          
          {/* Actions */}
          {(showRetry || dismissible) && (
            <div className={cn(
              "flex items-center gap-2",
              variant === 'inline' ? "mt-1" : "mt-3"
            )}>
              {showRetry && onRetry && (
                <button
                  onClick={onRetry}
                  className={cn(
                    "inline-flex items-center gap-1 font-medium hover:underline focus:outline-none focus:underline",
                    errorConfig.actionClass,
                    {
                      "text-sm": variant === 'default',
                      "text-xs": variant !== 'default'
                    }
                  )}
                >
                  <RefreshCw className="h-3 w-3" />
                  {retryText}
                </button>
              )}
              
              {dismissible && onDismiss && (
                <button
                  onClick={onDismiss}
                  className={cn(
                    "inline-flex items-center gap-1 font-medium hover:underline focus:outline-none focus:underline",
                    errorConfig.actionClass,
                    {
                      "text-sm": variant === 'default',
                      "text-xs": variant !== 'default'
                    }
                  )}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
        
        {dismissible && onDismiss && variant !== 'inline' && (
          <button
            onClick={onDismiss}
            className={cn(
              "flex-shrink-0 p-1 rounded hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20",
              errorConfig.textClass
            )}
            aria-label="Dismiss error"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Get configuration for different error types
 */
function getErrorConfig(type: ErrorType) {
  const configs = {
    network: {
      icon: Wifi,
      title: "Connection Problem",
      message: "Please check your internet connection and try again.",
      containerClass: "border-orange-200 bg-orange-50",
      iconClass: "text-orange-500",
      textClass: "text-orange-800",
      actionClass: "text-orange-600 hover:text-orange-700"
    },
    validation: {
      icon: AlertCircle,
      title: "Invalid Input",
      message: "Please check your input and try again.",
      containerClass: "border-yellow-200 bg-yellow-50",
      iconClass: "text-yellow-500",
      textClass: "text-yellow-800",
      actionClass: "text-yellow-600 hover:text-yellow-700"
    },
    permission: {
      icon: Shield,
      title: "Access Denied",
      message: "You don't have permission to perform this action.",
      containerClass: "border-red-200 bg-red-50",
      iconClass: "text-red-500",
      textClass: "text-red-800",
      actionClass: "text-red-600 hover:text-red-700"
    },
    timeout: {
      icon: Clock,
      title: "Request Timeout",
      message: "The operation took too long to complete. Please try again.",
      containerClass: "border-blue-200 bg-blue-50",
      iconClass: "text-blue-500",
      textClass: "text-blue-800",
      actionClass: "text-blue-600 hover:text-blue-700"
    },
    server: {
      icon: AlertTriangle,
      title: "Server Error",
      message: "Something went wrong on our end. Please try again later.",
      containerClass: "border-red-200 bg-red-50",
      iconClass: "text-red-500",
      textClass: "text-red-800",
      actionClass: "text-red-600 hover:text-red-700"
    },
    client: {
      icon: AlertCircle,
      title: "Application Error",
      message: "An unexpected error occurred. Please refresh the page and try again.",
      containerClass: "border-gray-200 bg-gray-50",
      iconClass: "text-gray-500",
      textClass: "text-gray-800",
      actionClass: "text-gray-600 hover:text-gray-700"
    },
    unknown: {
      icon: AlertTriangle,
      title: "Error",
      message: "An error occurred. Please try again.",
      containerClass: "border-gray-200 bg-gray-50",
      iconClass: "text-gray-500",
      textClass: "text-gray-800",
      actionClass: "text-gray-600 hover:text-gray-700"
    }
  };

  return configs[type];
}

/**
 * Inline error component for form fields
 */
export function InlineError({ 
  error, 
  className, 
  ...props 
}: Omit<ErrorDisplayProps, 'variant'>) {
  return (
    <ErrorDisplay
      {...props}
      error={error}
      variant="inline"
      showIcon={false}
      className={cn("mt-1", className)}
    />
  );
}

/**
 * Banner error component for page-level errors
 */
export function ErrorBanner({ 
  error, 
  className, 
  ...props 
}: Omit<ErrorDisplayProps, 'variant'>) {
  return (
    <ErrorDisplay
      {...props}
      error={error}
      variant="banner"
      className={cn("mb-4", className)}
    />
  );
}

/**
 * Hook for managing error state with auto-dismiss
 */
export function useErrorState(autoDismissDelay?: number) {
  const [error, setError] = React.useState<Error | string | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const showError = React.useCallback((error: Error | string) => {
    setError(error);
    
    if (autoDismissDelay) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setError(null);
      }, autoDismissDelay);
    }
  }, [autoDismissDelay]);

  const clearError = React.useCallback(() => {
    setError(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    error,
    showError,
    clearError,
    hasError: error !== null
  };
}