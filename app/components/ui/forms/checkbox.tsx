import * as React from "react";
import { cn } from "~/lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /**
   * Label text to display next to the checkbox
   */
  label?: string;
  /**
   * Error state - shows red border
   */
  error?: boolean;
  /**
   * Helper text to display below the checkbox
   */
  helperText?: string;
}

/**
 * Checkbox component with label and custom styling
 *
 * @example
 * ```tsx
 * <Checkbox
 *   label="I agree to the terms and conditions"
 *   required
 * />
 *
 * <Checkbox
 *   label="Subscribe to newsletter"
 *   helperText="We'll send you updates once a week"
 *   defaultChecked
 * />
 * ```
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error = false, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    const checkboxClasses = cn(
      "h-4 w-4 shrink-0 rounded border border-secondary-300 bg-secondary-50 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      {
        "border-error-500": error,
      },
      className,
    );

    return (
      <div className="space-y-1">
        <div className="flex items-start">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={checkboxClasses}
            aria-invalid={error}
            aria-describedby={helperText ? `${checkboxId}-helper` : undefined}
            {...props}
          />
          {label && (
            <label
              htmlFor={checkboxId}
              className="ml-3 cursor-pointer select-none text-sm font-medium leading-none text-secondary-700"
            >
              {label}
            </label>
          )}
        </div>
        {helperText && (
          <p id={`${checkboxId}-helper`} className="ml-7 text-sm text-secondary-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";

/**
 * Group of checkboxes with a common label
 */
export interface CheckboxGroupProps {
  /**
   * Group label
   */
  label?: string;
  /**
   * Whether any checkbox in the group is required
   */
  required?: boolean;
  /**
   * Error message for the group
   */
  error?: string;
  /**
   * Helper text for the group
   */
  helperText?: string;
  /**
   * Child checkboxes
   */
  children: React.ReactNode;
}

export function CheckboxGroup({
  label,
  required,
  error,
  helperText,
  children,
}: CheckboxGroupProps) {
  return (
    <fieldset className="space-y-3">
      {label && (
        <legend className="text-sm font-medium text-secondary-700">
          {label}
          {required && <span className="ml-1 text-error-500">*</span>}
        </legend>
      )}
      <div className="space-y-2">{children}</div>
      {error && (
        <p className="text-sm text-error-500" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && <p className="text-sm text-secondary-500">{helperText}</p>}
    </fieldset>
  );
}

export { Checkbox };
