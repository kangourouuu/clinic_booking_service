import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Calendar, FileText, Home } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams()
    const sessionId = searchParams.get('session_id')
    const [paymentInfo, setPaymentInfo] = useState(null)

    useEffect(() => {
        // You can call an API to verify payment status with session_id
        // For now, we'll show a success message
        if (sessionId) {
            setPaymentInfo({
                sessionId,
                status: 'completed',
                message: 'Thanh toán thành công!'
            })
        }
    }, [sessionId])

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        {/* Success Icon */}
                        <div className="mb-8 flex justify-center">
                            <div className="bg-green-100 p-6 rounded-full">
                                <CheckCircle className="h-16 w-16 text-green-600" />
                            </div>
                        </div>

                        {/* Success Message */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Đăng ký dịch vụ thành công!
                        </h1>
                        <p className="text-gray-600 text-lg mb-8">
                            Cảm ơn bạn đã thanh toán. Dịch vụ của bạn đã được đăng ký thành công.
                        </p>

                        {/* Payment Info Card */}
                        {paymentInfo && (
                            <Card className="mb-8 text-left">
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Thông tin thanh toán</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Mã giao dịch:</span>
                                            <span className="font-mono text-sm">{paymentInfo.sessionId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Trạng thái:</span>
                                            <span className="text-green-600 font-semibold">Thành công</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Thời gian:</span>
                                            <span>{new Date().toLocaleString('vi-VN')}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Next Steps */}
                        <Card className="mb-8 text-left">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Bước tiếp theo</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                        <span>Bạn sẽ được xếp vào hàng chờ để thực hiện dịch vụ</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        <span>Kiểm tra lịch sử đăng ký trong trang cá nhân</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/patient/bookings"
                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Xem lịch sử đăng ký
                            </Link>
                            <Link
                                to="/patient/dashboard"
                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                <Home className="h-4 w-4 mr-2" />
                                Về trang chủ
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </Layout>
    )
}

export default PaymentSuccess
