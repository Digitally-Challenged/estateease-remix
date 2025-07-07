import * as React from "react"
import { cn } from "~/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /**
   * Error state - shows red border
   */
  error?: boolean
  /**
   * Options to display in the select
   */
  options: SelectOption[]
  /**
   * Placeholder text when no value is selected
   */
  placeholder?: string
  /**
   * Makes the select take full width of its container
   */
  fullWidth?: boolean
}

/**
 * Select component with consistent styling
 * 
 * @example
 * ```tsx
 * <Select 
 *   placeholder="Choose an option"
 *   options={[
 *     { value: '1', label: 'Option 1' },
 *     { value: '2', label: 'Option 2' },
 *     { value: '3', label: 'Option 3', disabled: true }
 *   ]}
 * />
 * ```
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    error = false,
    options,
    placeholder = "Select an option",
    fullWidth = true,
    ...props 
  }, ref) => {
    const selectClasses = cn(
      "relative flex h-10 w-full appearance-none rounded-md border bg-secondary-50 px-3 py-2 pr-10 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      {
        "border-secondary-300 focus-visible:ring-primary-500": !error,
        "border-error-500 focus-visible:ring-error-500": error,
        "w-full": fullWidth,
      },
      className
    )

    return (
      <div className={cn("relative", fullWidth && "w-full")}>
        <select
          ref={ref}
          className={selectClasses}
          aria-invalid={error}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown 
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-500" 
          aria-hidden="true"
        />
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }