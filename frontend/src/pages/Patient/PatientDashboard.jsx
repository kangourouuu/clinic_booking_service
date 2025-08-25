import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Layout from '../../components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Calendar, Clock, Stethoscope, CheckCircle, XCircle, AlertCircle, Loader, ArrowLeft, ArrowRight, User, Pill } from 'lucide-react'
import { patientService } from '../../services/apiServices'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'

// New StatCard component for the overview tab
const StatCard = ({ title, value, icon, color }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} whileHover={{ y: -5 }} className="h-full">
        <Card className="h-full shadow-lg border-gray-200/80 hover:border-primary-300/50 hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600 group-hover:scale-110 transition-transform duration-300`}>
                    {React.cloneElement(icon, { className: "h-6 w-6" })}
                </div>
            </CardContent>
        </Card>
    </motion.div>
)

const PatientDashboard = () => {
    const { user } = useAuth()
    const [allBookings, setAllBookings] = useState([])
    const [paginatedBookings, setPaginatedBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [activeTab, setActiveTab] = useState('overview')
    const PAGE_SIZE = 5 // Adjusted for list view

    // New state for detail view
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [loadingDetail, setLoadingDetail] = useState(false)

    useEffect(() => {
        if (user) {
            fetchAllBookings()
        }
    }, [user])

    useEffect(() => {
        if (allBookings.length > 0) {
            paginateBookings(currentPage)
        }
    }, [allBookings, currentPage])

    const fetchAllBookings = async () => {
        setLoading(true)
        try {
            const response = await patientService.getHistoryBooking(1, 1000)
            const fetched = response.data.data || []

            if (Array.isArray(fetched)) {
                const statusOrder = { 'waiting': 1, 'confirmed': 2, 'completed': 3, 'cancelled': 4 }
                fetched.sort((a, b) => (statusOrder[a.booking_status] || 99) - (statusOrder[b.booking_status] || 99))
                setAllBookings(fetched)
                setTotalPages(Math.ceil(fetched.length / PAGE_SIZE))
            } else {
                setAllBookings([])
                setTotalPages(1)
            }
        } catch (error) {
            console.error('Error fetching all bookings:', error)
            toast.error('Lỗi khi tải dữ liệu đặt hẹn')
        } finally {
            setLoading(false)
        }
    }

    const paginateBookings = (page) => {
        const startIndex = (page - 1) * PAGE_SIZE
        const endIndex = startIndex + PAGE_SIZE
        setPaginatedBookings(allBookings.slice(startIndex, endIndex))
    }

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
        }
    }

    const handleBookingClick = async (booking) => {
        if (selectedBooking?.queue_id === booking.queue_id) {
            setSelectedBooking(null) // Deselect if clicking the same one
            return
        }
        setLoadingDetail(true)
        setSelectedBooking(null)
        try {
            const response = await patientService.getBookingDetail(booking.queue_id)
            setSelectedBooking(response.data) 
        } catch (error) {
            console.error('Error fetching booking detail:', error)
            toast.error('Lỗi khi tải chi tiết lịch hẹn')
            setSelectedBooking(null)
        } finally {
            setLoadingDetail(false)
        }
    }

    const dashboardStats = useMemo(() => {
        const total = allBookings.length
        const completed = allBookings.filter(b => b.booking_status === 'completed').length
        const upcoming = allBookings.filter(b => ['waiting', 'confirmed'].includes(b.booking_status)).length
        const nextAppointment = allBookings.find(b => ['waiting', 'confirmed'].includes(b.booking_status))
        return { total, completed, upcoming, nextAppointment }
    }, [allBookings])

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

    const getBookingStatus = (status) => {
        switch (status) {
            case 'waiting': return { text: 'Chờ đến khám', color: 'yellow', icon: <Loader className="h-6 w-6 animate-spin" /> }
            case 'confirmed': return { text: 'Đã xác nhận', color: 'blue', icon: <CheckCircle className="h-6 w-6" /> }
            case 'completed': return { text: 'Đã khám', color: 'green', icon: <CheckCircle className="h-6 w-6" /> }
            case 'created drug receipt': return { text: 'Đã lập đơn thuốc', color: 'purple', icon: <Pill className="h-6 w-6" /> }
            case 'cancelled': return { text: 'Đã hủy', color: 'red', icon: <XCircle className="h-6 w-6" /> }
            default: return { text: 'Không xác định', color: 'gray', icon: <AlertCircle className="h-6 w-6" /> }
        }
    }

    const WelcomeHeader = () => (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/10 rounded-full"></div>
            <h1 className="text-4xl font-bold z-10 relative">Chào mừng, {user?.full_name || 'Bệnh nhân'}!</h1>
            <p className="mt-2 text-primary-100 z-10 relative">Đây là không gian quản lý sức khỏe cá nhân của bạn.</p>
        </motion.div>
    )

    const BookingCard = ({ booking, onClick, isSelected }) => {
        const status = getBookingStatus(booking.booking_status)
        return (
            <motion.div
                layout
                onClick={onClick}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${isSelected ? 'border-primary-500 bg-primary-50 shadow-md' : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'}`}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${status.color}-100`}>
                        {React.cloneElement(status.icon, { className: "h-6 w-6" })}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{booking.service_name}</h3>
                        <p className="text-sm text-gray-500">#{booking.queue_id ? String(booking.queue_id).substring(0, 8) : ''}</p>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="text-sm font-bold text-gray-800">{formatDate(booking.appointment)}</p>
                        <p className={`text-xs font-semibold text-${status.color}-800`}>{status.text}</p>
                    </div>
                </div>
            </motion.div>
        )
    }

    const BookingDetailCard = ({ booking }) => {
        const status = getBookingStatus(booking.booking_status)
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Chi tiết lịch hẹn</h2>
                <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-gray-50 border">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">{booking.service_name}</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-${status.color}-100 text-${status.color}-800`}>
                            {React.cloneElement(status.icon, { className: "h-4 w-4" })} <span className="ml-1.5">{status.text}</span>
                        </span>
                    </div>
                    <div className="text-sm text-gray-700 space-y-3 pt-4 border-t">
                        <div className="flex justify-between"><span>Mã lịch hẹn:</span><strong className="text-right">#{booking.queue_id ? String(booking.queue_id).substring(0, 8) : ''}</strong></div>
                        <div className="flex justify-between"><span>Ngày hẹn:</span><strong className="text-right">{formatDate(booking.appointment)}</strong></div>
                        <div className="flex justify-between"><span>Giờ hẹn:</span><strong className="text-right">{booking.time_slot || 'Chưa xác định'}</strong></div>
                        {booking.doctor_name && (
                            <div className="flex justify-between"><span>Bác sĩ:</span><strong className="text-right">{booking.doctor_name}</strong></div>
                        )}
                    </div>

                    {/* Prescription Section */}
                    <div className="pt-4 border-t">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">Đơn thuốc</h3>
                        {(booking.drug_name || booking.notes || booking.usage_instructions) ? (
                            <div className="text-sm text-gray-700 space-y-3">
                                {booking.drug_name && (
                                    <div className="flex justify-between"><span>Tên thuốc:</span><strong className="text-right">{booking.drug_name}</strong></div>
                                )}
                                {booking.usage_instructions && (
                                    <div className="flex justify-between"><span>Hướng dẫn:</span><strong className="text-right">{booking.usage_instructions}</strong></div>
                                )}
                                {booking.notes && (
                                    <div className="flex justify-between"><span>Ghi chú:</span><strong className="text-right">{booking.notes}</strong></div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Chưa có đơn thuốc được tạo</p>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    const Pagination = () => (
        <div className="mt-8 flex justify-center items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="border-gray-300 hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-gray-700 font-medium px-3 py-2 rounded-lg bg-gray-100 border border-gray-200">Trang {currentPage} / {totalPages}</span>
            <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="border-gray-300 hover:bg-gray-100">
                <ArrowRight className="h-4 w-4" />
            </Button>
        </div>
    )

    return (
        <Layout>
            <div className="min-h-screen bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <WelcomeHeader />
                    <Card className="shadow-xl border-0 bg-white">
                        <CardHeader>
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                <button onClick={() => setActiveTab('overview')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Tổng quan</button>
                                <button onClick={() => setActiveTab('appointments')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'appointments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Lịch hẹn</button>
                            </nav>
                        </CardHeader>
                        <CardContent className="p-6 bg-gray-50/50">
                            {activeTab === 'overview' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <StatCard title="Tổng số lịch hẹn" value={dashboardStats.total} icon={<Calendar className="h-6 w-6" />} color="blue" />
                                        <StatCard title="Lịch hẹn sắp tới" value={dashboardStats.upcoming} icon={<Clock className="h-6 w-6" />} color="yellow" />
                                        <StatCard title="Lịch đã hoàn thành" value={dashboardStats.completed} icon={<CheckCircle className="h-6 w-6" />} color="green" />
                                    </div>
                                    {dashboardStats.nextAppointment && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                                            <h3 className="text-xl font-bold text-gray-800 mb-4">Lịch hẹn sắp tới</h3>
                                            <BookingCard booking={dashboardStats.nextAppointment} onClick={() => handleBookingClick(dashboardStats.nextAppointment)} isSelected={selectedBooking?.queue_id === dashboardStats.nextAppointment.queue_id} />
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                            {activeTab === 'appointments' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-1">
                                            {loading ? (
                                                <div className="text-center py-20"><Loader className="h-10 w-10 mx-auto animate-spin text-blue-500" /><p className="mt-3 text-gray-500">Đang tải lịch hẹn...</p></div>
                                            ) : paginatedBookings.length > 0 ? (
                                                <>
                                                    <div className="space-y-3">
                                                        {paginatedBookings.map((booking) => <BookingCard key={booking.queue_id} booking={booking} onClick={() => handleBookingClick(booking)} isSelected={selectedBooking?.queue_id === booking.queue_id} />)}
                                                    </div>
                                                    <Pagination />
                                                </>
                                            ) : (
                                                <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-200">
                                                    <Calendar className="h-20 w-20 mx-auto text-gray-300 mb-4" />
                                                    <h3 className="mt-4 text-xl font-semibold text-gray-800">Không tìm thấy lịch hẹn</h3>
                                                    <p className="mt-2 text-gray-600">Bạn chưa có lịch sử đặt hẹn nào.</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="lg:col-span-2">
                                            {loadingDetail ? (
                                                <div className="flex items-center justify-center h-full"><Loader className="h-8 w-8 animate-spin text-blue-500" /></div>
                                            ) : selectedBooking ? (
                                                <BookingDetailCard booking={selectedBooking} />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-center bg-white rounded-2xl shadow-lg p-6">
                                                    <User className="h-20 w-20 text-gray-300" />
                                                    <p className="mt-4 text-lg font-medium text-gray-600">Chọn một lịch hẹn</p>
                                                    <p className="text-sm text-gray-400">Chi tiết sẽ được hiển thị ở đây.</p>
                                                </div>
                                            )}
                                        </div>
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

export default PatientDashboard