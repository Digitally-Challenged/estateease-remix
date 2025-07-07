import * as React from "react"
import { cn } from "~/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Error state - shows red border
   */
  error?: boolean
  /**
   * Auto-resize to fit content
   */
  autoResize?: boolean
  /**
   * Show character count
   */
  showCount?: boolean
  /**
   * Makes the textarea take full width of its container
   */
  fullWidth?: boolean
}

/**
 * Textarea component with auto-resize and character count features
 * 
 * @example
 * ```tsx
 * <Textarea 
 *   placeholder="Enter your message..."
 *   rows={3}
 * />
 * 
 * <Textarea 
 *   placeholder="Description"
 *   autoResize
 *   showCount
 *   maxLength={500}
 * />
 * ```
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    error = false,
    autoResize = false,
    showCount = false,
    fullWidth = true,
    maxLength,
    onChange,
    ...props 
  }, ref) => {
    const [value, setValue] = React.useState(props.defaultValue || props.value || "")
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    
    // Combine refs
    React.useImperativeHandle(ref, () => textareaRef.current!, [])
    
    // Auto-resize functionality
    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current
        textarea.style.height = "auto"
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }, [value, autoResize])
    
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value)
      onChange?.(e)
    }
    
    const textareaClasses = cn(
      "flex min-h-[80px] w-full rounded-md border bg-secondary-50 px-3 py-2 text-sm transition-colors placeholder:text-secondary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      {
        "border-secondary-300 focus-visible:ring-primary-500": !error,
        "border-error-500 focus-visible:ring-error-500": error,
        "w-full": fullWidth,
        "resize-none": autoResize,
      },
      className
    )

    return (
      <div className={cn("space-y-1", fullWidth && "w-full")}>
        <textarea
          ref={textareaRef}
          className={textareaClasses}
          onChange={handleChange}
          aria-invalid={error}
          maxLength={maxLength}
          {...props}
        />
        {showCount && (
          <div className="text-xs text-secondary-500 text-right">
            {String(value).length}
            {maxLength && ` / ${maxLength}`}
          </div>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }