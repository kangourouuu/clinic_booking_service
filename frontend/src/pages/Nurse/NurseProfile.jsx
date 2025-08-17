import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Calendar, MapPin, Edit3, Save, X, UserCheck, Award } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Layout from '../../components/layout/Layout'
import { useAuth } from '../../context/AuthContext'
import { nurseService } from '../../services/apiServices'
import toast from 'react-hot-toast'

const NurseProfile = () => {
    const { user, updateUser } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [profileData, setProfileData] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        address: '',
        department: '',
        license_number: '',
        specialization: '',
        experience_years: '',
        education: ''
    })

    // Fetch profile data from API
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true)
                const response = await nurseService.getProfile()
                console.log('Nurse API raw response:', response)

                // Try different response structures
                let data = response
                if (response && response.data) {
                    data = response.data
                    console.log('Using response.data:', data)
                } else if (response && response.user) {
                    data = response.user
                    console.log('Using response.user:', data)
                }

                console.log('Final nurse profile data:', data)
                console.log('Nurse name from API:', data?.name)
                console.log('Backend fields check - full_name:', data?.full_name, 'phone_number:', data?.phone_number, 'dob:', data?.dob)
                console.log('Nurse address from API:', data?.address)
                console.log('All available fields:', Object.keys(data || {}))

                setProfileData(data)

                // Update form data with API response - mapping backend fields to frontend
                setFormData({
                    name: data.full_name || data.name || '',
                    email: data.email || '',
                    phone: data.phone_number || data.phone || '',
                    date_of_birth: data.dob || (data.date_of_birth ? data.date_of_birth.split('T')[0] : ''),
                    address: data.address || '',
                    department: data.department || '',
                    license_number: data.license_number || '',
                    specialization: data.specialization || '',
                    experience_years: data.experience_years || '',
                    education: data.education || ''
                })
            } catch (error) {
                console.error('Error fetching nurse profile:', error)
                toast.error('Không thể tải thông tin cá nhân')
                // Fallback to user data from context if API fails
                if (user) {
                    console.log('Using fallback user data:', user)
                    setProfileData(user)
                    setFormData({
                        name: user.name || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
                        address: user.address || '',
                        department: user.department || '',
                        license_number: user.license_number || '',
                        specialization: user.specialization || '',
                        experience_years: user.experience_years || '',
                        education: user.education || ''
                    })
                }
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [user])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSave = async () => {
        try {
            setLoading(true)

            // Prepare data for API call
            const updateData = {
                full_name: formData.name,
                email: formData.email,
                phone_number: formData.phone,
                date_of_birth: formData.date_of_birth,
                address: formData.address,
                department: formData.department,
                license_number: formData.license_number
            }

            console.log('Updating nurse profile with data:', updateData)
            console.log('Nurse ID from profile:', profileData.nurse_id || profileData.id)

            // Call API to update profile
            const nurseId = profileData.nurse_id || profileData.id
            if (!nurseId) {
                throw new Error('Nurse ID not found in profile data')
            }

            await nurseService.updateProfile(nurseId, updateData)

            // Refresh profile data after update
            const updatedProfileResponse = await nurseService.getProfile()
            const updatedProfileData = updatedProfileResponse.data || updatedProfileResponse
            setProfileData(updatedProfileData)

            // Update auth context with new data
            updateUser({
                ...user,
                name: updatedProfileData.full_name || updatedProfileData.name,
                email: updatedProfileData.email,
                phone: updatedProfileData.phone_number || updatedProfileData.phone
            })

            setIsEditing(false)
            toast.success('Cập nhật thông tin thành công!')
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error('Có lỗi xảy ra khi cập nhật thông tin')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        if (profileData) {
            setFormData({
                name: profileData.name || '',
                email: profileData.email || '',
                phone: profileData.phone || '',
                date_of_birth: profileData.date_of_birth ? profileData.date_of_birth.split('T')[0] : '',
                address: profileData.address || '',
                department: profileData.department || '',
                license_number: profileData.license_number || '',
                specialization: profileData.specialization || '',
                experience_years: profileData.experience_years || '',
                education: profileData.education || ''
            })
        }
        setIsEditing(false)
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa cập nhật'
        const date = new Date(dateString)
        return date.toLocaleDateString('vi-VN')
    }

    if (!profileData || loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center py-12">
                            <p className="text-gray-600">Đang tải thông tin...</p>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
                            <UserCheck className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông tin điều dưỡng</h1>
                        <p className="text-gray-600">Quản lý thông tin cá nhân và nghề nghiệp</p>
                    </motion.div>

                    {/* Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                            <CardHeader className="pb-6">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-xl text-gray-900">
                                        Hồ sơ điều dưỡng
                                    </CardTitle>
                                    {!isEditing ? (
                                        <Button
                                            onClick={() => setIsEditing(true)}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <Edit3 className="h-4 w-4 mr-2" />
                                            Chỉnh sửa
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleSave}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                <Save className="h-4 w-4 mr-2" />
                                                Lưu
                                            </Button>
                                            <Button
                                                onClick={handleCancel}
                                                variant="outline"
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Hủy
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <User className="h-4 w-4 inline mr-2" />
                                            Họ và tên
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="Nhập họ và tên"
                                            />
                                        ) : (
                                            <p className="text-gray-900 font-medium">{profileData.full_name || profileData.name || 'Chưa cập nhật'}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Mail className="h-4 w-4 inline mr-2" />
                                            Email
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="Nhập email"
                                            />
                                        ) : (
                                            <p className="text-gray-900 font-medium">{profileData.email || 'Chưa cập nhật'}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Phone className="h-4 w-4 inline mr-2" />
                                            Số điện thoại
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="Nhập số điện thoại"
                                            />
                                        ) : (
                                            <p className="text-gray-900 font-medium">{profileData.phone_number || profileData.phone || 'Chưa cập nhật'}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Calendar className="h-4 w-4 inline mr-2" />
                                            Ngày sinh
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                name="date_of_birth"
                                                value={formData.date_of_birth}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-gray-900 font-medium">{profileData.dob || formatDate(profileData.date_of_birth) || 'Chưa cập nhật'}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="h-4 w-4 inline mr-2" />
                                        Địa chỉ
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="Nhập địa chỉ"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium">{profileData.address || 'Chưa cập nhật'}</p>
                                    )}
                                </div>

                                {/* Professional Information */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin nghề nghiệp</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Khoa/Phòng
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="department"
                                                    value={formData.department}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    placeholder="Nhập khoa/phòng làm việc"
                                                />
                                            ) : (
                                                <p className="text-gray-900 font-medium">{profileData.department || 'Chưa cập nhật'}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Award className="h-4 w-4 inline mr-2" />
                                                Số chứng chỉ hành nghề
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="license_number"
                                                    value={formData.license_number}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    placeholder="Nhập số chứng chỉ hành nghề"
                                                />
                                            ) : (
                                                <p className="text-gray-900 font-medium">{profileData.license_number || 'Chưa cập nhật'}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Chuyên môn
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="specialization"
                                                    value={formData.specialization}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    placeholder="Nhập chuyên môn"
                                                />
                                            ) : (
                                                <p className="text-gray-900 font-medium">{profileData.specialization || 'Chưa cập nhật'}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Số năm kinh nghiệm
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    name="experience_years"
                                                    value={formData.experience_years}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    placeholder="Nhập số năm kinh nghiệm"
                                                    min="0"
                                                />
                                            ) : (
                                                <p className="text-gray-900 font-medium">
                                                    {profileData.experience_years ? `${profileData.experience_years} năm` : 'Chưa cập nhật'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Education */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Trình độ học vấn
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            name="education"
                                            value={formData.education}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="Nhập thông tin về trình độ học vấn, bằng cấp..."
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium">{profileData.education || 'Chưa cập nhật'}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </Layout>
    )
}

export default NurseProfile
