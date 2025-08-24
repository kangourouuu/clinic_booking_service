import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Layout from '../../components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Calendar, Clock, Stethoscope, CheckCircle, XCircle, AlertCircle, Loader, ArrowLeft, ArrowRight, Star, List, LayoutGrid } from 'lucide-react'
import { patientService } from '../../services/apiServices'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'

// New StatCard component for the overview tab
const StatCard = ({ title, value, icon, color }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="shadow-lg border-0">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
                    {icon}
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
    const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
    const PAGE_SIZE = 6

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
            // Fetch all bookings for overview stats. In a real app, this would be a separate API endpoint.
            const response = await patientService.getHistoryBooking(1, 1000) 
            const fetched = response.data.Data || []
            
            const statusOrder = { 'waiting': 1, 'confirmed': 2, 'completed': 3, 'cancelled': 4 }
            fetched.sort((a, b) => (statusOrder[a.booking_status] || 99) - (statusOrder[b.booking_status] || 99))
            
            setAllBookings(fetched)
            setTotalPages(Math.ceil(fetched.length / PAGE_SIZE))
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
            case 'waiting': return { text: 'Chờ xác nhận', color: 'yellow', icon: <Loader className="h-4 w-4 animate-spin" /> }
            case 'confirmed': return { text: 'Đã xác nhận', color: 'blue', icon: <CheckCircle className="h-4 w-4" /> }
            case 'completed': return { text: 'Đã khám', color: 'green', icon: <CheckCircle className="h-4 w-4" /> }
            case 'cancelled': return { text: 'Đã hủy', color: 'red', icon: <XCircle className="h-4 w-4" /> }
            default: return { text: 'Không xác định', color: 'gray', icon: <AlertCircle className="h-4 w-4" /> }
        }
    }

    const WelcomeHeader = () => (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/10 rounded-full"></div>
            <h1 className="text-4xl font-bold z-10 relative">Chào mừng, {user?.full_name || 'Bệnh nhân'}!</h1>
            <p className="mt-2 text-blue-100 z-10 relative">Đây là không gian quản lý sức khỏe cá nhân của bạn.</p>
        </motion.div>
    )

    const BookingCard = ({ booking }) => {
        const status = getBookingStatus(booking.booking_status)
        return (
            <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-l-8 border-${status.color}-500`}>
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-${status.color}-100 text-${status.color}-800`}>
                            {status.icon} <span className="ml-1.5">{status.text}</span>
                        </span>
                        <div className="text-right">
                            <p className="font-bold text-gray-800">#{booking.queue_id.substring(0, 8)}</p>
                            <p className="text-xs text-gray-500">Mã lịch hẹn</p>
                        </div>
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 flex items-center mb-3">
                        <Stethoscope className="h-6 w-6 mr-3 text-blue-500" />
                        {booking.service_name}
                    </h3>
                    <div className="border-t border-gray-100 my-4"></div>
                    <div className="text-sm text-gray-600 space-y-2">
                        <div className="flex items-center"><Calendar className="h-4 w-4 mr-3 text-gray-400" /><span>Ngày hẹn: <strong>{formatDate(booking.appointment_date)}</strong></span></div>
                        <div className="flex items-center"><Clock className="h-4 w-4 mr-3 text-gray-400" /><span>Giờ hẹn: <strong>{booking.time_slot || 'Chưa xác định'}</strong></span></div>
                        <div className="flex items-center"><Stethoscope className="h-4 w-4 mr-3 text-gray-400" /><span>Bác sĩ: <strong>{booking.doctor_name || 'Chưa chỉ định'}</strong></span></div>
                    </div>
                </div>
            </motion.div>
        )
    }

    const Pagination = () => (
        <div className="mt-8 flex justify-center items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><ArrowLeft className="h-4 w-4" /></Button>
            <span className="text-gray-700 font-medium">Trang {currentPage} / {totalPages}</span>
            <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}><ArrowRight className="h-4 w-4" /></Button>
        </div>
    )

    return (
        <Layout>
            <div className="min-h-screen bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <WelcomeHeader />
                    <Card className="shadow-xl border-0 bg-white">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                    <button onClick={() => setActiveTab('overview')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Tổng quan</button>
                                    <button onClick={() => setActiveTab('appointments')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'appointments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Lịch hẹn</button>
                                </nav>
                                {activeTab === 'appointments' && (
                                    <div className="flex items-center gap-2">
                                        <Button variant={viewMode === 'grid' ? 'primary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}><LayoutGrid className="h-5 w-5" /></Button>
                                        <Button variant={viewMode === 'list' ? 'primary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}><List className="h-5 w-5" /></Button>
                                    </div>
                                )}
                            </div>
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
                                            <BookingCard booking={dashboardStats.nextAppointment} />
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                            {activeTab === 'appointments' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {loading ? (
                                        <div className="text-center py-20"><Loader className="h-10 w-10 mx-auto animate-spin text-blue-500" /><p className="mt-3 text-gray-500">Đang tải lịch hẹn...</p></div>
                                    ) : paginatedBookings.length > 0 ? (
                                        <>
                                            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                                                {paginatedBookings.map((booking) => <BookingCard key={booking.queue_id} booking={booking} />)}
                                            </div>
                                            <Pagination />
                                        </>
                                    ) : (
                                        <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed">
                                            <Calendar className="h-16 w-16 mx-auto text-gray-300" />
                                            <h3 className="mt-4 text-lg font-medium text-gray-800">Không tìm thấy lịch hẹn</h3>
                                            <p className="mt-1 text-sm text-gray-500">Bạn chưa có lịch sử đặt hẹn nào.</p>
                                        </div>
                                    )}
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
