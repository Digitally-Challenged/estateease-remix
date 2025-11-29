import * as React from "react";
import { cn } from "~/lib/utils";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Label for the form field
   */
  label?: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Helper text to display below the field
   */
  helperText?: string;
  /**
   * HTML for attribute to link label to input
   */
  htmlFor?: string;
  /**
   * Additional class names for the container
   */
  containerClassName?: string;
}

/**
 * FormField wrapper component for consistent form layouts
 * Provides label, error message, and helper text functionality
 *
 * @example
 * ```tsx
 * <FormField
 *   label="Email Address"
 *   required
 *   error={errors.email}
 *   helperText="We'll never share your email"
 * >
 *   <Input type="email" id="email" />
 * </FormField>
 * ```
 */
export function FormField({
  label,
  required = false,
  error,
  helperText,
  htmlFor,
  containerClassName,
  className,
  children,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1", containerClassName)} {...props}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-secondary-700">
          {label}
          {required && <span className="ml-1 text-error-500">*</span>}
        </label>
      )}
      <div className={className}>{children}</div>
      {error && (
        <p className="text-sm text-error-500" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && <p className="text-sm text-secondary-500">{helperText}</p>}
    </div>
  );
}
