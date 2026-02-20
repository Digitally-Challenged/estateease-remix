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
 * Provides label, error message, and helper text functionality.
 * Auto-generates an id to associate the label with its child input.
 *
 * @example
 * ```tsx
 * <FormField
 *   label="Email Address"
 *   required
 *   error={errors.email}
 *   helperText="We'll never share your email"
 * >
 *   <Input type="email" />
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
  const generatedId = React.useId();
  const fieldId = htmlFor || generatedId;

  // Inject the id into the child element so the label's htmlFor matches
  const childWithId = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<{ id?: string }>, {
        id: (children as React.ReactElement<{ id?: string }>).props.id || fieldId,
      })
    : children;

  return (
    <div className={cn("space-y-1", containerClassName)} {...props}>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-secondary-700">
          {label}
          {required && <span className="ml-1 text-error-500">*</span>}
        </label>
      )}
      <div className={className}>{childWithId}</div>
      {error && (
        <p className="text-sm text-error-500" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && <p className="text-sm text-secondary-500">{helperText}</p>}
    </div>
  );
}
