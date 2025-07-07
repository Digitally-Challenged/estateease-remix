import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "~/lib/utils"
import { Loader2 } from "lucide-react"

/**
 * Button variants using class-variance-authority with design tokens
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-500",
        secondary: "bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300 focus-visible:ring-secondary-500",
        destructive: "bg-error-500 text-white hover:bg-error-600 active:bg-error-700 focus-visible:ring-error-500",
        outline: "border border-secondary-300 bg-transparent text-secondary-900 hover:bg-secondary-50 active:bg-secondary-100 focus-visible:ring-secondary-500",
        ghost: "text-secondary-900 hover:bg-secondary-100 active:bg-secondary-200 focus-visible:ring-secondary-500",
        link: "text-primary-600 underline-offset-4 hover:underline active:text-primary-800 focus-visible:ring-primary-500",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Shows a loading spinner and disables the button
   */
  loading?: boolean
  /**
   * Icon to display on the left side of the button
   */
  leftIcon?: React.ReactNode
  /**
   * Icon to display on the right side of the button
   */
  rightIcon?: React.ReactNode
  /**
   * Makes the button take full width of its container
   */
  fullWidth?: boolean
  /**
   * When true, Button will render as its child element, merging props and className
   */
  asChild?: boolean
}

/**
 * Button component with multiple variants, sizes, and states
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md">
 *   Click me
 * </Button>
 * 
 * <Button variant="destructive" loading>
 *   Deleting...
 * </Button>
 * 
 * <Button variant="outline" leftIcon={<Plus />}>
 *   Add Item
 * </Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    loading = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
    asChild = false,
    ...props 
  }, ref) => {
    const buttonClasses = cn(buttonVariants({ variant, size, fullWidth, className }));
    
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        className: cn(buttonClasses, children.props.className),
        ref,
        ...props,
        ...children.props,
      });
    }
    
    return (
      <button
        className={buttonClasses}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {!loading && leftIcon && (
          <span className="mr-2" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        {children}
        {rightIcon && (
          <span className="ml-2" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }