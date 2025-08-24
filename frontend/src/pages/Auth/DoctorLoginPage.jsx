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

const DoctorLoginPage = () => {
    const [formData, setFormData] = useState({
        phone_number: '',
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const from = location.state?.from?.pathname || '/doctor/dashboard'

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await authService.loginDoctor({
                phone_number: formData.phone_number,
                password: formData.password
            })

            // Extract user and token from the response
            const { data } = response
            const { user, token } = data

            if (!user || !token) {
                throw new Error('Invalid login response')
            }

            await login(user, token, 'doctor')

            toast.success('Đăng nhập thành công!')
            navigate(from, { replace: true })

        } catch (error) {
            console.error('Login error:', error)
            toast.error(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-8"
                    >
                        <Link to="/" className="inline-flex items-center space-x-2 mb-6">
                            <div className="bg-purple-600 p-2 rounded-xl">
                                <Heart className="h-8 w-8 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900 font-medical">MediCare</span>
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập Bác sĩ</h1>
                        <p className="text-gray-600">Chào mừng đội ngũ bác sĩ trở lại</p>
                    </motion.div>

                    {/* Login Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Card className="border-0 medical-shadow">
                            <CardHeader className="text-center pb-4">
                                <CardTitle className="text-xl flex items-center justify-center space-x-2">
                                    <span className="text-2xl">👨‍⚕️</span>
                                    <span>Đăng nhập Bác sĩ</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="relative">
                                        <Input
                                            type="tel"
                                            name="phone_number"
                                            label="Số điện thoại"
                                            placeholder="Nhập số điện thoại của bạn"
                                            value={formData.phone_number}
                                            onChange={handleInputChange}
                                            required
                                            className="pl-10"
                                        />
                                        <Phone className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                                    </div>

                                    <div className="relative">
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            label="Mật khẩu"
                                            placeholder="Nhập mật khẩu của bạn"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                            className="pl-10 pr-10"
                                        />
                                        <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>

                                    <Button
                                        type="submit"
                                        loading={loading}
                                        className="w-full py-3 text-lg bg-purple-600 hover:bg-purple-700"
                                        disabled={!formData.phone_number || !formData.password}
                                    >
                                        Đăng nhập
                                    </Button>
                                </form>

                                {/* Other Login Options */}
                                <div className="text-center pt-4 border-t border-gray-200">
                                    <p className="text-gray-600 mb-3">Đăng nhập với vai trò khác:</p>
                                    <div className="flex space-x-2">
                                        <Link
                                            to="/patient/login"
                                            className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                        >
                                            Bệnh nhân
                                        </Link>
                                        <Link
                                            to="/nurse/login"
                                            className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                        >
                                            Y tá
                                        </Link>
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

export default DoctorLoginPage
