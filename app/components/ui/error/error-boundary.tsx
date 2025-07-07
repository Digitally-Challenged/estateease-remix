import * as React from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Link } from "@remix-run/react";
import { cn } from "~/lib/utils";

export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component';
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

export interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
  retryCount: number;
  level: 'page' | 'section' | 'component';
}

/**
 * Error Boundary component for graceful error handling
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const enhancedErrorInfo: ErrorInfo = {
      componentStack: errorInfo.componentStack || '',
      errorBoundary: this.constructor.name
    };

    this.setState({
      errorInfo: enhancedErrorInfo
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, enhancedErrorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', enhancedErrorInfo);
      console.groupEnd();
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when resetKeys change
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys && prevProps.resetKeys) {
        const hasResetKeyChanged = resetKeys.some(
          (key, index) => prevProps.resetKeys![index] !== key
        );
        if (hasResetKeyChanged) {
          this.resetError();
        }
      }
    }

    // Reset error boundary when any props change (if enabled)
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetError();
    }
  }

  resetError = () => {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  retryWithDelay = (delay: number = 1000) => {
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetError();
    }, delay);
  };

  render() {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const { children, fallback: FallbackComponent, level = 'component', isolate = false } = this.props;

    if (hasError && error) {
      // Use custom fallback component if provided
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={error}
            errorInfo={errorInfo}
            resetError={this.resetError}
            retryCount={retryCount}
            level={level}
          />
        );
      }

      // Use default error fallback
      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          resetError={this.resetError}
          retryCount={retryCount}
          level={level}
          isolate={isolate}
        />
      );
    }

    return children;
  }
}

/**
 * Default error fallback component
 */
export function DefaultErrorFallback({
  error,
  errorInfo,
  resetError,
  retryCount,
  level,
  isolate = false
}: ErrorFallbackProps & { isolate?: boolean }) {
  const isPageLevel = level === 'page';
  const isSectionLevel = level === 'section';
  
  const containerClasses = cn(
    "flex flex-col items-center justify-center p-6 text-center",
    {
      "min-h-screen bg-gray-50": isPageLevel,
      "min-h-96 bg-gray-50 rounded-lg border": isSectionLevel,
      "min-h-48 bg-red-50 rounded-md border border-red-200": !isPageLevel && !isSectionLevel,
      "border-2 border-dashed border-red-300": isolate
    }
  );

  const iconClasses = cn(
    "mb-4 text-red-500",
    {
      "h-16 w-16": isPageLevel,
      "h-12 w-12": isSectionLevel,
      "h-8 w-8": !isPageLevel && !isSectionLevel
    }
  );

  const titleClasses = cn(
    "font-semibold text-gray-900 mb-2",
    {
      "text-2xl": isPageLevel,
      "text-xl": isSectionLevel,
      "text-lg": !isPageLevel && !isSectionLevel
    }
  );

  const getErrorMessage = () => {
    if (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
      return {
        title: "Update Available",
        message: "A new version of the application is available. Please refresh the page to load the latest version."
      };
    }

    if (error.message.includes('Network')) {
      return {
        title: "Connection Problem",
        message: "Please check your internet connection and try again."
      };
    }

    switch (level) {
      case 'page':
        return {
          title: "Something went wrong",
          message: "We encountered an unexpected error while loading this page. This has been logged and our team will investigate."
        };
      case 'section':
        return {
          title: "Section unavailable",
          message: "This section is temporarily unavailable. You can try refreshing or continue using other parts of the application."
        };
      default:
        return {
          title: "Component error",
          message: "This component encountered an error and couldn't be displayed."
        };
    }
  };

  const { title, message } = getErrorMessage();

  return (
    <div className={containerClasses}>
      <AlertTriangle className={iconClasses} />
      
      <h3 className={titleClasses}>
        {title}
      </h3>
      
      <p className="text-gray-600 max-w-md mb-6">
        {message}
      </p>

      {/* Error Details (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mb-6 text-left w-full max-w-2xl">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            <Bug className="inline h-4 w-4 mr-1" />
            Error Details (Development)
          </summary>
          <div className="mt-2 p-4 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto">
            <div className="mb-2">
              <strong>Error:</strong> {error.message}
            </div>
            <div className="mb-2">
              <strong>Stack:</strong>
              <pre className="whitespace-pre-wrap">{error.stack}</pre>
            </div>
            {errorInfo && (
              <div>
                <strong>Component Stack:</strong>
                <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
              </div>
            )}
            <div className="mt-2 text-gray-600">
              Retry count: {retryCount}
            </div>
          </div>
        </details>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={resetError}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </button>

        {(isPageLevel || isSectionLevel) && (
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Link>
        )}
      </div>

      {/* Retry Information */}
      {retryCount > 0 && (
        <p className="mt-4 text-sm text-gray-500">
          Retry attempt: {retryCount}
        </p>
      )}
    </div>
  );
}

/**
 * Hook to create an error boundary with retry functionality
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return {
    captureError,
    resetError
  };
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}