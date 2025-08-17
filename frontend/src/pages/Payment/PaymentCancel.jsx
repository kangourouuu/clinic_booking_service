import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const PaymentCancel = () => {
    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        {/* Cancel Icon */}
                        <div className="mb-8 flex justify-center">
                            <div className="bg-red-100 p-6 rounded-full">
                                <XCircle className="h-16 w-16 text-red-600" />
                            </div>
                        </div>

                        {/* Cancel Message */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Thanh toán đã bị hủy
                        </h1>
                        <p className="text-gray-600 text-lg mb-8">
                            Bạn đã hủy quá trình thanh toán. Dịch vụ chưa được đăng ký.
                        </p>

                        {/* Info Card */}
                        <Card className="mb-8 text-left">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Thông tin</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <CreditCard className="h-5 w-5 text-gray-500" />
                                        <span>Không có khoản phí nào được tính</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <ArrowLeft className="h-5 w-5 text-gray-500" />
                                        <span>Bạn có thể quay lại và thử lại bất cứ lúc nào</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/patient/service-registration"
                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Thử lại thanh toán
                            </Link>
                            <Link
                                to="/patient/dashboard"
                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                Về trang chủ
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </Layout>
    )
}

export default PaymentCancel
