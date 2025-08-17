import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
    Heart,
    User,
    Menu,
    X,
    Phone,
    Mail,
    MapPin,
    LogOut,
    Settings,
    Bell
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'
import { cn } from '../../utils/helpers'

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { user, role, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    const isActive = (path) => location.pathname === path

    // Navigation for different roles
    const getNavigationForRole = () => {
        if (!isAuthenticated) {
            return [
                { name: 'Trang chủ', href: '/' },
                { name: 'Dịch vụ', href: '/services' },
                { name: 'Về chúng tôi', href: '/about' },
                { name: 'Liên hệ', href: '/contact' },
            ]
        }

        switch (role) {
            case 'patient':
                return [
                    { name: 'Dashboard', href: '/patient/dashboard' },
                    { name: 'Dịch vụ', href: '/patient/services' },
                    { name: 'Đăng ký dịch vụ', href: '/patient/service-registration' },
                    { name: 'Lịch hẹn', href: '/patient/bookings' },
                    { name: 'Hồ sơ y tế', href: '/patient/medical-history' },
                ]
            case 'nurse':
                return [
                    { name: 'Dashboard', href: '/nurse/dashboard' },
                    { name: 'Quản lý dịch vụ', href: '/nurse/services' },
                    { name: 'Hàng đợi', href: '/nurse/queue' },
                ]
            case 'doctor':
                return [
                    { name: 'Dashboard', href: '/doctor/dashboard' },
                    { name: 'Lịch làm việc', href: '/doctor/schedule' },
                    { name: 'Bệnh nhân', href: '/doctor/patients' },
                ]
            default:
                return [
                    { name: 'Trang chủ', href: '/' },
                    { name: 'Dịch vụ', href: '/services' },
                    { name: 'Về chúng tôi', href: '/about' },
                    { name: 'Liên hệ', href: '/contact' },
                ]
        }
    }

    const navigation = getNavigationForRole()

    return (
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
            {/* Top contact bar */}
            <div className="bg-primary-50 border-b border-primary-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-2 text-sm">
                        <div className="flex items-center space-x-6 text-primary-700">
                            <div className="flex items-center space-x-2">
                                <Phone className="h-3 w-3" />
                                <span>1900 1234</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Mail className="h-3 w-3" />
                                <span>info@medicare.vn</span>
                            </div>
                            <div className="hidden md:flex items-center space-x-2">
                                <MapPin className="h-3 w-3" />
                                <span>123 Nguyễn Văn Cừ, Q1, TP.HCM</span>
                            </div>
                        </div>
                        <div className="text-primary-600">
                            <span>Giờ làm việc: 7:00 - 21:00 (T2-CN)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="bg-primary-600 p-2 rounded-xl">
                            <Heart className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 font-medical">MediCare</h1>
                            <p className="text-sm text-gray-600">Professional Healthcare</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    'text-sm font-medium transition-colors duration-200',
                                    isActive(item.href)
                                        ? 'text-primary-600 border-b-2 border-primary-600 pb-1'
                                        : 'text-gray-700 hover:text-primary-600'
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Auth buttons */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-3">
                                {/* Notifications */}
                                <button className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
                                    <Bell className="h-5 w-5" />
                                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                                        3
                                    </span>
                                </button>

                                {/* User menu */}
                                <div className="relative group">
                                    <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                            <User className="h-4 w-4 text-primary-600" />
                                        </div>
                                        <div className="hidden md:block text-left">
                                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                            <p className="text-xs text-gray-600 capitalize">{role}</p>
                                        </div>
                                    </button>

                                    {/* Dropdown menu */}
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <Link
                                            to={`/${role}/profile`}
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <Settings className="h-4 w-4 mr-3" />
                                            Hồ sơ cá nhân
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="h-4 w-4 mr-3" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate('/auth/login')}
                                    className="hidden sm:inline-flex"
                                >
                                    Đăng nhập
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => navigate('/auth/register')}
                                >
                                    Đăng ký
                                </Button>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="lg:hidden border-t border-gray-200 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <nav className="space-y-3">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={cn(
                                        'block py-2 text-base font-medium transition-colors duration-200',
                                        isActive(item.href)
                                            ? 'text-primary-600'
                                            : 'text-gray-700 hover:text-primary-600'
                                    )}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}

                            {!isAuthenticated && (
                                <div className="pt-3 border-t border-gray-200 space-y-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            navigate('/auth/login')
                                            setIsMenuOpen(false)
                                        }}
                                        className="w-full justify-start"
                                    >
                                        Đăng nhập
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            navigate('/auth/register')
                                            setIsMenuOpen(false)
                                        }}
                                        className="w-full"
                                    >
                                        Đăng ký
                                    </Button>
                                </div>
                            )}
                        </nav>
                    </div>
                </div>
            )}
        </header>
    )
}

export default Header
