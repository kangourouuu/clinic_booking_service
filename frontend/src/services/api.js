import axios from 'axios'
import toast from 'react-hot-toast'

// Use relative path in development to leverage Vite proxy
// Vite will proxy /api requests to http://localhost:9000
const API_BASE_URL = '/api'

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for cookies
})

// Token management
let authToken = null

export const setAuthToken = (token) => {
    authToken = token
    if (token) {
        // Set token as cookie
        const expires = new Date(Date.now() + 7 * 864e5).toUTCString()
        document.cookie = `clinic_token=${token}; expires=${expires}; path=/; secure=false; samesite=lax`
    } else {
        // Clear cookie
        document.cookie = 'clinic_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
}

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Ensure cookie is set for requests
        if (authToken) {
            const expires = new Date(Date.now() + 7 * 864e5).toUTCString()
            document.cookie = `clinic_token=${authToken}; expires=${expires}; path=/; secure=false; samesite=lax`
        }

        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`)
        return config
    },
    (error) => {
        console.error('Request error:', error)
        return Promise.reject(error)
    }
)

// Response interceptor
api.interceptors.response.use(
    (response) => {
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`)
        return response
    },
    (error) => {
        console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data || error.message)

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            setAuthToken(null)
            localStorage.removeItem('clinic_token')
            localStorage.removeItem('clinic_user')
            localStorage.removeItem('clinic_role')
            toast.error('Session expired. Please login again.')

            // Redirect to login if not already there
            if (!window.location.pathname.includes('/auth')) {
                window.location.href = '/auth/login'
            }
        }

        // Handle other errors
        if (error.response?.status >= 500) {
            toast.error('Server error. Please try again later.')
        }

        return Promise.reject(error)
    }
)

// Helper function to handle file upload
export const uploadFile = async (file, onUploadProgress) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onUploadProgress) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    )
                    onUploadProgress(percentCompleted)
                }
            },
        })

        return response.data
    } catch (error) {
        console.error('Upload error:', error)
        throw error
    }
}

export default api
