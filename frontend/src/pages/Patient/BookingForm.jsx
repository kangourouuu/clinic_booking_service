import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Layout from '../../components/layout/Layout'
import {
    Calendar as CalendarIcon,
    Clock,
    User,
    Stethoscope,
    CreditCard,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    ArrowLeft,
    ShieldCheck,
    Sparkles
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'

const TIME_SLOTS = [
    { id: '08:00', label: '08:00 AM', period: 'Sáng' },
    { id: '08:30', label: '08:30 AM', period: 'Sáng' },
    { id: '09:00', label: '09:00 AM', period: 'Sáng' },
    { id: '09:30', label: '09:30 AM', period: 'Sáng' },
    { id: '10:00', label: '10:00 AM', period: 'Sáng' },
    { id: '10:30', label: '10:30 AM', period: 'Sáng' },
    { id: '11:00', label: '11:00 AM', period: 'Sáng' },
    { id: '13:30', label: '01:30 PM', period: 'Chiều' },
    { id: '14:00', label: '02:00 PM', period: 'Chiều' },
    { id: '14:30', label: '02:30 PM', period: 'Chiều' },
    { id: '15:00', label: '03:00 PM', period: 'Chiều' },
    { id: '15:30', label: '03:30 PM', period: 'Chiều' },
    { id: '16:00', label: '04:00 PM', period: 'Chiều' },
    { id: '16:30', label: '04:30 PM', period: 'Chiều' },
]

const DOCTORS = [
    {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'BS. CKII Nguyễn Văn Hùng',
        specialty: 'Khoa Nội Tổng Quát',
        experience: '15 năm kinh nghiệm',
        room: 'Phòng 201'
    },
    {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'ThS. BS Trần Thị Mai',
        specialty: 'Khoa Nhi & Tiêm chủng',
        experience: '10 năm kinh nghiệm',
        room: 'Phòng 104'
    },
    {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'BS. CKI Lê Hoàng Nam',
        specialty: 'Khoa Tim Mạch & Huyết áp',
        experience: '12 năm kinh nghiệm',
        room: 'Phòng 302'
    },
]

const BookingForm = () => {
    const { serviceId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [service, setService] = useState({
        service_id: serviceId || 'srv-general',
        service_name: 'Khám Nội Tổng Quát & Tư Vấn Sức Khỏe',
        service_code: 'MED-GEN-01',
        cost: 250000
    })

    const [selectedDoctor, setSelectedDoctor] = useState(DOCTORS[0])
    const [selectedDate, setSelectedDate] = useState(() => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow.toISOString().split('T')[0]
    })
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('09:00')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)

    // Try fetching service info if serviceId provided
    useEffect(() => {
        if (serviceId && serviceId !== 'undefined') {
            api.get(`/v1/catalog/services/${serviceId}`)
                .then(res => {
                    if (res.data?.data) {
                        setService(res.data.data)
                    }
                })
                .catch(() => {
                    // Fallback to default service
                })
        }
    }, [serviceId])

    const handleBookingAndPayment = async () => {
        if (!selectedDoctor || !selectedDate || !selectedTimeSlot) {
            toast.error('Vui lòng chọn đầy đủ bác sĩ, ngày khám và khung giờ!')
            return
        }

        setLoading(true)
        const idempotencyKey = `book_${user?.id || 'guest'}_${service.service_id}_${selectedDate}_${selectedTimeSlot}_${Date.now()}`

        try {
            // Step 1: Create atomic booking in Booking Service with anti-race lock
            const appointmentDateTime = new Date(`${selectedDate}T${selectedTimeSlot}:00Z`)
            const bookingPayload = {
                patient_id: user?.id || user?.patient_id || '99999999-9999-9999-9999-999999999999',
                patient_name: user?.name || user?.full_name || 'Bệnh nhân',
                patient_email: user?.email || 'patient@example.com',
                patient_phone: user?.phone || user?.phone_number || '0901234567',
                service_id: String(service.service_id),
                service_name: service.service_name,
                service_code: service.service_code,
                service_cost: service.cost,
                doctor_id: selectedDoctor.id,
                doctor_name: selectedDoctor.name,
                appointment_date: appointmentDateTime.toISOString(),
                time_slot: selectedTimeSlot,
                notes: notes
            }

            const bookingRes = await api.post('/v1/bookings', bookingPayload)
            console.log('Booking reserved:', bookingRes.data)

            // Step 2: Initialize Stripe Checkout session
            const checkoutPayload = {
                patient_id: bookingPayload.patient_id,
                patient_name: bookingPayload.patient_name,
                patient_email: bookingPayload.patient_email,
                patient_phone: bookingPayload.patient_phone,
                service_id: bookingPayload.service_id,
                service_name: bookingPayload.service_name,
                service_code: bookingPayload.service_code,
                cost: service.cost,
                appointment_date: appointmentDateTime.toISOString(),
                idempotency_key: idempotencyKey
            }

            const paymentRes = await api.post('/v1/payments/checkout', checkoutPayload)
            if (paymentRes.data?.data?.checkout_url) {
                toast.success('Đặt chỗ thành công! Đang chuyển hướng đến cổng thanh toán bảo mật...')
                window.location.href = paymentRes.data.data.checkout_url
            } else {
                toast.success('Đặt chỗ thành công!')
                navigate('/patient/bookings')
            }
        } catch (error) {
            console.error('Booking error:', error)
            const errMsg = error.response?.data?.error || error.message || 'Không thể tạo lịch hẹn'
            toast.error(errMsg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Header with Back button */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1.5" />
                            Quay lại danh mục
                        </button>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            Bảo mật thanh toán & Giữ chỗ tức thì
                        </span>
                    </div>

                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Đặt Lịch Khám & Hẹn Giờ Thông Minh
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Chọn bác sĩ chuyên khoa và khung giờ thuận tiện nhất cho bạn.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Column: Form Selection */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* 1. Selected Service Info */}
                            <Card className="border-primary-100 shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base text-slate-800 flex items-center justify-between">
                                        <span>Dịch vụ đã chọn</span>
                                        <span className="text-primary-600 font-bold text-lg font-mono">
                                            {Number(service.cost).toLocaleString('vi-VN')} đ
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-primary-50/60 rounded-xl p-4 border border-primary-100/80">
                                        <h3 className="font-bold text-slate-900 text-base">{service.service_name}</h3>
                                        <p className="text-xs text-slate-500 mt-1">Mã dịch vụ: {service.service_code || 'MED-01'}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 2. Doctor Selection */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                                        <Stethoscope className="w-5 h-5 text-primary-600" />
                                        <span>1. Chọn Bác sĩ phụ trách</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {DOCTORS.map((doc) => {
                                            const isSelected = selectedDoctor?.id === doc.id
                                            return (
                                                <div
                                                    key={doc.id}
                                                    onClick={() => setSelectedDoctor(doc)}
                                                    className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${
                                                        isSelected
                                                            ? 'border-primary-600 bg-primary-50/40 shadow-md ring-2 ring-primary-500/20'
                                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                                    }`}
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center mb-3">
                                                        {doc.name.split(' ').slice(-1)[0][0]}
                                                    </div>
                                                    <h4 className="font-bold text-slate-900 text-sm leading-tight">{doc.name}</h4>
                                                    <p className="text-xs text-primary-700 font-medium mt-1">{doc.specialty}</p>
                                                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                                                        <span>{doc.room}</span>
                                                        <span className="text-emerald-600 font-semibold">Sẵn sàng</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 3. Date & Time Selection */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                                        <CalendarIcon className="w-5 h-5 text-primary-600" />
                                        <span>2. Chọn Ngày & Khung giờ khám</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Date Input */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                                            Ngày hẹn khám
                                        </label>
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                                        />
                                    </div>

                                    {/* Time Slot Grid */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                                            Khung giờ khám còn trống (30 phút / lượt)
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                                            {TIME_SLOTS.map((slot) => {
                                                const isSelected = selectedTimeSlot === slot.id
                                                return (
                                                    <button
                                                        key={slot.id}
                                                        type="button"
                                                        onClick={() => setSelectedTimeSlot(slot.id)}
                                                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                                                            isSelected
                                                                ? 'bg-primary-600 text-white border-primary-600 shadow-sm scale-105'
                                                                : 'bg-white text-slate-700 border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        {slot.id}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 4. Reason / Clinical Notes */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base text-slate-800">
                                        3. Lý do khám hoặc triệu chứng (không bắt buộc)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <textarea
                                        rows={3}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Mô tả triệu chứng hoặc lý do khám để bác sĩ chuẩn bị tốt hơn..."
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Sticky Summary & Checkout */}
                        <div className="lg:col-span-4 sticky top-6">
                            <Card className="border-slate-200 shadow-xl bg-white overflow-hidden">
                                <div className="bg-gradient-to-r from-primary-600 to-sky-700 p-5 text-white">
                                    <span className="text-xs uppercase font-bold tracking-wider text-sky-200">Xác nhận lịch hẹn</span>
                                    <h3 className="text-xl font-bold mt-1">Chi tiết đặt hẹn</h3>
                                </div>
                                <CardContent className="p-5 space-y-4">
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between pb-2 border-b border-slate-100">
                                            <span className="text-slate-500">Bệnh nhân</span>
                                            <span className="font-semibold text-slate-800">{user?.name || user?.full_name || 'Tôi'}</span>
                                        </div>
                                        <div className="flex justify-between pb-2 border-b border-slate-100">
                                            <span className="text-slate-500">Bác sĩ</span>
                                            <span className="font-semibold text-slate-800">{selectedDoctor?.name}</span>
                                        </div>
                                        <div className="flex justify-between pb-2 border-b border-slate-100">
                                            <span className="text-slate-500">Địa điểm</span>
                                            <span className="font-semibold text-slate-800">{selectedDoctor?.room}</span>
                                        </div>
                                        <div className="flex justify-between pb-2 border-b border-slate-100">
                                            <span className="text-slate-500">Thời gian</span>
                                            <span className="font-semibold text-primary-700">
                                                {selectedTimeSlot} • {selectedDate}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-slate-200 space-y-2">
                                        <div className="flex justify-between text-sm text-slate-600">
                                            <span>Phí dịch vụ</span>
                                            <span>{Number(service.cost).toLocaleString('vi-VN')} đ</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-slate-600">
                                            <span>Phí đặt chỗ trực tuyến</span>
                                            <span className="text-emerald-600 font-semibold">Miễn phí</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-black text-slate-900 pt-2 border-t border-slate-100">
                                            <span>Tổng thanh toán</span>
                                            <span className="text-primary-600">{Number(service.cost).toLocaleString('vi-VN')} đ</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleBookingAndPayment}
                                        loading={loading}
                                        className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2 mt-4"
                                    >
                                        <CreditCard className="w-5 h-5" />
                                        <span>Xác nhận & Thanh toán ngay</span>
                                    </Button>

                                    <div className="text-center pt-2">
                                        <p className="text-[11px] text-slate-400">
                                            Khóa vị trí tức thì 15 phút. Hoàn tiền 100% nếu phiên hẹn bị quá hạn hoặc hủy hợp lệ.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default BookingForm
