import * as React from "react"
import { cn } from "~/lib/utils"
import { AlertCircle } from "lucide-react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Error state - shows red border and error icon
   */
  error?: boolean
  /**
   * Error message to display
   */
  errorMessage?: string
  /**
   * Label for the input field
   */
  label?: string
  /**
   * Helper text displayed below the input
   */
  helperText?: string
  /**
   * Makes the input take full width of its container
   */
  fullWidth?: boolean
}

/**
 * Input component with error states and helper text
 * 
 * @example
 * ```tsx
 * <Input 
 *   label="Email"
 *   type="email"
 *   placeholder="john@example.com"
 *   helperText="We'll never share your email"
 * />
 * 
 * <Input 
 *   label="Password"
 *   type="password"
 *   error
 *   errorMessage="Password must be at least 8 characters"
 * />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = "text",
    error = false,
    errorMessage,
    label,
    helperText,
    fullWidth = true,
    id,
    ...props 
  }, ref) => {
    // Generate a unique ID - must be called unconditionally
    const generatedId = React.useId()
    const inputId = id || generatedId
    
    const inputClasses = cn(
      "flex h-10 w-full rounded-md border bg-secondary-50 px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-secondary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      {
        "border-secondary-300 focus-visible:ring-primary-500": !error,
        "border-error-500 focus-visible:ring-error-500": error,
        "pr-10": error, // Make room for error icon
        "w-full": fullWidth,
      },
      className
    )

    return (
      <div className={cn("space-y-1", fullWidth && "w-full")}>
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-secondary-700"
          >
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            type={type}
            className={inputClasses}
            ref={ref}
            aria-invalid={error}
            aria-describedby={
              errorMessage ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
          {error && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <AlertCircle className="h-5 w-5 text-error-500" aria-hidden="true" />
            </div>
          )}
        </div>
        {errorMessage && (
          <p id={`${inputId}-error`} className="text-sm text-error-500">
            {errorMessage}
          </p>
        )}
        {helperText && !errorMessage && (
          <p id={`${inputId}-helper`} className="text-sm text-secondary-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }