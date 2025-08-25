import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Layout from '../../components/layout/Layout'
import {
    User,
    Calendar,
    Clock,
    Phone,
    Mail,
    MapPin,
    ChevronDown,
    Check,
    AlertCircle,
    Loader
} from 'lucide-react'
import { patientService } from '../../services/apiServices'
import { useAuth } from '../../context/AuthContext'

const ServiceRegistration = () => {
    const { user } = useAuth()
    const [categories, setCategories] = useState([])
    const [subcategories, setSubcategories] = useState([])
    const [services, setServices] = useState([])

    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedSubcategory, setSelectedSubcategory] = useState('')
    const [selectedService, setSelectedService] = useState('')
    const [appointmentDate, setAppointmentDate] = useState('') // New state

    const [loading, setLoading] = useState({
        categories: true,
        subcategories: false,
        services: false,
        submitting: false
    })

    const [errors, setErrors] = useState({})
    const [success, setSuccess] = useState(false)

    // Load categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(prev => ({ ...prev, categories: true }))
                const response = await patientService.getServiceCategories()
                if (response.data && response.data.length > 0) {
                    setCategories(response.data)
                } else {
                    setCategories([])
                }
            } catch (error) {
                console.error('Error fetching categories:', error)
                setCategories([])
            } finally {
                setLoading(prev => ({ ...prev, categories: false }))
            }
        }

        fetchCategories()
    }, [])

    // Load subcategories when category changes
    useEffect(() => {
        if (selectedCategory) {
            const fetchSubcategories = async () => {
                try {
                    setLoading(prev => ({ ...prev, subcategories: true }))
                    setSelectedSubcategory('')
                    setSelectedService('')
                    setSubcategories([])
                    setServices([])

                    const response = await patientService.getServiceSubcategories(selectedCategory)
                    if (response.data && response.data.length > 0) {
                        setSubcategories(response.data)
                    } else {
                        setSubcategories([])
                    }
                } catch (error) {
                    console.error('Error fetching subcategories:', error)
                    setSubcategories([])
                } finally {
                    setLoading(prev => ({ ...prev, subcategories: false }))
                }
            }

            fetchSubcategories()
        } else {
            setSubcategories([])
            setSelectedSubcategory('')
            setSelectedService('')
            setServices([])
        }
    }, [selectedCategory])

    // Load services when subcategory changes
    useEffect(() => {
        if (selectedSubcategory) {
            const fetchServices = async () => {
                try {
                    setLoading(prev => ({ ...prev, services: true }))
                    setSelectedService('')
                    setServices([])

                    const response = await patientService.getServices(selectedSubcategory)
                    if (response.data && response.data.length > 0) {
                        setServices(response.data)
                    } else {
                        setServices([])
                    }
                } catch (error) {
                    console.error('Error fetching services:', error)
                    setServices([])
                } finally {
                    setLoading(prev => ({ ...prev, services: false }))
                }
            }

            fetchServices()
        } else {
            setServices([])
            setSelectedService('')
        }
    }, [selectedSubcategory])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrors({})

        // Validation
        const newErrors = {}
        if (!selectedCategory) newErrors.category = 'Vui lòng chọn danh mục'
        if (!selectedSubcategory) newErrors.subcategory = 'Vui lòng chọn chuyên khoa'
        if (!selectedService) newErrors.service = 'Vui lòng chọn dịch vụ'
        if (!appointmentDate) newErrors.appointmentDate = 'Vui lòng nhập ngày hẹn'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        try {
            setLoading(prev => ({ ...prev, submitting: true }))

            // Format date from YYYY-MM-DD to DD/MM/YYYY
            const [year, month, day] = appointmentDate.split('-')
            const formattedDate = `${day}/${month}/${year}`

            // Call API to register service and get Stripe checkout URL
            const response = await patientService.registerService(selectedService, formattedDate)

            if (response.data && response.data.url) {
                // Redirect to Stripe checkout page
                window.location.href = response.data.url
            } else {
                // Fallback success message if no URL provided
                setSuccess(true)

                // Reset form after successful registration
                setTimeout(() => {
                    setSelectedCategory('')
                    setSelectedSubcategory('')
                    setSelectedService('')
                    setAppointmentDate('')
                    setSuccess(false)
                }, 3000)
            }

        } catch (error) {
            console.error('Error registering service:', error)
            setErrors({ submit: 'Đăng ký dịch vụ thất bại. Vui lòng thử lại.' })
        } finally {
            setLoading(prev => ({ ...prev, submitting: false }))
        }
    }

    const selectedServiceDetails = services.find(s => s.id === selectedService)

    const formatCurrency = (amount) => {
        // Format as xxx.000 without currency symbol
        return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ'
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Đăng Ký Dịch Vụ Y Tế
                        </h1>
                        <p className="text-lg text-gray-600 mb-4">
                            Chọn dịch vụ phù hợp với nhu cầu của bạn
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-2xl mx-auto">
                            <p className="text-sm text-yellow-800 font-medium">
                                💡 Lưu ý: Đây chỉ là chi phí khám cơ bản của dịch vụ đăng kí, chưa bao gồm các dịch vụ chuyên sâu
                            </p>
                        </div>
                    </motion.div>

                    {/* Success Message */}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4"
                        >
                            <div className="flex items-center space-x-2 text-green-800">
                                <Check className="h-5 w-5" />
                                <span className="font-medium">Đăng ký dịch vụ thành công!</span>
                            </div>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* User Information */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-1"
                        >
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Thông Tin Bệnh Nhân
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                            <User className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {user?.full_name || 'Tên bệnh nhân'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                ID: {user?.id || 'XXXXXXXX'}
                                            </p>
                                        </div>
                                    </div>

                                    {user?.email && (
                                        <div className="flex items-center space-x-3 text-gray-600">
                                            <Mail className="h-4 w-4" />
                                            <span className="text-sm">{user.email}</span>
                                        </div>
                                    )}

                                    {user?.phone_number && (
                                        <div className="flex items-center space-x-3 text-gray-600">
                                            <Phone className="h-4 w-4" />
                                            <span className="text-sm">{user.phone_number}</span>
                                        </div>
                                    )}

                                    {user?.address && (
                                        <div className="flex items-center space-x-3 text-gray-600">
                                            <MapPin className="h-4 w-4" />
                                            <span className="text-sm">{user.address}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-3 text-gray-600">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm">
                                            Ngày đăng ký: {new Date().toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Service Registration Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="lg:col-span-2"
                        >
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">
                                    Chọn Dịch Vụ
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Category Dropdown */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Danh mục dịch vụ *
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                disabled={loading.categories}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${errors.category ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            >
                                                <option value="">
                                                    {loading.categories ? 'Đang tải...' : 'Chọn danh mục dịch vụ'}
                                                </option>
                                                {categories.length === 0 && !loading.categories ? (
                                                    <option value="" disabled>Không có dữ liệu</option>
                                                ) : (
                                                    categories.map(category => (
                                                        <option key={category.service_category_id} value={category.service_category_id}>
                                                            {category.name}
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        </div>
                                        {errors.category && (
                                            <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                                        )}
                                    </div>

                                    {/* Subcategory Dropdown */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Chuyên khoa *
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedSubcategory}
                                                onChange={(e) => setSelectedSubcategory(e.target.value)}
                                                disabled={!selectedCategory || loading.subcategories}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${errors.subcategory ? 'border-red-500' : 'border-gray-300'
                                                    } ${!selectedCategory ? 'bg-gray-100' : ''}`}
                                            >
                                                <option value="">
                                                    {!selectedCategory
                                                        ? 'Vui lòng chọn danh mục trước'
                                                        : loading.subcategories
                                                            ? 'Đang tải...'
                                                            : 'Chọn chuyên khoa'
                                                    }
                                                </option>
                                                {selectedCategory && subcategories.length === 0 && !loading.subcategories ? (
                                                    <option value="" disabled>Không có dữ liệu</option>
                                                ) : (
                                                    subcategories.map(subcategory => (
                                                        <option key={subcategory.service_subcategory_id} value={subcategory.service_subcategory_id}>
                                                            {subcategory.name}
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        </div>
                                        {errors.subcategory && (
                                            <p className="text-red-500 text-sm mt-1">{errors.subcategory}</p>
                                        )}
                                    </div>

                                    {/* Service Dropdown */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Dịch vụ cụ thể *
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedService}
                                                onChange={(e) => setSelectedService(e.target.value)}
                                                disabled={!selectedSubcategory || loading.services}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${errors.service ? 'border-red-500' : 'border-gray-300'
                                                    } ${!selectedSubcategory ? 'bg-gray-100' : ''}`}
                                            >
                                                <option value="">
                                                    {!selectedSubcategory
                                                        ? 'Vui lòng chọn chuyên khoa trước'
                                                        : loading.services
                                                            ? 'Đang tải...'
                                                            : 'Chọn dịch vụ'
                                                    }
                                                </option>
                                                {selectedSubcategory && services.length === 0 && !loading.services ? (
                                                    <option value="" disabled>Không có dữ liệu</option>
                                                ) : (
                                                    services.map(service => (
                                                        <option key={service.service_id} value={service.service_id}>
                                                            {service.service_name} - {formatCurrency(service.cost)}
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        </div>
                                        {errors.service && (
                                            <p className="text-red-500 text-sm mt-1">{errors.service}</p>
                                        )}
                                    </div>

                                    {/* Appointment Date Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ngày hẹn *
                                        </label>
                                        <input
                                            type="date" // Change type to date
                                            value={appointmentDate}
                                            onChange={(e) => setAppointmentDate(e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.appointmentDate ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.appointmentDate && (
                                            <p className="text-red-500 text-sm mt-1">{errors.appointmentDate}</p>
                                        )}
                                    </div>

                                    {/* Service Details */}
                                    {selectedServiceDetails && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                                        >
                                            <h3 className="font-medium text-blue-900 mb-2">Chi tiết dịch vụ:</h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-blue-700">Mã dịch vụ:</span>
                                                    <span className="ml-2 font-medium">{selectedServiceDetails.service_code}</span>
                                                </div>
                                                <div>
                                                    <span className="text-blue-700">Chi phí:</span>
                                                    <span className="ml-2 font-medium text-green-600">
                                                        {formatCurrency(selectedServiceDetails.cost)}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Error Message */}
                                    {errors.submit && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <div className="flex items-center space-x-2 text-red-800">
                                                <AlertCircle className="h-5 w-5" />
                                                <span>{errors.submit}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={!selectedService || loading.submitting}
                                        className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${!selectedService || loading.submitting
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                                            }`}
                                    >
                                        {loading.submitting ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <Loader className="h-5 w-5 animate-spin" />
                                                <span>Đang đăng ký...</span>
                                            </div>
                                        ) : (
                                            'Đăng Ký Dịch Vụ'
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default ServiceRegistration
