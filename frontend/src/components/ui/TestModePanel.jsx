import React, { useState } from 'react'
import { Trash2, RefreshCw, TestTube } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const TestModePanel = () => {
    const { logout } = useAuth()
    const [isVisible, setIsVisible] = useState(false)

    const clearAllStorage = () => {
        try {
            // Clear localStorage
            localStorage.clear()

            // Clear sessionStorage
            sessionStorage.clear()

            // Clear cookies
            document.cookie.split(";").forEach(function (c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            })

            toast.success('Đã xóa tất cả dữ liệu storage!')

            // Reload page after 1 second
            setTimeout(() => {
                window.location.reload()
            }, 1000)
        } catch (error) {
            console.error('Error clearing storage:', error)
            toast.error('Lỗi khi xóa storage')
        }
    }

    const logoutAndClear = async () => {
        try {
            await logout()
            clearAllStorage()
        } catch (error) {
            console.error('Error during logout and clear:', error)
            clearAllStorage()
        }
    }

    const openRoleSelector = () => {
        window.location.href = '/patient/login'
    }

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Toggle Button */}
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-200"
                title="Test Mode Panel"
            >
                <TestTube className="h-5 w-5" />
            </button>

            {/* Panel */}
            {isVisible && (
                <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border p-4 w-64">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Mode Panel
                    </h3>

                    <div className="space-y-2">
                        <button
                            onClick={openRoleSelector}
                            className="w-full flex items-center justify-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors duration-200"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Chọn Role Khác
                        </button>

                        <button
                            onClick={logoutAndClear}
                            className="w-full flex items-center justify-center px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded transition-colors duration-200"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Logout + Clear
                        </button>

                        <button
                            onClick={clearAllStorage}
                            className="w-full flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors duration-200"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear All Storage
                        </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                            Development Mode Only
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TestModePanel
