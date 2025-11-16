import React from 'react'
import { cn } from '../../utils/helpers'

const Card = React.forwardRef(({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
        default: 'bg-white shadow-soft border border-gray-100',
        medical: 'bg-gradient-to-br from-white to-blue-50/50 shadow-medical border border-primary-100',
        hover: 'bg-white shadow-soft border border-gray-100 hover:shadow-soft-lg hover:-translate-y-1 cursor-pointer transition-all duration-300',
        glass: 'glass-medical',
    }

    return (
        <div
            ref={ref}
            className={cn(
                'rounded-medical-lg transition-all duration-300',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
})

const CardHeader = React.forwardRef(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('p-6 pb-4', className)}
        {...props}
    >
        {children}
    </div>
))

const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            'text-xl font-semibold leading-none tracking-tight text-gray-900 font-medical',
            className
        )}
        {...props}
    >
        {children}
    </h3>
))

const CardDescription = React.forwardRef(({ className, children, ...props }, ref) => (
    <p
        ref={ref}
        className={cn('text-sm text-gray-600 mt-2', className)}
        {...props}
    >
        {children}
    </p>
))

const CardContent = React.forwardRef(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('p-6 pt-0', className)}
        {...props}
    >
        {children}
    </div>
))

const CardFooter = React.forwardRef(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex items-center p-6 pt-0', className)}
        {...props}
    >
        {children}
    </div>
))

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardTitle.displayName = 'CardTitle'
CardDescription.displayName = 'CardDescription'
CardContent.displayName = 'CardContent'
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
