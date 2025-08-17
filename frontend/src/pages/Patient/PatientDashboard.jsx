import React, { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { Card, CardContent } from '../../components/ui/Card'
import { User, Calendar, Stethoscope, Clock, Phone, Mail, MapPin, ChevronDown } from 'lucide-react'
import { patientService } from '../../services/apiServices'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const PatientDashboard = () => {
    const { user } = useAuth()
    const [bookings, setBookings] = useState([])
    const [loadingBookings, setLoadingBookings] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const PAGE_SIZE = 8

    useEffect(() => {
        const fetchBookings = async () => {
            setLoadingBookings(true)
            try {
                const response = await patientService.getHistoryBooking(currentPage, PAGE_SIZE)
                console.log('API Response:', response)
                setBookings(response.data.data)
                console.log('Bookings State:', response.data)
                if (response.data.pagination) {
                    setTotalPages(Math.ceil(response.data.pagination.total / PAGE_SIZE) || 1)
                    console.log('Total Pages State:', Math.ceil(response.data.pagination.total / PAGE_SIZE))
                }
            } catch (error) {
                console.error('Error fetching bookings:', error)
                toast.error('Lỗi khi tải lịch sử đặt hẹn')
            } finally {
                setLoadingBookings(false)
            }
        }

        if (user) {
            fetchBookings()
        }
    }, [user, currentPage])

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('vi-VN')
    }

    const getBookingStatus = (appointmentDateString, createdAtString) => {
        const appointmentDate = new Date(appointmentDateString);
        const createdAt = new Date(createdAtString);
        const now = new Date();

        // If appointment date is in the future
        if (appointmentDate > now) {
            return { text: 'Đang chờ', color: 'bg-yellow-100 text-yellow-800' };
        }
        // If appointment date is in the past, consider it completed for simplicity
        // In a real app, you'd need a 'completed' flag from the backend
        if (appointmentDate < now) {
            return { text: 'Đã hoàn thành', color: 'bg-green-100 text-green-800' };
        }
        // If appointment date is today
        return { text: 'Đang diễn ra', color: 'bg-blue-100 text-blue-800' };
    };

    return (
        <Layout>
            <div className="min-h-screen bg-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Appointment History Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Lịch sử đặt hẹn</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-blue-50">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Dịch vụ</th>
                                        
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Ngày đặt</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingBookings ? (
                                        <tr>
                                            <td colSpan="3" className="text-center py-6">
                                                <p>Đang tải dữ liệu...</p>
                                            </td>
                                        </tr>
                                    ) : bookings && bookings.length > 0 ? (
                                        bookings.map((booking) => (
                                            <tr key={booking.queue_id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="py-3 px-4">{booking.service_name}</td>
                                                
                                                <td className="py-3 px-4">{formatDate(booking.created_at)}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBookingStatus(booking.appointment, booking.created_at).color}`}>
                                                        {getBookingStatus(booking.appointment, booking.created_at).text}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center py-6">
                                                <p>Không có lịch sử đặt hẹn.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-6 flex justify-center items-center space-x-4">
                            <button
                                onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
                            >
                                Trang trước
                            </button>
                            <span className="text-gray-700">
                                Trang {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
                            >
                                Trang sau
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default PatientDashboard
