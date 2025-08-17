import clsx from 'clsx'

// Utility function for conditional class names
export const cn = (...classes) => {
    return clsx(classes)
}

// Format currency
export const formatCurrency = (amount, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currency,
    }).format(amount)
}

// Format date
export const formatDate = (date, options = {}) => {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
    }

    return new Intl.DateTimeFormat('vi-VN', defaultOptions).format(new Date(date))
}

// Format time
export const formatTime = (date) => {
    return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date))
}

// Format date and time
export const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date))
}

// Validate email
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Validate phone number (Vietnamese format)
export const isValidPhone = (phone) => {
    const phoneRegex = /^(\+84|84|0[3|5|7|8|9])+([0-9]{8})$/
    return phoneRegex.test(phone)
}

// Generate avatar URL from name
export const generateAvatarUrl = (name) => {
    const initials = name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0ea5e9&color=ffffff&size=156`
}

// Debounce function
export const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

// File size formatter
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Image file validation
export const isValidImageFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    return validTypes.includes(file.type) && file.size <= maxSize
}

// Resize image to specific dimensions
export const resizeImage = (file, width = 156, height = 156, quality = 0.8) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        img.onload = () => {
            canvas.width = width
            canvas.height = height

            ctx.drawImage(img, 0, 0, width, height)

            canvas.toBlob(resolve, 'image/jpeg', quality)
        }

        img.src = URL.createObjectURL(file)
    })
}

// Get role display name
export const getRoleDisplayName = (role) => {
    const roleNames = {
        patient: 'Bệnh nhân',
        nurse: 'Y tá',
        doctor: 'Bác sĩ',
    }

    return roleNames[role] || role
}

// Get status color
export const getStatusColor = (status) => {
    const colors = {
        pending: 'text-yellow-600 bg-yellow-100',
        confirmed: 'text-blue-600 bg-blue-100',
        completed: 'text-green-600 bg-green-100',
        cancelled: 'text-red-600 bg-red-100',
    }

    return colors[status] || 'text-gray-600 bg-gray-100'
}

// Local storage helpers
export const storage = {
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key)
            return item ? JSON.parse(item) : defaultValue
        } catch (error) {
            console.error(`Error getting ${key} from localStorage:`, error)
            return defaultValue
        }
    },

    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
            console.error(`Error setting ${key} to localStorage:`, error)
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key)
        } catch (error) {
            console.error(`Error removing ${key} from localStorage:`, error)
        }
    },

    clear: () => {
        try {
            localStorage.clear()
        } catch (error) {
            console.error('Error clearing localStorage:', error)
        }
    }
}
