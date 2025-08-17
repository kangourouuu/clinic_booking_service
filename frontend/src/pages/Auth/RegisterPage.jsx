import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Eye,
    EyeOff,
    Heart,
    Lock,
    Mail,
    User,
    Phone,
    Calendar,
    Upload,
    X,
    Plus,
    FileText
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/apiServices'
import Layout from '../../components/layout/Layout'
import Button from '../../components/ui/Button'
import { Input, Textarea, Select } from '../../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { resizeImage, isValidImageFile, formatFileSize } from '../../utils/helpers'
import toast from 'react-hot-toast'

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        citizenId: '',
        emergencyContact: '',
        emergencyRelationship: '',
        emergencyPhone: '',
        // Medical History fields - change to arrays and separate field
        drug_allergies: [],
        disease_treatment_history: [],
        other_history: '',
        weight: '',
        height: '',
        temperature: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [avatar, setAvatar] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1) // 1: Basic Info, 2: Medical Info, 3: Avatar

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Helper functions for medical history arrays
    const addMedicalHistoryItem = (field, value) => {
        if (value.trim()) {
            setFormData(prev => ({
                ...prev,
                [field]: [...prev[field], value.trim()]
            }))
        }
    }

    const removeMedicalHistoryItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }))
    }

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!isValidImageFile(file)) {
            toast.error('Vui lòng chọn file ảnh hợp lệ (JPG, PNG, GIF, WEBP) và nhỏ hơn 5MB')
            return
        }

        try {
            // Resize image to 156x156
            const resizedFile = await resizeImage(file, 156, 156, 0.8)
            setAvatar(resizedFile)

            // Create preview URL
            const previewUrl = URL.createObjectURL(resizedFile)
            setAvatarPreview(previewUrl)

            toast.success('Ảnh đại diện đã được tải lên và resize thành công!')
        } catch (error) {
            console.error('Error resizing image:', error)
            toast.error('Lỗi khi xử lý ảnh. Vui lòng thử lại.')
        }
    }

    const removeAvatar = () => {
        setAvatar(null)
        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview)
            setAvatarPreview(null)
        }
    }

    const validateStep1 = () => {
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
            return false
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp')
            return false
        }

        if (formData.password.length < 8) {
            toast.error('Mật khẩu phải có ít nhất 8 ký tự với chữ hoa, chữ thường, số và ký tự đặc biệt')
            return false
        }

        return true
    }

    const validateStep2 = () => {
        console.log('Validating step 2 with data:', {
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            address: formData.address,
            citizenId: formData.citizenId,
            weight: formData.weight,
            height: formData.height
        })

        if (!formData.dateOfBirth || !formData.gender || !formData.address || !formData.citizenId) {
            toast.error('Vui lòng điền đầy đủ thông tin: Ngày sinh, Giới tính, Địa chỉ và CMND/CCCD')
            return false
        }

        if (!formData.weight || !formData.height) {
            toast.error('Vui lòng nhập chiều cao và cân nặng')
            return false
        }

        // Validate date of birth (not in future)
        const birthDate = new Date(formData.dateOfBirth)
        const today = new Date()
        if (birthDate >= today) {
            toast.error('Ngày sinh không hợp lệ')
            return false
        }

        // Validate weight and height are positive numbers
        if (parseFloat(formData.weight) <= 0 || parseFloat(formData.height) <= 0) {
            toast.error('Chiều cao và cân nặng phải là số dương')
            return false
        }

        console.log('Step 2 validation passed!')
        return true
    }

    const handleNext = (e) => {
        e.preventDefault() // Prevent form submission

        console.log('Current step:', step)
        console.log('Form data:', formData)

        if (step === 1) {
            console.log('Validating step 1...')
            if (!validateStep1()) {
                console.log('Step 1 validation failed')
                return
            }
            console.log('Step 1 validation passed')
        }

        if (step === 2) {
            console.log('Validating step 2...')
            if (!validateStep2()) {
                console.log('Step 2 validation failed')
                return
            }
            console.log('Step 2 validation passed')
        }

        const nextStep = step + 1
        console.log('Moving to step:', nextStep)
        setStep(nextStep)
    }

    const handlePrevious = (e) => {
        e.preventDefault() // Prevent form submission
        setStep(step - 1)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Only submit on step 3 (final step)
        if (step !== 3) {
            return
        }

        // Validate all steps before submitting
        if (!validateStep1()) {
            setStep(1)
            return
        }

        if (!validateStep2()) {
            setStep(2)
            return
        }

        setLoading(true)

        try {
            // Convert date format from YYYY-MM-DD to DD/MM/YYYY
            const formatDateForBackend = (dateString) => {
                if (!dateString) return ''
                const date = new Date(dateString)
                const day = String(date.getDate()).padStart(2, '0')
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const year = date.getFullYear()
                return `${day}/${month}/${year}`
            }

            // Prepare complex JSON fields
            const nextOfKinInfo = JSON.stringify([{
                full_name: formData.emergencyContact || '',
                relationship: formData.emergencyRelationship || '',
                phone_number: formData.emergencyPhone || ''
            }])

            const drugAllergies = JSON.stringify(formData.drug_allergies || [])

            const diseaseTreatmentHistory = JSON.stringify(formData.disease_treatment_history || [])

            // Use FormData for multipart upload
            const formDataToSend = new FormData()

            // Add all form fields with correct backend field names and formats
            formDataToSend.append('full_name', formData.name)
            formDataToSend.append('email', formData.email)
            formDataToSend.append('password', formData.password)
            formDataToSend.append('phone_number', formData.phone)
            formDataToSend.append('dob', formatDateForBackend(formData.dateOfBirth))
            formDataToSend.append('gender', formData.gender)
            formDataToSend.append('address', formData.address)
            formDataToSend.append('citizen_id', formData.citizenId)
            formDataToSend.append('next_of_kin_info', nextOfKinInfo)
            formDataToSend.append('drug_allergies', drugAllergies)
            formDataToSend.append('disease_treatment_history', diseaseTreatmentHistory)
            formDataToSend.append('other_history', formData.other_history || '')
            formDataToSend.append('vital_signs', '')
            formDataToSend.append('temperature', parseFloat(formData.temperature) || 36.5)
            formDataToSend.append('weight', parseFloat(formData.weight) || 0)
            formDataToSend.append('height', parseFloat(formData.height) || 0)
            formDataToSend.append('health_insurance_id', '')

            // Add avatar file if exists
            if (avatar) {
                formDataToSend.append('avatar', avatar)
            }

            const response = await authService.registerPatient(formDataToSend)
            const { user, token } = response

            await login(user, token, 'patient')

            toast.success('Đăng ký thành công! Chào mừng bạn đến với MediCare!')
            navigate('/patient/dashboard')

        } catch (error) {
            console.error('Registration error:', error)
            toast.error(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.')
        } finally {
            setLoading(false)
        }
    }

    const renderStep1 = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>

            <Input
                type="text"
                name="name"
                label="Họ và tên"
                placeholder="Nhập họ và tên đầy đủ"
                value={formData.name}
                onChange={handleInputChange}
                required
            />

            <Input
                type="email"
                name="email"
                label="Email"
                placeholder="Nhập địa chỉ email"
                value={formData.email}
                onChange={handleInputChange}
                required
            />

            <Input
                type="tel"
                name="phone"
                label="Số điện thoại"
                placeholder="Nhập số điện thoại"
                value={formData.phone}
                onChange={handleInputChange}
                required
            />

            <div className="relative">
                <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    label="Mật khẩu"
                    placeholder="Nhập mật khẩu (ít nhất 8 ký tự với chữ hoa, thường, số, ký tự đặc biệt)"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>

            <div className="relative">
                <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    label="Xác nhận mật khẩu"
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                />
                <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>
        </div>
    )

    const renderStep2 = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cá nhân</h3>

            <Input
                type="date"
                name="dateOfBirth"
                label="Ngày sinh"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
            />

            <Select
                name="gender"
                label="Giới tính"
                value={formData.gender}
                onChange={handleInputChange}
                required
                placeholder="Chọn giới tính"
            >
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
            </Select>

            <Input
                type="text"
                name="citizenId"
                label="CMND/CCCD"
                placeholder="Nhập số CMND hoặc CCCD"
                value={formData.citizenId}
                onChange={handleInputChange}
                required
            />

            <Textarea
                name="address"
                label="Địa chỉ"
                placeholder="Nhập địa chỉ đầy đủ"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={3}
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    type="number"
                    name="weight"
                    label="Cân nặng (kg)"
                    placeholder="VD: 65"
                    value={formData.weight}
                    onChange={handleInputChange}
                    required
                />
                <Input
                    type="number"
                    name="height"
                    label="Chiều cao (m)"
                    placeholder="VD: 1.7"
                    step="0.01"
                    value={formData.height}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <Input
                type="number"
                name="temperature"
                label="Nhiệt độ cơ thể (°C)"
                placeholder="VD: 36.5"
                step="0.1"
                value={formData.temperature}
                onChange={handleInputChange}
            />

            <h4 className="text-md font-semibold text-gray-900 mt-6 mb-3">Thông tin liên hệ khẩn cấp</h4>

            <Input
                type="text"
                name="emergencyContact"
                label="Họ tên người thân"
                placeholder="Nhập họ tên người liên hệ khẩn cấp"
                value={formData.emergencyContact}
                onChange={handleInputChange}
            />

            <div className="grid grid-cols-2 gap-4">
                <Select
                    name="emergencyRelationship"
                    label="Mối quan hệ"
                    value={formData.emergencyRelationship}
                    onChange={handleInputChange}
                    placeholder="Chọn mối quan hệ"
                >
                    <option value="father">Cha</option>
                    <option value="mother">Mẹ</option>
                    <option value="spouse">Vợ/Chồng</option>
                    <option value="sibling">Anh/Chị/Em</option>
                    <option value="child">Con</option>
                    <option value="other">Khác</option>
                </Select>

                <Input
                    type="tel"
                    name="emergencyPhone"
                    label="Số điện thoại"
                    placeholder="Số điện thoại người thân"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                />
            </div>

            {/* Medical History Section */}
            <div className="space-y-6 border-t pt-6">
                <h4 className="text-md font-semibold text-gray-900 flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-red-500" />
                    Thông Tin Y Tế
                </h4>

                {/* Drug Allergies */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dị ứng thuốc
                    </label>
                    <div className="space-y-2">
                        {formData.drug_allergies.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <span className="flex-1 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm">
                                    {item}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeMedicalHistoryItem('drug_allergies', index)}
                                    className="p-1 text-red-500 hover:text-red-700"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="Nhập tên thuốc gây dị ứng..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        addMedicalHistoryItem('drug_allergies', e.target.value)
                                        e.target.value = ''
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={(e) => {
                                    const input = e.target.parentElement.querySelector('input')
                                    addMedicalHistoryItem('drug_allergies', input.value)
                                    input.value = ''
                                }}
                                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Disease Treatment History */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tiền sử điều trị bệnh
                    </label>
                    <div className="space-y-2">
                        {formData.disease_treatment_history.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <span className="flex-1 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                                    {item}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeMedicalHistoryItem('disease_treatment_history', index)}
                                    className="p-1 text-red-500 hover:text-red-700"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="Nhập tiền sử điều trị bệnh..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        addMedicalHistoryItem('disease_treatment_history', e.target.value)
                                        e.target.value = ''
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={(e) => {
                                    const input = e.target.parentElement.querySelector('input')
                                    addMedicalHistoryItem('disease_treatment_history', input.value)
                                    input.value = ''
                                }}
                                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Other History */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ghi chú khác
                    </label>
                    <textarea
                        value={formData.other_history}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            other_history: e.target.value
                        }))}
                        placeholder="Nhập các thông tin y tế khác (gia đình bệnh sử, thói quen sinh hoạt, v.v.)..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                    />
                </div>
            </div>
        </div>
    )

    const renderStep3 = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ảnh đại diện</h3>

            <div className="text-center">
                {avatarPreview ? (
                    <div className="relative inline-block">
                        <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        <button
                            type="button"
                            onClick={removeAvatar}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <div className="mt-2 text-sm text-gray-600">
                            {avatar && `Kích thước: ${formatFileSize(avatar.size)}`}
                        </div>
                    </div>
                ) : (
                    <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                        <User className="h-12 w-12 text-gray-400" />
                    </div>
                )}

                <div className="mt-4">
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                        <div className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                            <Upload className="h-4 w-4 mr-2" />
                            {avatarPreview ? 'Thay đổi ảnh' : 'Chọn ảnh đại diện'}
                        </div>
                    </label>
                </div>

                <p className="text-sm text-gray-500 mt-2">
                    Ảnh sẽ được tự động resize thành 156x156 pixels.<br />
                    Chấp nhận: JPG, PNG, GIF, WEBP (tối đa 5MB)
                </p>
            </div>
        </div>
    )

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-8"
                    >
                        <Link to="/" className="inline-flex items-center space-x-2 mb-6">
                            <div className="bg-primary-600 p-2 rounded-xl">
                                <Heart className="h-8 w-8 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900 font-medical">MediCare</span>
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng ký bệnh nhân</h1>
                        <p className="text-gray-600">Tạo tài khoản để sử dụng dịch vụ y tế</p>
                    </motion.div>

                    {/* Progress Indicator */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            {[1, 2, 3].map((stepNumber) => (
                                <div key={stepNumber} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= stepNumber
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {stepNumber}
                                    </div>
                                    {stepNumber < 3 && (
                                        <div className={`w-16 h-1 mx-2 ${step > stepNumber ? 'bg-primary-600' : 'bg-gray-200'
                                            }`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 mt-2">
                            <span>Cơ bản</span>
                            <span>Cá nhân</span>
                            <span>Ảnh đại diện</span>
                        </div>
                    </div>

                    {/* Registration Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Card className="border-0 medical-shadow">
                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit}>
                                    {step === 1 && renderStep1()}
                                    {step === 2 && renderStep2()}
                                    {step === 3 && renderStep3()}

                                    <div className="flex justify-between mt-8">
                                        {step > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handlePrevious}
                                            >
                                                Quay lại
                                            </Button>
                                        )}

                                        {step < 3 ? (
                                            <Button
                                                type="button"
                                                onClick={handleNext}
                                                className={step === 1 ? 'ml-auto' : ''}
                                            >
                                                Tiếp tục
                                            </Button>
                                        ) : (
                                            <Button
                                                type="submit"
                                                loading={loading}
                                                className="ml-auto"
                                            >
                                                Hoàn thành đăng ký
                                            </Button>
                                        )}
                                    </div>
                                </form>

                                {/* Login Link */}
                                <div className="text-center pt-6 border-t border-gray-200">
                                    <p className="text-gray-600">
                                        Đã có tài khoản?{' '}
                                        <Link to="/patient/login" className="text-primary-600 hover:text-primary-700 font-medium">
                                            Đăng nhập ngay
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

export default RegisterPage
