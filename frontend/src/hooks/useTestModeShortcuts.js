import { useEffect } from 'react'
import toast from 'react-hot-toast'

const useTestModeShortcuts = () => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Only in development mode
            if (process.env.NODE_ENV !== 'development') return

            // Ctrl + Shift + C = Clear all storage
            if (event.ctrlKey && event.shiftKey && event.key === 'C') {
                event.preventDefault()
                clearAllStorage()
            }

            // Ctrl + Shift + L = Go to login selector
            if (event.ctrlKey && event.shiftKey && event.key === 'L') {
                event.preventDefault()
                window.location.href = '/auth/login'
            }

            // Ctrl + Shift + R = Role info
            if (event.ctrlKey && event.shiftKey && event.key === 'R') {
                event.preventDefault()
                showRoleInfo()
            }
        }

        const clearAllStorage = () => {
            try {
                localStorage.clear()
                sessionStorage.clear()
                document.cookie.split(";").forEach(function (c) {
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                })
                toast.success('🧹 Cleared all storage! (Ctrl+Shift+C)')
                setTimeout(() => window.location.reload(), 1000)
            } catch (error) {
                toast.error('Error clearing storage')
            }
        }

        const showRoleInfo = () => {
            const user = JSON.parse(localStorage.getItem('clinic_user') || '{}')
            const role = localStorage.getItem('clinic_role')
            const token = localStorage.getItem('clinic_token')

            const info = `
                👤 Role: ${role || 'None'}
                🏥 User: ${user.name || user.email || 'None'}
                🔑 Token: ${token ? '✅ Exists' : '❌ Missing'}
            `

            toast(info, {
                duration: 5000,
                style: {
                    background: '#1f2937',
                    color: '#f9fafb',
                    fontFamily: 'monospace'
                }
            })
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])
}

export default useTestModeShortcuts
