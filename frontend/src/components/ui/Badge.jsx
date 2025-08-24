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
        primary: 'bg-blue-100 text-blue-800 border border-blue-200',
        success: 'bg-green-100 text-green-800 border border-green-200',
        warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        danger: 'bg-red-100 text-red-800 border border-red-200',
        info: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
        outline: 'bg-white text-gray-700 border border-gray-300',
    }

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    }

    return (
        <span
            className={cn(
                'inline-flex items-center font-medium rounded-full',
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
