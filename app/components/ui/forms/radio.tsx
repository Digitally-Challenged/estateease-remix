import * as React from "react"
import { cn } from "~/lib/utils"

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Label text to display next to the radio button
   */
  label?: string
  /**
   * Error state - shows red border
   */
  error?: boolean
}

/**
 * Radio button component with label and custom styling
 * 
 * @example
 * ```tsx
 * <RadioGroup label="Select an option" name="options">
 *   <Radio value="1" label="Option 1" />
 *   <Radio value="2" label="Option 2" />
 *   <Radio value="3" label="Option 3" />
 * </RadioGroup>
 * ```
 */
const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ 
    className,
    label,
    error = false,
    id,
    ...props 
  }, ref) => {
    const generatedId = React.useId()
    const radioId = id || generatedId
    
    const radioClasses = cn(
      "h-4 w-4 shrink-0 rounded-full border border-secondary-300 bg-secondary-50 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      {
        "border-error-500": error,
      },
      className
    )

    return (
      <div className="flex items-start">
        <input
          ref={ref}
          type="radio"
          id={radioId}
          className={radioClasses}
          {...props}
        />
        {label && (
          <label 
            htmlFor={radioId}
            className="ml-3 text-sm font-medium leading-none cursor-pointer select-none text-secondary-700"
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)
Radio.displayName = "Radio"

/**
 * Group of radio buttons with a common label
 */
export interface RadioGroupProps {
  /**
   * Group label
   */
  label?: string
  /**
   * Whether the radio group is required
   */
  required?: boolean
  /**
   * Error message for the group
   */
  error?: string
  /**
   * Helper text for the group
   */
  helperText?: string
  /**
   * Name attribute for all radio buttons in the group
   */
  name: string
  /**
   * Child radio buttons
   */
  children: React.ReactNode
  /**
   * Additional class names
   */
  className?: string
}

export function RadioGroup({
  label,
  required,
  error,
  helperText,
  name,
  children,
  className,
}: RadioGroupProps) {
  // Clone children to pass down the name and error props
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === Radio) {
      return React.cloneElement(child, { name, error: !!error } as Partial<RadioProps>)
    }
    return child
  })

  return (
    <fieldset className={cn("space-y-3", className)}>
      {label && (
        <legend className="text-sm font-medium text-secondary-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </legend>
      )}
      <div className="space-y-2" role="radiogroup" aria-required={required}>
        {childrenWithProps}
      </div>
      {error && (
        <p className="text-sm text-error-500" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-secondary-500">
          {helperText}
        </p>
      )}
    </fieldset>
  )
}

export { Radio }