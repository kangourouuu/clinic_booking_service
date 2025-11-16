import React from 'react'
import { cn } from '../../utils/helpers'

const Button = React.forwardRef(({
    className,
    variant = 'primary',
    size = 'md',
    children,
    disabled,
    loading,
    asChild, // Destructure and ignore asChild prop
    ...props
}, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-medical transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95'

    const variants = {
        primary: 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white focus:ring-primary-300 shadow-medical hover:shadow-medical-lg hover:-translate-y-0.5',
        secondary: 'bg-white hover:bg-gray-50 text-primary-700 border-2 border-primary-300 focus:ring-primary-200 shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5',
        outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-300 hover:-translate-y-0.5',
        ghost: 'text-gray-700 hover:bg-primary-50 hover:text-primary-700 focus:ring-primary-200',
        danger: 'bg-gradient-to-r from-error-600 to-error-700 hover:from-error-700 hover:to-error-800 text-white focus:ring-error-300 shadow-soft hover:shadow-soft-lg',
        success: 'bg-gradient-to-r from-success-600 to-success-700 hover:from-success-700 hover:to-success-800 text-white focus:ring-success-300 shadow-soft hover:shadow-soft-lg',
        teal: 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white focus:ring-teal-300 shadow-soft hover:shadow-soft-lg',
    }

    const sizes = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg',
    }

    return (
        <button
            ref={ref}
            className={cn(
                baseClasses,
                variants[variant],
                sizes[size],
                loading && 'cursor-wait',
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            {children}
        </button>
    )
})

Button.displayName = 'Button'

export default Button
