import React, { createContext, useContext, useState, useEffect } from 'react'
import { setAuthToken } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [role, setRole] = useState(null) // 'patient', 'nurse', 'doctor'
    const [loading, setLoading] = useState(true)

    // Cookie helper functions
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    const setCookie = (name, value, days = 7) => {
        const expires = new Date(Date.now() + days * 864e5).toUTCString()
        document.cookie = `${name}=${value}; expires=${expires}; path=/; secure=false; samesite=lax`
    }

    const deleteCookie = (name) => {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    }

    // Initialize auth state from storage
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const cookieToken = getCookie('clinic_token')
                const savedToken = localStorage.getItem('clinic_token')
                const savedUser = localStorage.getItem('clinic_user')
                const savedRole = localStorage.getItem('clinic_role')

                const authToken = cookieToken || savedToken

                if (authToken && savedUser && savedRole) {
                    let userData = null
                    try {
                        // Check if savedUser is not empty or just whitespace
                        if (!savedUser || savedUser.trim() === '' || savedUser === 'undefined' || savedUser === 'null') {
                            console.warn('Invalid user data in localStorage:', savedUser)
                            clearAuthData()
                            return
                        }
                        userData = JSON.parse(savedUser)
                    } catch (parseError) {
                        console.error('Error parsing user data:', parseError)
                        console.error('Saved user data:', savedUser)
                        clearAuthData()
                        return
                    }

                    setToken(authToken)
                    setUser(userData)
                    setRole(savedRole)
                    setAuthToken(authToken)
                    setCookie('clinic_token', authToken)
                } else {
                    // Clear any incomplete auth data
                    if (authToken || savedUser || savedRole) {
                        console.warn('Incomplete auth data found, clearing...')
                        clearAuthData()
                    }
                }
            } catch (error) {
                console.error('Error initializing auth:', error)
                clearAuthData()
            } finally {
                setLoading(false)
            }
        }

        initializeAuth()
    }, [])

    const clearAuthData = () => {
        localStorage.removeItem('clinic_token')
        localStorage.removeItem('clinic_user')
        localStorage.removeItem('clinic_role')
        deleteCookie('clinic_token')
        setUser(null)
        setToken(null)
        setRole(null)
        setAuthToken(null)
    }

    const login = async (userData, authToken, userRole) => {
        try {
            setUser(userData)
            setToken(authToken)
            setRole(userRole)
            setAuthToken(authToken)

            // Store in both localStorage and cookie
            localStorage.setItem('clinic_token', authToken)
            localStorage.setItem('clinic_user', JSON.stringify(userData))
            localStorage.setItem('clinic_role', userRole)
            setCookie('clinic_token', authToken)

            // Don't show toast here, let the calling component handle it
            // toast.success(`Welcome back, ${userData.name || userData.email}!`)

            return true
        } catch (error) {
            console.error('Error during login:', error)
            // Don't show toast here either, let the calling component handle it
            // toast.error('Login failed. Please try again.')
            return false
        }
    }

    const logout = async () => {
        try {
            clearAuthData()
            toast.success('Logged out successfully')

            // Redirect to home page
            window.location.href = '/'
        } catch (error) {
            console.error('Error during logout:', error)
            toast.error('Logout failed. Please try again.')
        }
    }

    const updateUser = (updatedUserData) => {
        try {
            setUser(updatedUserData)
            localStorage.setItem('clinic_user', JSON.stringify(updatedUserData))
            toast.success('Profile updated successfully!')
        } catch (error) {
            console.error('Error updating user:', error)
            toast.error('Failed to update profile')
        }
    }

    const value = {
        user,
        token,
        role,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!token && !!user,
        isPatient: role === 'patient',
        isNurse: role === 'nurse',
        isDoctor: role === 'doctor',
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider
