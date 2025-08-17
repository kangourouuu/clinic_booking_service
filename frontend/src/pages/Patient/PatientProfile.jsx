import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Calendar, MapPin, Edit3, Save, X, Heart, Plus, Minus, FileText, AlertTriangle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Layout from '../../components/layout/Layout'
import { useAuth } from '../../context/AuthContext'
import { patientService, doctorService } from '../../services/apiServices'
import toast from 'react-hot-toast'

const PatientProfile = () => {
    const { user, updateUser, role } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [profileData, setProfileData] = useState(null)
    const [avatarFile, setAvatarFile] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        address: '',
        // Next of kin information
        next_of_kin_name: '',
        next_of_kin_relationship: '',
        next_of_kin_phone: '',
        gender: '',
        citizen_id: '',
        health_insurance_id: '',
        weight: '',
        height: '',
        temperature: '',
        // Medical History fields
        drug_allergies: [],
        disease_treatment_history: [],
        other_history: ''
    })

    // Convert date from yyyy-mm-dd (HTML input format) to dd/mm/yyyy (backend format)
    const convertDateToBackendFormat = (dateString) => {
        console.log('=== DATE TO BACKEND CONVERSION ===')
        console.log('Input date (from form):', dateString)
        if (!dateString) return ''
        try {
            // If input is in yyyy-mm-dd format (from HTML date input)
            if (dateString.includes('-') && dateString.length === 10) {
                const [year, month, day] = dateString.split('-')
                const converted = `${day}/${month}/${year}`
                return converted
            }
            // If already in dd/mm/yyyy format, return as is
            if (dateString.includes('/')) {
                return dateString
            }
        } catch (error) {
            console.error('Error converting date format:', error)
        }
        return dateString
    }

    // Convert date from dd/mm/yyyy (backend format) to yyyy-mm-dd (HTML input format)
    const convertDateToInputFormat = (dateString) => {
        if (!dateString) return ''
        try {
            // If input is in dd/mm/yyyy format (from backend)
            if (dateString.includes('/')) {
                const parts = dateString.split('/')
                if (parts.length === 3) {
                    const [day, month, year] = parts
                    const converted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
                    return converted
                }
            }
            // If already in yyyy-mm-dd format, return as is
            if (dateString.includes('-') && dateString.length === 10) {
                return dateString
            }
        } catch (error) {
            console.error('Error converting date format:', error)
        }
        return dateString
    }

    // Gender translation functions
    const translateGender = (gender) => {
        if (!gender) return ''
        const genderMap = {
            'Male': 'Nam',
            'Female': 'Nữ',
            'male': 'Nam',
            'female': 'Nữ',
            'Nam': 'Nam',
            'Nữ': 'Nữ',
            'Other': 'Khác',
            'other': 'Khác',
            'Khác': 'Khác'
        }
        return genderMap[gender] || gender
    }

    // Convert Vietnamese gender to English for backend
    const translateGenderToEnglish = (vietnameseGender) => {
        if (!vietnameseGender) return ''
        const genderMap = {
            'Nam': 'Male',
            'Nữ': 'Female',
            'Khác': 'Other',
            'Male': 'Male',
            'Female': 'Female',
            'Other': 'Other'
        }
        return genderMap[vietnameseGender] || vietnameseGender
    }

    // Fetch profile data from API
    useEffect(() => {
        // Don't refetch data if user is currently editing to avoid losing unsaved changes
        if (isEditing) {
            return
        }

        // Only fetch if we have a user context and role (avoid double fetching during initialization)
        if (!user || !role) {
            return
        }

        // For patients, check patient_id; for doctors, we'll fetch regardless
        if (role === 'patient' && !user.patient_id) {
            return
        }

        const fetchProfile = async () => {
            try {
                setLoading(true)

                // Use appropriate service based on user role
                let response
                if (role === 'doctor') {
                    response = await doctorService.getProfile()
                } else if (role === 'patient') {
                    response = await patientService.getProfile()
                } else {
                    throw new Error('Invalid user role')
                }

                // Try different response structures
                let data = response
                if (response && response.data) {
                    data = response.data
                } else if (response && response.user) {
                    data = response.user
                }

                console.log('Final patient profile data:', data)
                console.log('Patient name from API:', data?.full_name)
                console.log('Patient address from API:', data?.address)
                console.log('Patient photo from API:', data?.photo || data?.portrait_photo_url || data?.PortraitPhotoURL)
                console.log('Address value type:', typeof data?.address, 'Length:', data?.address?.length)
                console.log('Address is empty?', data?.address === '' || data?.address === null || data?.address === undefined)
                console.log('All available fields:', Object.keys(data || {}))

                setProfileData(data)

                // Update form data with API response - mapping backend fields to frontend
                const formDataToSet = {
                    name: data.full_name || '',
                    email: data.email || '',
                    phone: data.phone_number || '',
                    date_of_birth: convertDateToInputFormat(data.dob),
                    address: data.address || '',
                    // Next of kin info
                    next_of_kin_name: data.next_of_kin_info?.[0]?.full_name || '',
                    next_of_kin_relationship: data.next_of_kin_info?.[0]?.relationship || '',
                    next_of_kin_phone: data.next_of_kin_info?.[0]?.phone_number || '',
                    gender: data.gender || '', // Keep English value for form
                    citizen_id: data.citizen_id || '',
                    health_insurance_id: data.health_insurance_id || '',
                    // Get from general_examination instead of direct patient fields
                    weight: data.general_examination?.weight || '',
                    height: data.general_examination?.height || '',
                    temperature: data.general_examination?.temperature || '',
                    // Medical History fields
                    drug_allergies: data.medical_history?.drug_allergies || [],
                    disease_treatment_history: data.medical_history?.disease_treatment_history || [],
                    other_history: data.medical_history?.other_history || ''
                }

                setFormData(formDataToSet)
            } catch (error) {
                console.error('Error fetching patient profile:', error)
                toast.error('Không thể tải thông tin cá nhân')
                // Fallback to user data from context if API fails
                if (user) {
                    setProfileData(user)
                    setFormData({
                        name: user.name || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
                        address: user.address || '',
                        // Next of kin info
                        next_of_kin_name: user.next_of_kin_info?.[0]?.full_name || '',
                        next_of_kin_relationship: user.next_of_kin_info?.[0]?.relationship || '',
                        next_of_kin_phone: user.next_of_kin_info?.[0]?.phone_number || '',
                        gender: user.gender || '', // Keep English value for form
                        citizen_id: user.citizen_id || '',
                        health_insurance_id: user.health_insurance_id || '',
                        // Get from general_examination instead of direct user fields
                        weight: user.general_examination?.weight || '',
                        height: user.general_examination?.height || '',
                        temperature: user.general_examination?.temperature || '',
                        drug_allergies: user.drug_allergies || [],
                        disease_treatment_history: user.disease_treatment_history || [],
                        other_history: user.other_history || ''
                    })
                }
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [user, role])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleArrayInputChange = (fieldName, index, value) => {
        console.log('=== ARRAY INPUT CHANGE ===')
        console.log('Field:', fieldName, 'Index:', index, 'New Value:', value)
        setFormData(prev => {
            const newArray = [...prev[fieldName]]
            newArray[index] = value
            console.log('Updated array for', fieldName, ':', newArray)
            return {
                ...prev,
                [fieldName]: newArray
            }
        })
    }

    const addArrayItem = (fieldName) => {
        console.log('=== ADDING ARRAY ITEM ===')
        console.log('Adding item to field:', fieldName)
        setFormData(prev => {
            const newArray = [...prev[fieldName], '']
            console.log('New array after adding item:', newArray)
            return {
                ...prev,
                [fieldName]: newArray
            }
        })
    }

    const removeArrayItem = (fieldName, index) => {
        console.log('=== REMOVING ARRAY ITEM ===')
        console.log('Removing item from field:', fieldName, 'at index:', index)
        setFormData(prev => {
            const newArray = prev[fieldName].filter((_, i) => i !== index)
            console.log('New array after removing item:', newArray)
            return {
                ...prev,
                [fieldName]: newArray
            }
        })
    }

    const handleSave = async () => {
        try {
            setLoading(true)

            const patientId = profileData.patient_id || profileData.id
            if (!patientId) {
                throw new Error('Patient ID not found in profile data')
            }

            // Alternative: Always use FormData but indicate no avatar change
            const formDataToSend = new FormData()

            // Add text fields
            formDataToSend.append('full_name', formData.name || '')
            formDataToSend.append('email', formData.email || '')
            formDataToSend.append('phone_number', formData.phone || '')
            formDataToSend.append('dob', convertDateToBackendFormat(formData.date_of_birth) || '')
            formDataToSend.append('address', formData.address || '')
            formDataToSend.append('gender', formData.gender || '')
            formDataToSend.append('citizen_id', formData.citizen_id || '')
            formDataToSend.append('health_insurance_id', formData.health_insurance_id || '')
            formDataToSend.append('weight', parseFloat(formData.weight) || 0)
            formDataToSend.append('height', parseFloat(formData.height) || 0)
            formDataToSend.append('temperature', parseFloat(formData.temperature) || 36.5)

            // Add next of kin info with proper structure
            const nextOfKinInfo = (formData.next_of_kin_name || formData.next_of_kin_phone) ? JSON.stringify([{
                full_name: formData.next_of_kin_name || '',
                relationship: formData.next_of_kin_relationship || '',
                phone_number: formData.next_of_kin_phone || ''
            }]) : ''
            formDataToSend.append('next_of_kin_info', nextOfKinInfo)

            // Add medical history fields as separate fields as expected by backend
            const drugAllergiesStr = JSON.stringify(formData.drug_allergies || [])
            const diseaseHistoryStr = JSON.stringify(formData.disease_treatment_history || [])
            const otherHistoryStr = formData.other_history || ''

            formDataToSend.append('drug_allergies', drugAllergiesStr)
            formDataToSend.append('disease_treatment_history', diseaseHistoryStr)
            formDataToSend.append('other_history', otherHistoryStr)

            // Add avatar field with special value to indicate no change
            if (avatarFile) {
                formDataToSend.append('avatar', avatarFile)
            } else {
                // Send special string to indicate no avatar change
                formDataToSend.append('avatar', 'NO_CHANGE')
            }

            // Use appropriate service based on user role
            if (role === 'doctor') {
                await doctorService.updateProfile(patientId, formDataToSend)
            } else if (role === 'patient') {
                await patientService.updateProfile(patientId, formDataToSend)
            } else {
                throw new Error('Invalid user role')
            }

            // Reset avatar file state
            setAvatarFile(null)

            // Update auth context with current form data
            updateUser({
                ...user,
                name: formData.name,
                email: formData.email,
                phone: formData.phone
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
                name: profileData.full_name || profileData.name || '',
                email: profileData.email || '',
                phone: profileData.phone_number || profileData.phone || '',
                date_of_birth: convertDateToInputFormat(profileData.dob),
                address: profileData.address || '',
                // Next of kin info
                next_of_kin_name: profileData.next_of_kin_info?.[0]?.full_name || '',
                next_of_kin_relationship: profileData.next_of_kin_info?.[0]?.relationship || '',
                next_of_kin_phone: profileData.next_of_kin_info?.[0]?.phone_number || '',
                gender: profileData.gender || '',
                citizen_id: profileData.citizen_id || '',
                health_insurance_id: profileData.health_insurance_id || '',
                weight: profileData.weight || '',
                height: profileData.height || '',
                temperature: profileData.temperature || '',
                drug_allergies: profileData.medical_history?.drug_allergies || [],
                disease_treatment_history: profileData.medical_history?.disease_treatment_history || [],
                other_history: profileData.medical_history?.other_history || ''
            })
        }
        // Reset avatar changes
        setAvatarFile(null);
        setIsEditing(false)
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa cập nhật'
        try {
            const date = new Date(dateString)
            const day = date.getDate().toString().padStart(2, '0')
            const month = (date.getMonth() + 1).toString().padStart(2, '0')
            const year = date.getFullYear()
            return `${day}/${month}/${year}`
        } catch (error) {
            return 'Ngày không hợp lệ'
        }
    }

    if (!profileData || loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center py-12">
                            <p className="text-gray-600">Đang tải thông tin...</p>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    // BMI calculation and classification
    const getBMI = () => {
        const weight = parseFloat(profileData?.general_examination?.weight || formData.weight)
        const height = parseFloat(profileData?.general_examination?.height || formData.height)
        if (!weight || !height || height === 0) return null
        const bmi = weight / (height * height)
        return Math.round(bmi * 10) / 10 // round to 1 decimal
    }

    const getBMIStatus = (bmi) => {
        if (bmi == null) return ''
        if (bmi < 18.5) return 'Gầy (thiếu cân)'
        if (bmi < 25.0) return 'Bình thường'
        if (bmi < 30.0) return 'Thừa cân (tiền béo phì)'
        if (bmi < 35.0) return 'Béo phì độ I'
        if (bmi < 40.0) return 'Béo phì độ II'
        return 'Béo phì độ III (nguy hiểm)'
    }

    const bmi = getBMI()
    const bmiStatus = getBMIStatus(bmi)

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center mb-8"
                    >
                        <div className="relative mx-auto w-28 h-28 rounded-full mb-4 overflow-hidden border-4 border-white shadow-lg bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
                            {profileData?.photo || profileData?.portrait_photo_url || profileData?.PortraitPhotoURL ? (
                                <img
                                    src={profileData.photo || profileData.portrait_photo_url || profileData.PortraitPhotoURL}
                                    alt="Profile Avatar"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : (
                                <User className="h-14 w-14 text-white" />
                            )}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Thông tin cá nhân</h1>
                        <p className="text-gray-500">Quản lý thông tin cá nhân và liên hệ</p>
                    </motion.div>

                    {/* Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-md">
                            <CardHeader className="pb-6">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                    <CardTitle className="text-2xl text-gray-900 font-semibold tracking-tight">
                                        Thông tin bệnh nhân
                                    </CardTitle>
                                    {!isEditing ? (
                                        <Button
                                            onClick={() => setIsEditing(true)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md"
                                        >
                                            <Edit3 className="h-4 w-4 mr-2" />
                                            Chỉnh sửa
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleSave}
                                                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md"
                                            >
                                                <Save className="h-4 w-4 mr-2" />
                                                Lưu
                                            </Button>
                                            <Button
                                                onClick={handleCancel}
                                                variant="outline"
                                                className="px-5 py-2 rounded-lg shadow-md"
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Hủy
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                {/* Avatar Upload Section */}
                                {isEditing && (
                                    <div className="text-center pb-6 border-b border-gray-200">
                                        <div className="inline-block">
                                            <div className="relative">
                                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                                                    {profileData?.photo || profileData?.portrait_photo_url || profileData?.PortraitPhotoURL ? (
                                                        <img
                                                            src={profileData.photo || profileData.portrait_photo_url || profileData.PortraitPhotoURL}
                                                            alt="Profile Avatar"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
                                                            <User className="h-16 w-16 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-colors"
                                                    onClick={() => document.getElementById('avatar-upload').click()}
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <input
                                                id="avatar-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        // Validate file type
                                                        if (file.type.startsWith('image/')) {
                                                            setAvatarFile(file);
                                                            // Create preview URL
                                                            const previewUrl = URL.createObjectURL(file);
                                                            setProfileData(prev => ({
                                                                ...prev,
                                                                photo: previewUrl
                                                            }));
                                                            toast.success('Ảnh đại diện đã được chọn');
                                                        } else {
                                                            toast.error('Vui lòng chọn file ảnh hợp lệ');
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">Nhấp vào biểu tượng để thay đổi ảnh đại diện</p>
                                    </div>
                                )}

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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Nhập họ và tên"
                                            />
                                        ) : (
                                            <p className="text-gray-900 font-medium">{profileData.full_name || 'Chưa cập nhật'}</p>
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Nhập số điện thoại"
                                            />
                                        ) : (
                                            <p className="text-gray-900 font-medium">{profileData.phone_number || 'Chưa cập nhật'}</p>
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-gray-900 font-medium">{profileData.dob || 'Chưa cập nhật'}</p>
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Nhập địa chỉ"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium">{profileData.address || 'Chưa cập nhật'}</p>
                                    )}
                                </div>

                                {/* Additional Information Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Gender */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <User className="h-4 w-4 inline mr-2" />
                                            Giới tính
                                        </label>
                                        {isEditing ? (
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Chọn giới tính</option>
                                                <option value="Male">Nam</option>
                                                <option value="Female">Nữ</option>
                                                <option value="Other">Khác</option>
                                            </select>
                                        ) : (
                                            <p className="text-gray-900 font-medium">{translateGender(profileData.gender) || 'Chưa cập nhật'}</p>
                                        )}
                                    </div>

                                    {/* Citizen ID */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <FileText className="h-4 w-4 inline mr-2" />
                                            CCCD/CMND
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="citizen_id"
                                                value={formData.citizen_id}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Nhập số CCCD/CMND"
                                            />
                                        ) : (
                                            <p className="text-gray-900 font-medium">{profileData.citizen_id || 'Chưa cập nhật'}</p>
                                        )}
                                    </div>

                                    {/* Health Insurance */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Heart className="h-4 w-4 inline mr-2" />
                                            Số BHYT
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="health_insurance_id"
                                                value={formData.health_insurance_id}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Nhập số BHYT"
                                            />
                                        ) : (
                                            <p className="text-gray-900 font-medium">{profileData.health_insurance_id || 'Chưa cập nhật'}</p>
                                        )}
                                    </div>

                                    {/* Weight */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <AlertTriangle className="h-4 w-4 inline mr-2" />
                                            Cân nặng (kg)
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                name="weight"
                                                value={formData.weight}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Nhập cân nặng"
                                                step="0.1"
                                                min="0"
                                            />
                                        ) : (
                                            <p className="text-gray-900 font-medium">{
                                                profileData.general_examination?.weight
                                                    ? `${profileData.general_examination.weight} kg`
                                                    : 'Chưa cập nhật'
                                            }</p>
                                        )}
                                    </div>

                                    {/* Height */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <AlertTriangle className="h-4 w-4 inline mr-2" />
                                            Chiều cao (m)
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                name="height"
                                                value={formData.height}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Nhập chiều cao"
                                                step="0.01"
                                                min="0"
                                            />
                                        ) : (
                                            <p className="text-gray-900 font-medium">{
                                                profileData.general_examination?.height
                                                    ? `${profileData.general_examination.height} m`
                                                    : 'Chưa cập nhật'
                                            }</p>
                                        )}
                                    </div>

                                    {/* Temperature */}
                                    <div>
                                        {/* BMI */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                BMI
                                            </label>
                                            <p className="text-gray-900 font-medium">
                                                {bmi !== null ? `${bmi} (${bmiStatus})` : 'Chưa cập nhật'}
                                            </p>
                                        </div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <AlertTriangle className="h-4 w-4 inline mr-2" />
                                            Nhiệt độ (°C)
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                name="temperature"
                                                value={formData.temperature}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Nhập nhiệt độ"
                                                step="0.1"
                                                min="35"
                                                max="45"
                                            />
                                        ) : (
                                            <p className="text-gray-900 font-medium">{
                                                profileData.general_examination?.temperature
                                                    ? `${profileData.general_examination.temperature}°C`
                                                    : 'Chưa cập nhật'
                                            }</p>
                                        )}
                                    </div>
                                </div>

                                {/* Next of Kin Information */}
                                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Phone className="h-5 w-5 inline mr-2" />
                                        Thông tin người thân
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Next of Kin Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Họ và tên
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="next_of_kin_name"
                                                    value={formData.next_of_kin_name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Nhập họ và tên người thân"
                                                />
                                            ) : (
                                                <p className="text-gray-900 font-medium">{profileData.next_of_kin_info?.[0]?.full_name || 'Chưa cập nhật'}</p>
                                            )}
                                        </div>

                                        {/* Relationship */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mối quan hệ
                                            </label>
                                            {isEditing ? (
                                                <select
                                                    name="next_of_kin_relationship"
                                                    value={formData.next_of_kin_relationship}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Chọn mối quan hệ</option>
                                                    <option value="Cha">Cha</option>
                                                    <option value="Mẹ">Mẹ</option>
                                                    <option value="Vợ/Chồng">Vợ/Chồng</option>
                                                    <option value="Con">Con</option>
                                                    <option value="Anh/Chị/Em">Anh/Chị/Em</option>
                                                    <option value="Khác">Khác</option>
                                                </select>
                                            ) : (
                                                <p className="text-gray-900 font-medium">{profileData.next_of_kin_info?.[0]?.relationship || 'Chưa cập nhật'}</p>
                                            )}
                                        </div>

                                        {/* Phone Number */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Số điện thoại
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="tel"
                                                    name="next_of_kin_phone"
                                                    value={formData.next_of_kin_phone}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Nhập số điện thoại"
                                                />
                                            ) : (
                                                <p className="text-gray-900 font-medium">{profileData.next_of_kin_info?.[0]?.phone_number || 'Chưa cập nhật'}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Medical History */}
                                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                                    <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                                        <FileText className="h-5 w-5 mr-2" />
                                        Tiền sử bệnh án
                                    </h3>

                                    {/* Drug Allergies */}
                                    <div className="mb-6">
                                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                            <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                                            Dị ứng thuốc
                                        </label>
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                {formData.drug_allergies.map((allergy, index) => (
                                                    <div key={index} className="flex items-center space-x-2">
                                                        <span className="flex-1 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm">
                                                            {allergy}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeArrayItem('drug_allergies', index)}
                                                            className="p-1 text-red-500 hover:text-red-700"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <div className="flex space-x-2">
                                                    <input
                                                        type="text"
                                                        id="drug-allergies-input"
                                                        placeholder="Nhập tên thuốc gây dị ứng..."
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault()
                                                                // Set editing mode to prevent useEffect from overwriting form data
                                                                setIsEditing(true)

                                                                const value = e.target.value.trim()
                                                                if (value) {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        drug_allergies: [...prev.drug_allergies, value]
                                                                    }))
                                                                    e.target.value = ''
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            // Set editing mode to prevent useEffect from overwriting form data
                                                            setIsEditing(true)

                                                            const input = document.getElementById('drug-allergies-input')
                                                            if (input) {
                                                                const value = input.value.trim()
                                                                if (value) {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        drug_allergies: [...prev.drug_allergies, value]
                                                                    }))
                                                                    input.value = ''
                                                                }
                                                            }
                                                        }}
                                                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                {/* Show data from profileData if available, otherwise show from formData */}
                                                {(profileData?.medical_history?.drug_allergies?.length > 0) ? (
                                                    profileData.medical_history.drug_allergies.map((allergy, index) => (
                                                        <span key={index} className="inline-block px-3 py-1 bg-red-50 border border-red-200 rounded-lg text-sm mr-2 mb-1">
                                                            {allergy}
                                                        </span>
                                                    ))
                                                ) : (formData?.drug_allergies?.length > 0) ? (
                                                    /* Fallback to formData if profileData doesn't have medical history */
                                                    <div>
                                                        {formData.drug_allergies.map((allergy, index) => (
                                                            <span key={index} className="inline-block px-3 py-1 bg-red-50 border border-red-200 rounded-lg text-sm mr-2 mb-1">
                                                                {allergy}
                                                            </span>
                                                        ))}
                                                        <p className="text-xs text-blue-500 mt-2">
                                                            ⓘ Hiển thị dữ liệu đã lưu gần đây nhất
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-gray-500">Không có dị ứng thuốc</p>
                                                        {!profileData?.medical_history && (
                                                            <p className="text-xs text-orange-500 mt-1">
                                                                Dữ liệu y tế chưa được tải. Vui lòng tải lại trang để xem đầy đủ thông tin.
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Disease Treatment History */}
                                    <div className="mb-6">
                                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                            <FileText className="h-4 w-4 mr-2 text-yellow-600" />
                                            Tiền sử điều trị bệnh
                                        </label>
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                {formData.disease_treatment_history.map((disease, index) => (
                                                    <div key={index} className="flex items-center space-x-2">
                                                        <span className="flex-1 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                                                            {disease}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeArrayItem('disease_treatment_history', index)}
                                                            className="p-1 text-red-500 hover:text-red-700"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <div className="flex space-x-2">
                                                    <input
                                                        type="text"
                                                        id="disease-treatment-input"
                                                        placeholder="Nhập tiền sử điều trị bệnh..."
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault()
                                                                // Set editing mode to prevent useEffect from overwriting form data
                                                                setIsEditing(true)

                                                                const value = e.target.value.trim()
                                                                if (value) {
                                                                    setFormData(prev => {
                                                                        const newArray = [...prev.disease_treatment_history, value]
                                                                        return {
                                                                            ...prev,
                                                                            disease_treatment_history: newArray
                                                                        }
                                                                    })
                                                                    e.target.value = ''
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            // Set editing mode to prevent useEffect from overwriting form data
                                                            setIsEditing(true)

                                                            const input = document.getElementById('disease-treatment-input')
                                                            if (input) {
                                                                const value = input.value.trim()
                                                                if (value) {
                                                                    setFormData(prev => {
                                                                        const newArray = [...prev.disease_treatment_history, value]
                                                                        return {
                                                                            ...prev,
                                                                            disease_treatment_history: newArray
                                                                        }
                                                                    })
                                                                    input.value = ''
                                                                }
                                                            }
                                                        }}
                                                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                {/* Show data from profileData if available, otherwise show from formData */}
                                                {(profileData?.medical_history?.disease_treatment_history?.length > 0) ? (
                                                    profileData.medical_history.disease_treatment_history.map((disease, index) => (
                                                        <span key={index} className="inline-block px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-lg text-sm mr-2 mb-1">
                                                            {disease}
                                                        </span>
                                                    ))
                                                ) : (formData?.disease_treatment_history?.length > 0) ? (
                                                    /* Fallback to formData if profileData doesn't have medical history */
                                                    <div>
                                                        {formData.disease_treatment_history.map((disease, index) => (
                                                            <span key={index} className="inline-block px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-lg text-sm mr-2 mb-1">
                                                                {disease}
                                                            </span>
                                                        ))}
                                                        <p className="text-xs text-blue-500 mt-2">
                                                            ⓘ Hiển thị dữ liệu đã lưu gần đây nhất
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-gray-500">Không có tiền sử bệnh</p>
                                                        {!profileData?.medical_history && (
                                                            <p className="text-xs text-orange-500 mt-1">
                                                                Dữ liệu y tế chưa được tải. Vui lòng tải lại trang để xem đầy đủ thông tin.
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Other History */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <FileText className="h-4 w-4 inline mr-2 text-gray-500" />
                                            Ghi chú khác
                                        </label>
                                        {isEditing ? (
                                            <textarea
                                                name="other_history"
                                                value={formData.other_history}
                                                onChange={handleInputChange}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Nhập các ghi chú khác về tình trạng sức khỏe..."
                                            />
                                        ) : (
                                            <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{profileData?.medical_history?.other_history || 'Không có ghi chú khác'}</p>
                                        )}
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

export default PatientProfile
