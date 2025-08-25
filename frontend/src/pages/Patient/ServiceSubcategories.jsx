import React from 'react'
import Layout from '../../components/layout/Layout'
import { ListChecks } from 'lucide-react'

const ServiceSubcategories = () => {
    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Danh mục con dịch vụ</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Khám phá các danh mục con dịch vụ y tế của chúng tôi.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <ListChecks className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800">Chưa có dữ liệu danh mục con dịch vụ</h3>
                        <p className="mt-2 text-gray-600">Thông tin danh mục con dịch vụ sẽ hiển thị tại đây sau khi có dữ liệu.</p>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default ServiceSubcategories