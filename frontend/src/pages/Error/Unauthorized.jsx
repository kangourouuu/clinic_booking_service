import React from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Button from '../../components/ui/Button'
import { Shield, Home, ArrowLeft } from 'lucide-react'

const Unauthorized = () => {
    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full text-center">
                    <div className="mb-8">
                        <Shield className="h-24 w-24 text-red-500 mx-auto mb-4" />
                        <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Không có quyền truy cập</h2>
                        <p className="text-gray-600">
                            Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Link to="/">
                            <Button className="w-full">
                                <Home className="h-4 w-4 mr-2" />
                                Về trang chủ
                            </Button>
                        </Link>

                        <button
                            onClick={() => window.history.back()}
                            className="w-full flex items-center justify-center text-primary-600 hover:text-primary-700 font-medium"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại trang trước
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Unauthorized
