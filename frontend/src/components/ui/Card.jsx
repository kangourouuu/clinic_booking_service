import React from 'react'
import { cn } from '../../utils/helpers'

const Card = React.forwardRef(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'bg-white rounded-xl shadow-sm border border-gray-200',
            className
        )}
        {...props}
    >
        {children}
    </div>
))

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
            'text-lg font-semibold leading-none tracking-tight text-gray-900',
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
        className={cn('text-sm text-gray-600 mt-1', className)}
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
