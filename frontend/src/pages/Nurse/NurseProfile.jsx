import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Calendar, MapPin, Edit3, Save, X, UserCheck, Award, Briefcase, GraduationCap } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Layout from '../../components/layout/Layout'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/helpers'
import { nurseService } from '../../services/apiServices'
import toast from 'react-hot-toast'

const ProfileField = ({ icon, label, value, isEditing, name, onChange, type = 'text', placeholder, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
            {icon}
            <span className="ml-2">{label}</span>
        </label>
        {isEditing ? (
            children || (
                <input
                    type={type}
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
                    placeholder={placeholder}
                />
            )
        ) : (
            <p className="text-gray-900 font-medium text-base bg-gray-50 px-4 py-2 rounded-lg min-h-[42px] flex items-center">{value || 'Chưa cập nhật'}</p>
        )}
    </div>
)

const NurseProfile = () => {
    const { user, updateUser } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [profileData, setProfileData] = useState(null)
    const [activeTab, setActiveTab] = useState('personal')
    const [formData, setFormData] = useState({})

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true)
                const response = await nurseService.getProfile()
                const data = response.data || response.user || response
                setProfileData(data)
                setFormData({
                    full_name: data.full_name || data.name || '',
                    email: data.email || '',
                    phone_number: data.phone_number || data.phone || '',
                    dob: data.dob ? convertDateToInputFormat(data.dob) : '',
                    address: data.address || '',
                    department: data.department || '',
                    license_number: data.license_number || '',
                    experience_years: data.experience_years || '',
                    education: data.education || ''
                })
            } catch (error) {
                toast.error('Không thể tải thông tin cá nhân')
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

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

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = async () => {
        try {
            setLoading(true)
            const nurseId = profileData.nurse_id || profileData.id
            if (!nurseId) throw new Error('Nurse ID not found')

            const updateData = { ...formData, dob: convertDateToBackendFormat(formData.dob) }

            await nurseService.updateProfile(nurseId, updateData)
            const response = await nurseService.getProfile()
            const updatedData = response.data || response
            setProfileData(updatedData)
            updateUser(updatedData)
            setIsEditing(false)
            toast.success('Cập nhật thông tin thành công!')
        } catch (error) {
            toast.error('Có lỗi xảy ra khi cập nhật')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        setFormData(profileData)
        setIsEditing(false)
    }

    if (loading) {
        return <Layout><div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div></Layout>
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-center gap-8 mb-8">
                        <div className="relative">
                            <img src={profileData?.photo || '/path/to/default-avatar.png'} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"/>
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl font-bold text-gray-900">{profileData?.full_name}</h1>
                            <p className="text-lg text-green-600 font-semibold mt-1">Điều dưỡng</p>
                        </div>
                        <div className="md:ml-auto flex gap-2 mt-4 md:mt-0">
                            {!isEditing ? (
                                <Button onClick={() => setIsEditing(true)} className="bg-green-600 hover:bg-green-700 text-white"><Edit3 className="h-4 w-4 mr-2" />Chỉnh sửa</Button>
                            ) : (
                                <>
                                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white"><Save className="h-4 w-4 mr-2" />Lưu</Button>
                                    <Button onClick={handleCancel} variant="outline"><X className="h-4 w-4 mr-2" />Hủy</Button>
                                </>
                            )}
                        </div>
                    </motion.div>

                    <Card className="shadow-xl border-0 bg-white">
                        <CardHeader>
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                <button onClick={() => setActiveTab('personal')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'personal' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Thông tin cá nhân</button>
                                <button onClick={() => setActiveTab('professional')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'professional' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Thông tin nghề nghiệp</button>
                            </nav>
                        </CardHeader>
                        <CardContent className="p-6">
                            {activeTab === 'personal' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ProfileField icon={<User />} label="Họ và tên" value={formData.full_name} isEditing={isEditing} name="full_name" onChange={handleInputChange} />
                                    <ProfileField icon={<Mail />} label="Email" value={formData.email} isEditing={isEditing} name="email" onChange={handleInputChange} type="email" />
                                    <ProfileField icon={<Phone />} label="Số điện thoại" value={formData.phone_number} isEditing={isEditing} name="phone_number" onChange={handleInputChange} type="tel" />
                                    <ProfileField icon={<Calendar />} label="Ngày sinh" value={isEditing ? formData.dob : formatDate(profileData?.dob)} isEditing={isEditing} name="dob" onChange={handleInputChange} type="date" />
                                    <div className="md:col-span-2">
                                        <ProfileField icon={<MapPin />} label="Địa chỉ" value={formData.address} isEditing={isEditing} name="address" onChange={handleInputChange} />
                                    </div>
                                </motion.div>
                            )}
                            {activeTab === 'professional' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ProfileField icon={<Briefcase />} label="Khoa/Phòng" value={formData.department} isEditing={isEditing} name="department" onChange={handleInputChange} />
                                    <ProfileField icon={<Award />} label="Số chứng chỉ" value={formData.license_number} isEditing={isEditing} name="license_number" onChange={handleInputChange} />
                                    <ProfileField icon={<Briefcase />} label="Năm kinh nghiệm" value={formData.experience_years} isEditing={isEditing} name="experience_years" onChange={handleInputChange} type="number" />
                                    <div className="md:col-span-2">
                                        <ProfileField icon={<GraduationCap />} label="Học vấn" value={formData.education} isEditing={isEditing} name="education" onChange={handleInputChange} children={isEditing && <textarea name="education" value={formData.education} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />} />
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

export default NurseProfile