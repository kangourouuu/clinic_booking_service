import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Heart, Lock, Phone, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/apiServices'
import Layout from '../../components/layout/Layout'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import toast from 'react-hot-toast'

const PatientLoginPage = () => {
    const [formData, setFormData] = useState({
        phone_number: '',
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const from = location.state?.from?.pathname || '/patient/dashboard'

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await authService.loginPatient({
                phone_number: formData.phone_number,
                password: formData.password
            })

            if (response.data && response.data.user && response.data.token) {
                await login(response.data.user, response.data.token, 'patient')
                toast.success('Đăng nhập thành công!')
                navigate(from, { replace: true })
            } else {
                throw new Error('Invalid response format')
            }
        } catch (error) {
            console.error('Login error:', error)
            const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại'
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {/* Back to role selection */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <Link
                            to="/auth/login"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại chọn vai trò
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                            <CardHeader className="text-center pb-2">
                                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4">
                                    <Heart className="h-8 w-8 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-gray-900">
                                    Đăng Nhập Bệnh Nhân
                                </CardTitle>
                                <p className="text-sm text-gray-600 mt-2">
                                    Đăng nhập để truy cập hệ thống quản lý sức khỏe
                                </p>
                            </CardHeader>

                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                                            Số điện thoại
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="phone_number"
                                                name="phone_number"
                                                type="tel"
                                                autoComplete="tel"
                                                required
                                                value={formData.phone_number}
                                                onChange={handleInputChange}
                                                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="Nhập số điện thoại của bạn"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                            Mật khẩu
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                autoComplete="current-password"
                                                required
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className="pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="Nhập mật khẩu"
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm">
                                            <Link
                                                to="/auth/forgot-password"
                                                className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                            >
                                                Quên mật khẩu?
                                            </Link>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3 font-medium transition-all duration-200 transform hover:scale-105"
                                    >
                                        {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                                    </Button>
                                </form>

                                <div className="mt-6 text-center">
                                    <p className="text-sm text-gray-600">
                                        Chưa có tài khoản?{' '}
                                        <Link
                                            to="/auth/register"
                                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                                        >
                                            Đăng ký ngay
                                        </Link>
                                    </p>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="text-center space-y-2">
                                        <p className="text-sm text-gray-500">Đăng nhập với vai trò khác:</p>
                                        <div className="flex justify-center space-x-4">
                                            <Link
                                                to="/nurse/login"
                                                className="text-sm text-green-600 hover:text-green-800 transition-colors duration-200"
                                            >
                                                Y tá
                                            </Link>
                                            <span className="text-gray-300">•</span>
                                            <Link
                                                to="/doctor/login"
                                                className="text-sm text-purple-600 hover:text-purple-800 transition-colors duration-200"
                                            >
                                                Bác sĩ
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </Layout>
    )
}

export default PatientLoginPage
