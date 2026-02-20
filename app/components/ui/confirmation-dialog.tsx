import { Fragment, useState, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { AlertTriangle, Info } from "lucide-react";
import { cn } from "~/lib/utils";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

const typeStyles = {
  danger: {
    icon: AlertTriangle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    confirmButton: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    confirmButton: "bg-yellow-600 hover:bg-yellow-700",
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    confirmButton: "bg-blue-600 hover:bg-blue-700",
  },
};

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  isLoading = false,
}: ConfirmationDialogProps) {
  const { icon: Icon, iconBg, iconColor, confirmButton } = typeStyles[type];

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div
                    className={cn(
"mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10",
                      iconBg,
                    )}
                  >
                    <Icon className={cn("h-6 w-6", iconColor)} aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{description}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className={cn(
"inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto",
                      confirmButton,
                      {
"cursor-not-allowed opacity-50": isLoading,
                      },
                    )}
                    onClick={onConfirm}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : confirmText}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    {cancelText}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

// Helper hook for confirmation dialogs

export function useConfirmation() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<
    Omit<ConfirmationDialogProps, "isOpen" | "onClose" | "onConfirm">
  >({
    title: "",
    description: "",
  });
  const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(null);

  const confirm = useCallback(
    (
      options: Omit<ConfirmationDialogProps, "isOpen" | "onClose" | "onConfirm">,
      callback: () => void,
    ) => {
      setConfig(options);
      setConfirmCallback(() => callback);
      setIsOpen(true);
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    if (confirmCallback) {
      confirmCallback();
    }
    setIsOpen(false);
    setConfirmCallback(null);
  }, [confirmCallback]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setConfirmCallback(null);
  }, []);

  return {
    confirm,
    ConfirmationDialog: () => (
      <ConfirmationDialog
        {...config}
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    ),
  };
}
