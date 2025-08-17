import React from 'react'
import Header from './Header'
import Footer from './Footer'
import { Loading } from '../ui/Loading'
import TestModePanel from '../ui/TestModePanel'
import { useAuth } from '../../context/AuthContext'

const Layout = ({ children }) => {
    const { loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loading size="lg" text="Đang tải..." />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
            <TestModePanel />
        </div>
    )
}

export default Layout
