import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Calendar, FileText, User, Mail, Phone, DollarSign, Tag, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { patientService } from '../../services/apiServices';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';

const BookingHistory = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user) {
                setLoading(false);
                setError("Bạn cần đăng nhập để xem lịch sử đặt lịch.");
                return;
            }

            try {
                setLoading(true);
                const response = await patientService.getHistoryBooking(currentPage, pageSize);
                
                // Correctly parse the nested response from the Go backend
                const responseData = response.data || {};
                const data = responseData.Data || [];
                const paginationInfo = responseData.Pagination || {};
                const total = paginationInfo.total || 0;

                if (Array.isArray(data)) {
                    setBookings(data);
                    setTotalItems(total);
                    setTotalPages(Math.ceil(total / pageSize));
                } else {
                    setBookings([]);
                    console.warn("API did not return an array for booking history:", data);
                }
            } catch (err) {
                console.error("Error fetching booking history:", err);
                setError(err.message || 'Không thể tải lịch sử đặt lịch. Vui lòng thử lại sau.');
                toast.error('Đã xảy ra lỗi khi tải dữ liệu.');
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [user, currentPage]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Ngày không hợp lệ';
            return date.toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Lỗi định dạng ngày';
        }
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Lịch sử Đặt lịch</h1>
                        <p className="text-lg text-gray-600">Xem lại toàn bộ các lần đặt lịch khám của bạn.</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 px-6 bg-red-50 rounded-lg shadow-md">
                            <Info className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <p className="text-xl font-semibold text-red-700">{error}</p>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-12 px-6 bg-gray-50 rounded-lg shadow-md">
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-xl font-semibold text-gray-700">Không có lịch sử đặt lịch</p>
                            <p className="text-gray-500 mt-2">Bạn chưa thực hiện đặt lịch khám nào.</p>
                        </div>
                    ) : (
                        <>
                            <div className="shadow-2xl rounded-xl overflow-hidden bg-white">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"><User className="inline h-5 w-5 mr-1 text-blue-600" />Tên bệnh nhân</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"><Mail className="inline h-5 w-5 mr-1 text-blue-600" />Email</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"><Phone className="inline h-5 w-5 mr-1 text-blue-600" />Số điện thoại</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"><FileText className="inline h-5 w-5 mr-1 text-blue-600" />Dịch vụ</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"><Tag className="inline h-5 w-5 mr-1 text-blue-600" />Mã DV</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"><DollarSign className="inline h-5 w-5 mr-1 text-green-600" />Chi phí</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"><Calendar className="inline h-5 w-5 mr-1 text-purple-600" />Ngày hẹn</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"><Calendar className="inline h-5 w-5 mr-1 text-gray-500" />Ngày tạo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {bookings.map((booking, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors duration-200">
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{booking.patient_name}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{booking.patient_email}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{booking.patient_phone_number}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{booking.service_name}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {booking.service_code}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-green-600 font-semibold">{booking.cost?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-purple-600">{formatDate(booking.appointment)}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDate(booking.created_at)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-6">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Hiển thị <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> - <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> trên <span className="font-medium">{totalItems}</span> kết quả
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handlePrevPage} disabled={currentPage === 1} variant="outline">
                                        <ChevronLeft className="h-5 w-5 mr-1" />
                                        Trước
                                    </Button>
                                    <Button onClick={handleNextPage} disabled={currentPage >= totalPages} variant="outline">
                                        Sau
                                        <ChevronRight className="h-5 w-5 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default BookingHistory;