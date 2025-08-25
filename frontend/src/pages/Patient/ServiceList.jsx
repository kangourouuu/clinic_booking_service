import React from 'react'
import Layout from '../../components/layout/Layout'
import { Stethoscope } from 'lucide-react'

const ServiceList = () => {
    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Danh sách dịch vụ</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Tìm kiếm và lựa chọn dịch vụ y tế phù hợp với nhu cầu của bạn.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <Stethoscope className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800">Chưa có dữ liệu dịch vụ</h3>
                        <p className="mt-2 text-gray-600">Thông tin dịch vụ sẽ hiển thị tại đây sau khi có dữ liệu.</p>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default ServiceList