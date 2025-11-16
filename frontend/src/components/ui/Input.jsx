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
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-error-500 ml-1">*</span>}
                </label>
            )}
            <input
                type={type}
                className={cn(
                    'w-full px-4 py-3 border-2 border-gray-200 rounded-medical bg-white text-gray-900 placeholder-gray-400',
                    'focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-400',
                    'transition-all duration-200',
                    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
                    error && 'border-error-400 focus:ring-error-200 focus:border-error-500',
                    className
                )}
                ref={ref}
                {...props}
            />
            {error && (
                <p className="text-sm text-error-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
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
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-error-500 ml-1">*</span>}
                </label>
            )}
            <textarea
                rows={rows}
                className={cn(
                    'w-full px-4 py-3 border-2 border-gray-200 rounded-medical bg-white text-gray-900 placeholder-gray-400',
                    'focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-400',
                    'transition-all duration-200 resize-vertical',
                    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
                    error && 'border-error-400 focus:ring-error-200 focus:border-error-500',
                    className
                )}
                ref={ref}
                {...props}
            />
            {error && (
                <p className="text-sm text-error-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
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
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-error-500 ml-1">*</span>}
                </label>
            )}
            <select
                className={cn(
                    'w-full px-4 py-3 border-2 border-gray-200 rounded-medical bg-white text-gray-900',
                    'focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-400',
                    'transition-all duration-200',
                    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
                    error && 'border-error-400 focus:ring-error-200 focus:border-error-500',
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
                <p className="text-sm text-error-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    )
})

Input.displayName = 'Input'
Textarea.displayName = 'Textarea'
Select.displayName = 'Select'

export { Input, Textarea, Select }
