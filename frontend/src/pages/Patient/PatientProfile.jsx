import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Calendar, MapPin, Edit3, Save, X, Heart, Plus, FileText, AlertTriangle, Users, Stethoscope } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Layout from '../../components/layout/Layout'
import { useAuth } from '../../context/AuthContext'
import { patientService, doctorService } from '../../services/apiServices'
import toast from 'react-hot-toast'

const SectionTitle = ({ icon, title }) => (
    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        {icon}
        {title}
    </h3>
)

const ProfileField = ({ icon, label, value, isEditing, name, onChange, type = 'text', placeholder, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
            {React.cloneElement(icon, { className: "h-4 w-4 mr-2 text-primary-600" })}
            {label}
        </label>
        {isEditing ? (
            children || (
                <input
                    type={type}
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    placeholder={placeholder}
                />
            )
        ) : (
            <p className="text-gray-900 font-medium text-base bg-gray-50 px-4 py-2 rounded-lg min-h-[42px] flex items-center">{value || 'Chưa cập nhật'}</p>
        )}
    </div>
)

const MedicalHistoryList = ({ title, items, fieldName, isEditing, onAdd, onRemove, placeholder, icon, color }) => (
    <div>
        <label className="flex items-center text-sm font-medium text-gray-600 mb-2">
            {React.cloneElement(icon, { className: "h-4 w-4 mr-2 text-primary-600" })}
            {title}
        </label>
        {isEditing ? (
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => onAdd(fieldName, index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button type="button" onClick={() => onRemove(fieldName, index)} className="p-1 text-red-500 hover:text-red-700">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
                <button type="button" onClick={() => onAdd(fieldName)} className="text-primary-600 hover:text-primary-700 text-sm flex items-center">
                    <Plus className="h-4 w-4 mr-1" /> Thêm
                </button>
            </div>
        ) : (
            <div className="flex flex-wrap gap-2">
                {items && items.length > 0 ? (
                    items.map((item, index) => (
                        <span key={index} className={`inline-block px-3 py-1 bg-${color}-100 text-${color}-800 border border-${color}-200 rounded-full text-sm font-medium`}>
                            {item}
                        </span>
                    ))
                ) : (
                    <p className="text-gray-500 text-sm">Không có</p>
                )}
            </div>
        )}
    </div>
)

const BMIDisplay = ({ bmi }) => {
    if (bmi === null) return <p className="text-gray-900 font-medium">Chưa cập nhật</p>

    const getBMIStatus = (b) => {
        if (b < 18.5) return { status: 'Gầy', color: 'blue' }
        if (b < 25.0) return { status: 'Bình thường', color: 'green' }
        if (b < 30.0) return { status: 'Thừa cân', color: 'yellow' }
        if (b < 35.0) return { status: 'Béo phì độ I', color: 'orange' }
        return { status: 'Béo phì độ II+', color: 'red' }
    }

    const { status, color } = getBMIStatus(bmi)
    const percentage = Math.min(100, (bmi / 40) * 100)

    return (
        <div className="space-y-2">
            <p className="text-gray-900 font-bold text-lg">{bmi} - <span className={`text-${color}-600`}>{status}</span></p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className={`bg-${color}-500 h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    )
}

const PatientProfile = () => {
    const { user, updateUser, role } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [profileData, setProfileData] = useState(null)
    const [avatarFile, setAvatarFile] = useState(null)
    const [activeTab, setActiveTab] = useState('personal')
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', date_of_birth: '', address: '',
        next_of_kin_name: '', next_of_kin_relationship: '', next_of_kin_phone: '',
        gender: '', citizen_id: '', health_insurance_id: '',
        weight: '', height: '', temperature: '',
        drug_allergies: [], disease_treatment_history: [], other_history: ''
    })

    const convertDateToBackendFormat = (dateString) => {
        if (!dateString || !dateString.includes('-')) return dateString
        const [year, month, day] = dateString.split('-')
        return `${day}/${month}/${year}`
    }

    const convertDateToInputFormat = (dateString) => {
        if (!dateString || !dateString.includes('/')) return dateString
        const [day, month, year] = dateString.split('/')
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }

    const translateGender = (gender) => {
        const genderMap = { 'Male': 'Nam', 'Female': 'Nữ', 'Other': 'Khác' }
        return genderMap[gender] || gender
    }

    useEffect(() => {
        if (isEditing || !user || !role) return

        const fetchProfile = async () => {
            try {
                setLoading(true)
                const service = role === 'doctor' ? doctorService : patientService
                const response = await service.getProfile()
                const data = response?.data || response?.user || response

                setProfileData(data)
                setFormData({
                    name: data.full_name || '',
                    email: data.email || '',
                    phone: data.phone_number || '',
                    date_of_birth: convertDateToInputFormat(data.dob),
                    address: data.address || '',
                    next_of_kin_name: data.next_of_kin_info?.[0]?.full_name || '',
                    next_of_kin_relationship: data.next_of_kin_info?.[0]?.relationship || '',
                    next_of_kin_phone: data.next_of_kin_info?.[0]?.phone_number || '',
                    gender: data.gender || '',
                    citizen_id: data.citizen_id || '',
                    health_insurance_id: data.health_insurance_id || '',
                    weight: data.general_examination?.weight || '',
                    height: data.general_examination?.height || '',
                    temperature: data.general_examination?.temperature || '',
                    drug_allergies: data.medical_history?.drug_allergies || [],
                    disease_treatment_history: data.medical_history?.disease_treatment_history || [],
                    other_history: data.medical_history?.other_history || ''
                })
            } catch (error) {
                console.error('Error fetching profile:', error)
                toast.error('Không thể tải thông tin cá nhân')
                if (user) {
                    setProfileData(user) // Fallback to context
                }
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [user, role, isEditing])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleArrayChange = (fieldName, index, value) => {
        setFormData(prev => {
            const newArray = [...prev[fieldName]]
            newArray[index] = value
            return { ...prev, [fieldName]: newArray }
        })
    }

    const addArrayItem = (fieldName) => {
        setFormData(prev => ({ ...prev, [fieldName]: [...prev[fieldName], ''] }))
    }

    const removeArrayItem = (fieldName, index) => {
        setFormData(prev => ({ ...prev, [fieldName]: prev[fieldName].filter((_, i) => i !== index) }))
    }

    const handleSave = async () => {
        try {
            setLoading(true)
            const patientId = profileData.patient_id || profileData.id
            if (!patientId) throw new Error('Patient ID not found')

            const formDataToSend = new FormData()
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
            formDataToSend.append('temperature', parseFloat(formData.temperature) || 0)
            
            const nextOfKinInfo = (formData.next_of_kin_name || formData.next_of_kin_phone) ? JSON.stringify([{
                full_name: formData.next_of_kin_name || '',
                relationship: formData.next_of_kin_relationship || '',
                phone_number: formData.next_of_kin_phone || ''
            }]) : ''
            formDataToSend.append('next_of_kin_info', nextOfKinInfo)

            formDataToSend.append('drug_allergies', JSON.stringify(formData.drug_allergies || []))
            formDataToSend.append('disease_treatment_history', JSON.stringify(formData.disease_treatment_history || []))
            formDataToSend.append('other_history', formData.other_history || '')

            if (avatarFile) {
                formDataToSend.append('avatar', avatarFile)
            } else {
                formDataToSend.append('avatar', 'NO_CHANGE')
            }

            const service = role === 'doctor' ? doctorService : patientService
            await service.updateProfile(patientId, formDataToSend)

            setAvatarFile(null)
            updateUser({ ...user, name: formData.name, email: formData.email })
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
        // Revert form data from profileData
        if (profileData) {
            setFormData({
                name: profileData.full_name || '',
                email: profileData.email || '',
                phone: profileData.phone_number || '',
                date_of_birth: convertDateToInputFormat(profileData.dob),
                address: profileData.address || '',
                next_of_kin_name: profileData.next_of_kin_info?.[0]?.full_name || '',
                next_of_kin_relationship: profileData.next_of_kin_info?.[0]?.relationship || '',
                next_of_kin_phone: profileData.next_of_kin_info?.[0]?.phone_number || '',
                gender: profileData.gender || '',
                citizen_id: profileData.citizen_id || '',
                health_insurance_id: profileData.health_insurance_id || '',
                weight: profileData.general_examination?.weight || '',
                height: profileData.general_examination?.height || '',
                temperature: profileData.general_examination?.temperature || '',
                drug_allergies: profileData.medical_history?.drug_allergies || [],
                disease_treatment_history: profileData.medical_history?.disease_treatment_history || [],
                other_history: profileData.medical_history?.other_history || ''
            })
        }
        setAvatarFile(null)
        setIsEditing(false)
    }

    const getBMI = () => {
        const weight = parseFloat(isEditing ? formData.weight : profileData?.general_examination?.weight)
        const height = parseFloat(isEditing ? formData.height : profileData?.general_examination?.height)
        if (!weight || !height) return null
        return Math.round((weight / (height * height)) * 10) / 10
    }

    if (loading && !profileData) {
        return <Layout><div className="text-center py-20">Đang tải thông tin...</div></Layout>
    }

    const avatarUrl = avatarFile 
        ? URL.createObjectURL(avatarFile) 
        : profileData?.photo || profileData?.portrait_photo_url || profileData?.PortraitPhotoURL

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-center gap-8 mb-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="h-16 w-16 text-gray-400" />
                                )}
                            </div>
                            {isEditing && (
                                <>
                                    <input
                                        id="avatar-upload" type="file" accept="image/*" className="hidden"
                                        onChange={(e) => e.target.files[0] && setAvatarFile(e.target.files[0])}
                                    />
                                    <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-2 shadow-lg cursor-pointer">
                                        <Edit3 className="h-4 w-4" />
                                    </label>
                                </>
                            )}
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl font-bold text-gray-900">{profileData?.full_name || 'Patient Name'}</h1>
                            <p className="text-gray-500 mt-1">Quản lý thông tin cá nhân và sức khỏe của bạn.</p>
                        </div>
                        <div className="md:ml-auto flex gap-2 mt-4 md:mt-0">
                            {!isEditing ? (
                                <Button onClick={() => setIsEditing(true)} className="bg-primary-600 hover:bg-primary-700 text-white">
                                    <Edit3 className="h-4 w-4 mr-2" /> Chỉnh sửa
                                </Button>
                            ) : (
                                <>
                                    <Button onClick={handleSave} className="bg-primary-600 hover:bg-primary-700 text-white">
                                        <Save className="h-4 w-4 mr-2" /> Lưu
                                    </Button>
                                    <Button onClick={handleCancel} variant="outline">
                                        <X className="h-4 w-4 mr-2" /> Hủy
                                    </Button>
                                </>
                            )}
                        </div>
                    </motion.div>

                    <Card className="shadow-xl border-0 bg-white">
                        <CardHeader>
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                    <button onClick={() => setActiveTab('personal')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'personal' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                        Thông tin cá nhân
                                    </button>
                                    <button onClick={() => setActiveTab('medical')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'medical' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                        Thông tin y tế
                                    </button>
                                    <button onClick={() => setActiveTab('kin')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'kin' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                        Người thân
                                    </button>
                                </nav>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {activeTab === 'personal' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                    <SectionTitle icon={<User className="h-5 w-5 mr-2 text-blue-600" />} title="Thông tin cơ bản" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <ProfileField icon={<User className="h-4 w-4 mr-2 text-gray-400" />} label="Họ và tên" value={formData.name} isEditing={isEditing} name="name" onChange={handleInputChange} placeholder="Nhập họ và tên" />
                                        <ProfileField icon={<Mail className="h-4 w-4 mr-2 text-gray-400" />} label="Email" value={formData.email} isEditing={isEditing} name="email" onChange={handleInputChange} type="email" placeholder="Nhập email" />
                                        <ProfileField icon={<Phone className="h-4 w-4 mr-2 text-gray-400" />} label="Số điện thoại" value={formData.phone} isEditing={isEditing} name="phone" onChange={handleInputChange} type="tel" placeholder="Nhập số điện thoại" />
                                        <ProfileField icon={<Calendar className="h-4 w-4 mr-2 text-gray-400" />} label="Ngày sinh" value={isEditing ? formData.date_of_birth : profileData?.dob} isEditing={isEditing} name="date_of_birth" onChange={handleInputChange} type="date" />
                                        <ProfileField icon={<User className="h-4 w-4 mr-2 text-gray-400" />} label="Giới tính" value={isEditing ? formData.gender : translateGender(profileData?.gender)} isEditing={isEditing} name="gender" onChange={handleInputChange}>
                                            <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                                <option value="">Chọn giới tính</option>
                                                <option value="Male">Nam</option>
                                                <option value="Female">Nữ</option>
                                                <option value="Other">Khác</option>
                                            </select>
                                        </ProfileField>
                                        <ProfileField icon={<MapPin className="h-4 w-4 mr-2 text-gray-400" />} label="Địa chỉ" value={formData.address} isEditing={isEditing} name="address" onChange={handleInputChange} placeholder="Nhập địa chỉ" />
                                    </div>
                                </motion.div>
                            )}
                            {activeTab === 'medical' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <SectionTitle icon={<Stethoscope className="h-5 w-5 mr-2 text-blue-600" />} title="Chỉ số sức khỏe" />
                                            <div className="space-y-6 mt-4">
                                                <ProfileField icon={<AlertTriangle className="h-4 w-4 mr-2 text-gray-400" />} label="Cân nặng (kg)" value={formData.weight} isEditing={isEditing} name="weight" onChange={handleInputChange} type="number" placeholder="e.g., 65" />
                                                <ProfileField icon={<AlertTriangle className="h-4 w-4 mr-2 text-gray-400" />} label="Chiều cao (m)" value={formData.height} isEditing={isEditing} name="height" onChange={handleInputChange} type="number" placeholder="e.g., 1.7" step="0.01" />
                                                <ProfileField icon={<AlertTriangle className="h-4 w-4 mr-2 text-gray-400" />} label="Nhiệt độ (°C)" value={formData.temperature} isEditing={isEditing} name="temperature" onChange={handleInputChange} type="number" placeholder="e.g., 37" step="0.1" />
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">Chỉ số BMI</label>
                                                    <BMIDisplay bmi={getBMI()} />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <SectionTitle icon={<FileText className="h-5 w-5 mr-2 text-blue-600" />} title="Thông tin bảo hiểm & ID" />
                                            <div className="space-y-6 mt-4">
                                                <ProfileField icon={<FileText className="h-4 w-4 mr-2 text-gray-400" />} label="CCCD/CMND" value={formData.citizen_id} isEditing={isEditing} name="citizen_id" onChange={handleInputChange} placeholder="Nhập số CCCD/CMND" />
                                                <ProfileField icon={<Heart className="h-4 w-4 mr-2 text-gray-400" />} label="Số BHYT" value={formData.health_insurance_id} isEditing={isEditing} name="health_insurance_id" onChange={handleInputChange} placeholder="Nhập số BHYT" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-8 border-t">
                                        <SectionTitle icon={<AlertTriangle className="h-5 w-5 mr-2 text-blue-600" />} title="Tiền sử bệnh án" />
                                        <div className="space-y-6 mt-4">
                                            <MedicalHistoryList title="Dị ứng thuốc" items={formData.drug_allergies} fieldName="drug_allergies" isEditing={isEditing} onAdd={addArrayItem} onRemove={removeArrayItem} icon={<AlertTriangle className="h-4 w-4 mr-2 text-red-500" />} color="red" />
                                            <MedicalHistoryList title="Tiền sử điều trị" items={formData.disease_treatment_history} fieldName="disease_treatment_history" isEditing={isEditing} onAdd={addArrayItem} onRemove={removeArrayItem} icon={<FileText className="h-4 w-4 mr-2 text-yellow-600" />} color="yellow" />
                                            <ProfileField icon={<FileText className="h-4 w-4 mr-2 text-gray-400" />} label="Ghi chú khác" value={formData.other_history} isEditing={isEditing} name="other_history" onChange={handleInputChange} placeholder="Ghi chú khác..." children={isEditing && <textarea name="other_history" value={formData.other_history} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            {activeTab === 'kin' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                    <SectionTitle icon={<Users className="h-5 w-5 mr-2 text-blue-600" />} title="Thông tin người thân" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <ProfileField icon={<User className="h-4 w-4 mr-2 text-gray-400" />} label="Họ và tên người thân" value={formData.next_of_kin_name} isEditing={isEditing} name="next_of_kin_name" onChange={handleInputChange} placeholder="Họ và tên" />
                                        <ProfileField icon={<Users className="h-4 w-4 mr-2 text-gray-400" />} label="Mối quan hệ" value={formData.next_of_kin_relationship} isEditing={isEditing} name="next_of_kin_relationship" onChange={handleInputChange}>
                                            <select name="next_of_kin_relationship" value={formData.next_of_kin_relationship} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                                <option value="">Chọn mối quan hệ</option>
                                                <option value="Cha">Cha</option>
                                                <option value="Mẹ">Mẹ</option>
                                                <option value="Vợ/Chồng">Vợ/Chồng</option>
                                                <option value="Con">Con</option>
                                                <option value="Anh/Chị/Em">Anh/Chị/Em</option>
                                                <option value="Khác">Khác</option>
                                            </select>
                                        </ProfileField>
                                        <ProfileField icon={<Phone className="h-4 w-4 mr-2 text-gray-400" />} label="Số điện thoại người thân" value={formData.next_of_kin_phone} isEditing={isEditing} name="next_of_kin_phone" onChange={handleInputChange} type="tel" placeholder="Số điện thoại" />
                                    </div>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}

export default PatientProfile