import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, UserCheck, Stethoscope, Users } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'

const LoginPage = () => {
    const roleOptions = [
        {
            role: 'patient',
            title: 'Bệnh Nhân',
            description: 'Đặt lịch khám, xem kết quả và quản lý sức khỏe',
            icon: Heart,
            color: 'from-blue-500 to-cyan-600',
            hoverColor: 'hover:from-blue-600 hover:to-cyan-700',
            path: '/patient/login',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            role: 'nurse',
            title: 'Y Tá',
            description: 'Quản lý hàng đợi và hỗ trợ bệnh nhân',
            icon: UserCheck,
            color: 'from-green-500 to-emerald-600',
            hoverColor: 'hover:from-green-600 hover:to-emerald-700',
            path: '/nurse/login',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600'
        },
        {
            role: 'doctor',
            title: 'Bác Sĩ',
            description: 'Khám bệnh, chẩn đoán và điều trị',
            icon: Stethoscope,
            color: 'from-purple-500 to-violet-600',
            hoverColor: 'hover:from-purple-600 hover:to-violet-700',
            path: '/doctor/login',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600'
        }
    ]

    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl w-full space-y-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6">
                            <Users className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Chọn Vai Trò Đăng Nhập
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Vui lòng chọn vai trò của bạn để truy cập vào hệ thống quản lý phòng khám
                        </p>
                    </motion.div>

                    {/* Role Selection Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {roleOptions.map((option, index) => {
                            const IconComponent = option.icon
                            return (
                                <motion.div
                                    key={option.role}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * (index + 1) }}
                                    whileHover={{ y: -5 }}
                                    className="h-full"
                                >
                                    <Link to={option.path}>
                                        <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm group cursor-pointer">
                                            <CardHeader className="text-center pb-4">
                                                <div className={`mx-auto w-16 h-16 bg-gradient-to-r ${option.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                                    <IconComponent className="h-8 w-8 text-white" />
                                                </div>
                                                <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
                                                    {option.title}
                                                </CardTitle>
                                            </CardHeader>

                                            <CardContent className="text-center">
                                                <p className="text-gray-600 mb-6 leading-relaxed">
                                                    {option.description}
                                                </p>

                                                <div className={`inline-flex items-center justify-center w-full py-3 px-6 bg-gradient-to-r ${option.color} ${option.hoverColor} text-white font-medium rounded-lg transition-all duration-300 transform group-hover:scale-105`}>
                                                    Đăng Nhập
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            )
                        })}
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center pt-8"
                    >
                        <div className="border-t border-gray-200 pt-6">
                            <p className="text-sm text-gray-500 mb-4">
                                Bạn là bệnh nhân mới?
                            </p>
                            <Link
                                to="/auth/register"
                                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 font-medium"
                            >
                                Đăng Ký Tài Khoản Bệnh Nhân
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </Layout>
    )
}

export default LoginPage
