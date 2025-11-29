import { useEffect, useState } from "react";
import X from "lucide-react/dist/esm/icons/x";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Info from "lucide-react/dist/esm/icons/info";
import { cn } from "~/lib/utils";

export type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const styles = {
  success:
    "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800",
  error:
    "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800",
  warning:
    "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800",
  info: "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800",
};

const iconStyles = {
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  info: "text-blue-600 dark:text-blue-400",
};

export function Notification({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = icons[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(id), 300); // Wait for animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-all duration-300",
        styles[type],
        {
          "translate-x-0 opacity-100": isVisible,
          "translate-x-full opacity-0": !isVisible,
        },
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn("h-5 w-5", iconStyles[type])} />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium">{title}</p>
            {message && <p className="mt-1 text-sm opacity-90">{message}</p>}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2"
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onClose(id), 300);
              }}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Notification Container
export function NotificationContainer() {
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type: NotificationType;
      title: string;
      message?: string;
      duration?: number;
    }>
  >([]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Listen for custom notification events
  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      const notification = {
        id: Date.now().toString(),
        ...event.detail,
      };
      setNotifications((prev) => [...prev, notification]);
    };

    window.addEventListener("show-notification", handleNotification as EventListener);
    return () => {
      window.removeEventListener("show-notification", handleNotification as EventListener);
    };
  }, []);

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:items-start sm:p-6"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        {notifications.map((notification) => (
          <Notification key={notification.id} {...notification} onClose={removeNotification} />
        ))}
      </div>
    </div>
  );
}

// Helper function to show notifications
export function showNotification(
  type: NotificationType,
  title: string,
  message?: string,
  duration?: number,
) {
  const event = new CustomEvent("show-notification", {
    detail: { type, title, message, duration },
  });
  window.dispatchEvent(event);
}
