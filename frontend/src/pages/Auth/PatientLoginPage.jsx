import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Heart, Lock, Phone } from 'lucide-react'
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

            if (response && response.user && response.token) {
                await login(response.user, response.token, 'patient')
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="shadow-lg border-gray-200/80">
                            <CardHeader className="text-center pb-2">
                                <div className="mx-auto w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mb-4">
                                    <Heart className="h-10 w-10 text-white" />
                                </div>
                                <CardTitle className="text-3xl font-bold text-gray-900">
                                    Đăng Nhập Bệnh Nhân
                                </CardTitle>
                                <p className="text-base text-gray-600 mt-2">
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
                                                className="pl-10 border-gray-300 focus:border-primary-500 focus:ring-primary-500"
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
                                                className="pl-10 pr-10 border-gray-300 focus:border-primary-500 focus:ring-primary-500"
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
                                                className="text-primary-600 hover:text-primary-700 transition-colors duration-200"
                                            >
                                                Quên mật khẩu?
                                            </Link>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                                    >
                                        {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                                    </Button>
                                </form>

                                <div className="mt-6 text-center">
                                    <p className="text-base text-gray-600">
                                        Chưa có tài khoản?{' '}
                                        <Link
                                            to="/auth/register"
                                            className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                                        >
                                            Đăng ký ngay
                                        </Link>
                                    </p>
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