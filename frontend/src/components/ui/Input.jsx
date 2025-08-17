import React from 'react'
import { cn } from '../../utils/helpers'

const Input = React.forwardRef(({
    className,
    type = 'text',
    error,
    label,
    required,
    ...props
}, ref) => {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                type={type}
                className={cn(
                    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
                    error && 'border-red-500 focus:ring-red-500',
                    className
                )}
                ref={ref}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    )
})

const Textarea = React.forwardRef(({
    className,
    error,
    label,
    required,
    rows = 4,
    ...props
}, ref) => {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <textarea
                rows={rows}
                className={cn(
                    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-vertical',
                    error && 'border-red-500 focus:ring-red-500',
                    className
                )}
                ref={ref}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    )
})

const Select = React.forwardRef(({
    className,
    error,
    label,
    required,
    children,
    placeholder,
    ...props
}, ref) => {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <select
                className={cn(
                    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
                    error && 'border-red-500 focus:ring-red-500',
                    className
                )}
                ref={ref}
                {...props}
            >
                {placeholder && (
                    <option value="">{placeholder}</option>
                )}
                {children}
            </select>
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    )
})

Input.displayName = 'Input'
Textarea.displayName = 'Textarea'
Select.displayName = 'Select'

export { Input, Textarea, Select }
