import React, { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import X from "lucide-react/dist/esm/icons/x";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Info from "lucide-react/dist/esm/icons/info";
import { Button } from "./button";
import { cn } from "~/lib/utils";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  action?: ToastAction;
  duration?: number;
  createdAt: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: {
    success: (
      title: string,
      options?: Omit<Toast, "id" | "variant" | "title" | "createdAt">,
    ) => void;
    error: (title: string, options?: Omit<Toast, "id" | "variant" | "title" | "createdAt">) => void;
    warning: (
      title: string,
      options?: Omit<Toast, "id" | "variant" | "title" | "createdAt">,
    ) => void;
    info: (title: string, options?: Omit<Toast, "id" | "variant" | "title" | "createdAt">) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const toastVariantStyles = {
  success: {
    container: "border-green-200 bg-green-50",
    icon: "text-green-600",
    title: "text-green-900",
    description: "text-green-700",
    IconComponent: CheckCircle,
  },
  error: {
    container: "border-red-200 bg-red-50",
    icon: "text-red-600",
    title: "text-red-900",
    description: "text-red-700",
    IconComponent: AlertCircle,
  },
  warning: {
    container: "border-yellow-200 bg-yellow-50",
    icon: "text-yellow-600",
    title: "text-yellow-900",
    description: "text-yellow-700",
    IconComponent: AlertTriangle,
  },
  info: {
    container: "border-blue-200 bg-blue-50",
    icon: "text-blue-600",
    title: "text-blue-900",
    description: "text-blue-700",
    IconComponent: Info,
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const variant = toastVariantStyles[toast.variant];
  const IconComponent = variant.IconComponent;

  useEffect(() => {
    const duration = toast.duration ?? 5000;
    if (duration <= 0) return;

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const progressPercent = (remaining / duration) * 100;

      setProgress(progressPercent);

      if (remaining <= 0) {
        setIsExiting(true);
        setTimeout(() => onRemove(toast.id), 300);
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [toast.id, toast.duration, onRemove]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out",
        variant.container,
        isExiting ? "translate-x-full transform opacity-0" : "translate-x-0 transform opacity-100",
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Progress bar */}
      {(toast.duration ?? 5000) > 0 && (
        <div className="absolute bottom-0 left-0 h-1 w-full bg-black/10">
          <div
            className="duration-50 h-full bg-black/20 transition-all ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-start space-x-3">
        <IconComponent className={cn("mt-0.5 h-5 w-5 flex-shrink-0", variant.icon)} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={cn("text-sm font-medium", variant.title)}>{toast.title}</h4>
              {toast.description && (
                <p className={cn("mt-1 text-sm", variant.description)}>{toast.description}</p>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-black/5"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {toast.action && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toast.action.onClick}
                className="text-xs"
              >
                {toast.action.label}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="pointer-events-none fixed right-4 top-4 z-50 w-full max-w-sm space-y-2">
      <div className="pointer-events-auto space-y-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </div>,
    document.body,
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const addToast = (
    variant: ToastVariant,
    title: string,
    options: Omit<Toast, "id" | "variant" | "title" | "createdAt"> = {},
  ) => {
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const toast: Toast = {
      id,
      variant,
      title,
      createdAt: Date.now(),
      duration: 5000,
      ...options,
    };

    setToasts((prev) => {
      // Limit to 5 toasts maximum
      const newToasts = [toast, ...prev].slice(0, 5);
      return newToasts;
    });
  };

  const contextValue: ToastContextValue = {
    toasts,
    toast: {
      success: (title, options) => addToast("success", title, options),
      error: (title, options) => addToast("error", title, options),
      warning: (title, options) => addToast("warning", title, options),
      info: (title, options) => addToast("info", title, options),
    },
    removeToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export default ToastProvider;
