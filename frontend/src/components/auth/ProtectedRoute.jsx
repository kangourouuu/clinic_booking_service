import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Loading } from '../ui/Loading'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, role, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loading size="lg" text="Đang xác thực..." />
            </div>
        )
    }

    if (!isAuthenticated) {
        // Redirect to login page with return url
        return <Navigate to="/auth/login" state={{ from: location }} replace />
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        // Redirect to appropriate dashboard based on role
        const dashboardRoute = `/${role}/dashboard`
        return <Navigate to={dashboardRoute} replace />
    }

    return children
}

export default ProtectedRoute
