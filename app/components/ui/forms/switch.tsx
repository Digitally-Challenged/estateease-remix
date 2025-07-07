import * as React from "react"
import { cn } from "~/lib/utils"

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /**
   * Label text to display next to the switch
   */
  label?: string
  /**
   * Helper text to display below the switch
   */
  helperText?: string
  /**
   * Size of the switch
   */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Switch toggle component for boolean values
 * 
 * @example
 * ```tsx
 * <Switch 
 *   label="Enable notifications"
 *   helperText="You'll receive updates about your account"
 * />
 * 
 * <Switch 
 *   label="Dark mode"
 *   size="lg"
 *   defaultChecked
 * />
 * ```
 */
const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ 
    label,
    helperText,
    size = 'md',
    id,
    ...props 
  }, ref) => {
    const generatedId = React.useId()
    const switchId = id || generatedId
    
    const sizeClasses = {
      sm: {
        track: "h-5 w-9",
        thumb: "h-4 w-4 translate-x-0 peer-checked:translate-x-4",
      },
      md: {
        track: "h-6 w-11",
        thumb: "h-5 w-5 translate-x-0 peer-checked:translate-x-5",
      },
      lg: {
        track: "h-7 w-14",
        thumb: "h-6 w-6 translate-x-0 peer-checked:translate-x-7",
      },
    }

    return (
      <div className="space-y-1">
        <div className="flex items-start">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              ref={ref}
              type="checkbox"
              id={switchId}
              className="peer sr-only"
              role="switch"
              aria-checked={props.checked || props.defaultChecked}
              {...props}
            />
            <span 
              className={cn(
                "block rounded-full bg-secondary-200 transition-colors peer-checked:bg-primary-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                sizeClasses[size].track
              )}
            >
              <span 
                className={cn(
                  "absolute left-0.5 top-0.5 rounded-full bg-white shadow-sm transition-transform",
                  sizeClasses[size].thumb
                )}
              />
            </span>
            {label && (
              <span className="ml-3 text-sm font-medium text-secondary-700">
                {label}
              </span>
            )}
          </label>
        </div>
        {helperText && (
          <p className="ml-14 text-sm text-secondary-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }