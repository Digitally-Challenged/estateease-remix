/**
 * UI Components Central Export
 *
 * This file provides a single import point for all UI components
 * in the EstateEase application.
 */

// Core components
export { Button, buttonVariants, type ButtonProps } from "./button";
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./card";
export { Badge, type BadgeProps } from "./badge";

// Form components
export {
  Input,
  Textarea,
  Select,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Switch,
  FormField,
  type InputProps,
  type TextareaProps,
  type SelectProps,
  type SelectOption,
  type CheckboxProps,
  type CheckboxGroupProps,
  type RadioProps,
  type RadioGroupProps,
  type SwitchProps,
  type FormFieldProps,
} from "./forms";

// Loading components
export {
  Spinner,
  Skeleton,
  SkeletonContainer,
  Progress,
  PageLoader,
  type SpinnerProps,
  type SkeletonProps,
  type SkeletonContainerProps,
  type ProgressProps,
  type PageLoaderProps,
} from "./loading";

// Error handling components
export {
  ErrorBoundary,
  DefaultErrorFallback,
  useErrorBoundary,
  withErrorBoundary,
  ErrorDisplay,
  InlineError,
  ErrorBanner,
  useErrorState,
  type ErrorBoundaryProps,
  type ErrorFallbackProps,
  type ErrorDisplayProps,
  type ErrorType,
  type ErrorInfo,
  type ErrorBoundaryState,
} from "./error";

// Empty state components
export {
  EmptyState,
  EmptyStates,
  ListEmptyState,
  type EmptyStateProps,
  type EmptyStateType,
  type EmptyStateAction,
} from "./empty";

// Retry components
export { RetryButton, useRetry, withRetry, type RetryButtonProps } from "./retry";

// Data display components
export { DataTable, type DataTableProps, type Column } from "./data-table";

// Modal components
export {
  Modal,
  ConfirmDialog,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalClose,
  type ModalProps,
  type ConfirmDialogProps,
} from "./modal";

// Toast notification components
export { ToastProvider, useToast, type Toast, type ToastVariant, type ToastAction } from "./toast";
