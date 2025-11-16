import React from 'react'
import { cn } from '../../utils/helpers'

const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    className,
    icon: Icon,
    ...props
}) => {
    const variants = {
        default: 'bg-gray-100 text-gray-800 border border-gray-200',
        primary: 'bg-primary-100 text-primary-800 border border-primary-200',
        success: 'bg-success-100 text-success-800 border border-success-200',
        warning: 'bg-warning-100 text-warning-800 border border-warning-200',
        danger: 'bg-error-100 text-error-800 border border-error-200',
        info: 'bg-primary-50 text-primary-700 border border-primary-100',
        teal: 'bg-teal-100 text-teal-800 border border-teal-200',
        outline: 'bg-white text-gray-700 border border-gray-300',
        medical: 'bg-gradient-to-r from-primary-100 to-teal-100 text-primary-800 border border-primary-200',
    }

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    }

    return (
        <span
            className={cn(
                'inline-flex items-center font-medium rounded-full transition-all duration-200',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {Icon && <Icon className="h-3 w-3 mr-1.5" />}
            {children}
        </span>
    )
}

export default Badge
