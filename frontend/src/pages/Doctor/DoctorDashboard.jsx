import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Layout from '../../components/layout/Layout'
import {
    Users,
    Calendar,
    User,
    FileText,
    Activity,
    Clock,
    TrendingUp,
    Heart,
    CheckSquare,
    AlertCircle,
    Pill,
    Phone,
    MapPin,
    Mail,
    Wifi,
    WifiOff,
    RefreshCw
} from 'lucide-react'
import { doctorService, nurseService } from '../../services/apiServices'
import { useAuth } from '../../context/AuthContext'
import useWebSocket from '../../hooks/useWebSocket'
import toast from 'react-hot-toast'

const DoctorDashboard = () => {
    const { user } = useAuth()
    const [stats, setStats] = useState({
        totalQueues: 0,
        pendingQueues: 0,
        completedToday: 0,
        totalPatients: 0
    })
    const [queues, setQueues] = useState([])
    const [selectedQueue, setSelectedQueue] = useState(null)
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [selectedService, setSelectedService] = useState(null)
    const [loading, setLoading] = useState(true)
    const [loadingPatient, setLoadingPatient] = useState(false)

    // WebSocket configuration
    const wsUrl = process.env.NODE_ENV === 'development'
        ? 'ws://localhost:9000/api/doctor/queues'
        : `wss://${window.location.host}/api/doctor/queues`    // Handle WebSocket messages
    const handleWebSocketMessage = (data) => {
        console.log('Doctor Dashboard - WebSocket message:', data)

        // Handle simple trigger messages from Redis
        if (typeof data === 'string') {
            console.log('Doctor Dashboard - Received trigger:', data)
            return
        }

        // Handle structured JSON messages
        if (typeof data === 'object' && data.type) {
            switch (data.type) {
                case 'queue_list':
                case 'queue_updated':
                    console.log('Doctor Dashboard - Updating queue list:', data.data)

                    if (data.data && Array.isArray(data.data)) {
                        // Sort queues by queue_id (ascending) to show FIFO order
                        const sortedQueues = data.data.sort((a, b) => a.queue_id - b.queue_id)

                        setQueues(sortedQueues)
                        setStats(prev => ({
                            ...prev,
                            totalQueues: sortedQueues.length,
                            pendingQueues: sortedQueues.length,
                            completedToday: 0,
                            totalPatients: sortedQueues.length
                        }))

                        // Show toast notification for updates
                        if (data.type === 'queue_updated') {
                            toast.info('Danh sách bệnh nhân đã được cập nhật')
                        }

                        console.log('Doctor Dashboard - Queue data updated:', sortedQueues.length, 'queues')
                    } else {
                        setQueues([])
                        setStats(prev => ({
                            ...prev,
                            totalQueues: 0,
                            pendingQueues: 0,
                            completedToday: 0,
                            totalPatients: 0
                        }))
                    }
                    setLoading(false)
                    break

                case 'queue_added':
                    console.log('Doctor Dashboard - New queue added:', data.queue)
                    if (data.queue) {
                        setQueues(prev => {
                            const newQueues = [...prev, data.queue].sort((a, b) => a.queue_id - b.queue_id)
                            return newQueues
                        })
                        setStats(prev => ({
                            ...prev,
                            totalQueues: prev.totalQueues + 1,
                            pendingQueues: prev.pendingQueues + 1,
                            totalPatients: prev.totalPatients + 1
                        }))
                        toast.success(`Bệnh nhân mới: ${data.queue.patient_name || 'Không rõ tên'}`)
                    }
                    break

                case 'queue_removed':
                    console.log('Doctor Dashboard - Queue removed:', data.queue_id)
                    if (data.queue_id) {
                        setQueues(prev => prev.filter(q => q.queue_id !== data.queue_id))
                        setStats(prev => ({
                            ...prev,
                            totalQueues: Math.max(0, prev.totalQueues - 1),
                            pendingQueues: Math.max(0, prev.pendingQueues - 1),
                            completedToday: prev.completedToday + 1
                        }))
                        toast.info('Bệnh nhân đã hoàn thành khám')
                    }
                    break

                case 'error':
                    console.error('Doctor Dashboard - WebSocket error:', data.message)
                    toast.error(data.message || 'Lỗi kết nối WebSocket')
                    break

                default:
                    console.log('Doctor Dashboard - Unknown message type:', data.type)
            }
        }
    }

    const handleWebSocketOpen = () => {
        console.log('Doctor Dashboard - WebSocket connected')
        setLoading(true)

        // Request initial queue data with small delay to ensure connection is ready
        setTimeout(() => {
            sendMessage({
                type: 'get_queues',
                doctor_id: user?.id
            })
        }, 100)

        toast.success('Kết nối real-time đã được thiết lập')
    }

    const handleWebSocketClose = () => {
        console.log('Doctor Dashboard - WebSocket disconnected')
        toast.error('Mất kết nối real-time')
    }

    const handleWebSocketError = (error) => {
        console.error('Doctor Dashboard - WebSocket error:', error)
        setLoading(false)
        toast.error('Lỗi kết nối WebSocket')
    }

    // Initialize WebSocket
    const { isConnected, sendMessage, reconnect } = useWebSocket(wsUrl, {
        onMessage: handleWebSocketMessage,
        onOpen: handleWebSocketOpen,
        onClose: handleWebSocketClose,
        onError: handleWebSocketError,
        shouldReconnect: process.env.NODE_ENV !== 'development', // Disable auto-reconnect in dev
        reconnectAttempts: 3,
        reconnectInterval: 10000
    })

    // Function to refresh queues manually
    const refreshQueues = () => {
        if (isConnected && user?.id) {
            sendMessage({
                type: 'get_queues',
                doctor_id: user.id
            })
        } else {
            reconnect()
        }
    }

    // Function to complete a queue
    const completeQueue = (queueId) => {
        if (isConnected) {
            sendMessage({
                type: 'complete_queue',
                queue_id: queueId,
                doctor_id: user?.id
            })
        } else {
            toast.error('Không có kết nối WebSocket')
        }
    }

    const statCards = [
        {
            title: 'Tổng Hàng Đợi',
            value: stats.totalQueues,
            icon: Users,
            color: 'bg-gradient-to-r from-blue-500 to-blue-600',
            change: '+5%'
        },
        {
            title: 'Đang Chờ Khám',
            value: stats.pendingQueues,
            icon: Clock,
            color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
            change: '+12%'
        },
        {
            title: 'Đã Khám Hôm Nay',
            value: stats.completedToday,
            icon: CheckSquare,
            color: 'bg-gradient-to-r from-green-500 to-green-600',
            change: '+8%'
        },
        {
            title: 'Tổng Bệnh Nhân',
            value: stats.totalPatients,
            icon: Activity,
            color: 'bg-gradient-to-r from-purple-500 to-purple-600',
            change: '+3%'
        }
    ]

    const handleCreatePrescription = (queue) => {
        // TODO: Implement prescription creation
        const patientName = queue.patient_name || queue.patientName || queue.patient?.full_name || queue.patient?.name || 'bệnh nhân'
        toast.success(`Tạo phiếu thuốc cho ${patientName}`)
    }

    const handleSelectQueue = async (queue) => {
        console.log('Doctor Dashboard - Selected queue object:', queue)
        console.log('Doctor Dashboard - Queue keys:', Object.keys(queue))
        console.log('Doctor Dashboard - Service name in queue:', queue.service_name)
        console.log('Doctor Dashboard - Service code in queue:', queue.service_code)
        setSelectedQueue(queue)
        setSelectedPatient(null)
        setSelectedService(null)

        // Load patient details if patient_id exists
        if (queue.patient_id) {
            setLoadingPatient(true)
            try {
                console.log('Doctor Dashboard - Fetching patient details for ID:', queue.patient_id)
                const patientData = await doctorService.getPatientById(queue.patient_id)
                console.log('Doctor Dashboard - Patient details response:', patientData)
                console.log('Doctor Dashboard - Patient data structure:', JSON.stringify(patientData, null, 2))
                setSelectedPatient(patientData.data || patientData)
            } catch (error) {
                console.error('Error fetching patient details:', error)
                toast.error('Không thể tải thông tin bệnh nhân chi tiết')
            } finally {
                setLoadingPatient(false)
            }
        } else {
            console.log('Doctor Dashboard - No patient_id found in queue, using queue data only')
        }

        // Load service details if service_name exists
        if (queue.service_name) {
            try {
                console.log('Doctor Dashboard - Service name:', queue.service_name)
                // Service name is already available from the queue data
            } catch (error) {
                console.error('Error with service details:', error)
            }
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return 'N/A'
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
        } catch (error) {
            return 'N/A'
        }
    }

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
                <div className="p-6">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
                            <Heart className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Xin chào, {user?.name || user?.full_name || 'Bác sĩ'}!
                        </h1>
                        <p className="text-gray-600">Bảng điều khiển bác sĩ - Quản lý hàng đợi và bệnh nhân</p>
                    </motion.div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statCards.map((card, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                                        </div>
                                        <div className={`p-3 rounded-full ${card.color}`}>
                                            <card.icon className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center">
                                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                        <span className="text-sm text-green-500 font-medium">{card.change}</span>
                                        <span className="text-sm text-gray-500 ml-2">so với tuần trước</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Queue List */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-xl shadow-lg p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Hàng Đợi Khám Bệnh</h2>
                                <div className="flex items-center space-x-4">
                                    {/* WebSocket Connection Status */}
                                    <div className="flex items-center space-x-2">
                                        {isConnected ? (
                                            <>
                                                <Wifi className="w-4 h-4 text-green-500" />
                                                <span className="text-sm text-green-600">Real-time</span>
                                            </>
                                        ) : (
                                            <>
                                                <WifiOff className="w-4 h-4 text-red-500" />
                                                <span className="text-sm text-red-600">Mất kết nối</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Refresh Button */}
                                    <button
                                        onClick={refreshQueues}
                                        disabled={loading}
                                        className="flex items-center space-x-1 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 transition-colors"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                        <span>Làm mới</span>
                                    </button>

                                    <div className="text-sm text-gray-500">
                                        {queues.length} bệnh nhân • Theo thứ tự
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {queues.length > 0 ? (
                                    queues.map((queue, index) => (
                                        <div
                                            key={queue.queue_id || index}
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedQueue?.queue_id === queue.queue_id
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                                                }`}
                                            onClick={() => handleSelectQueue(queue)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                        <User className="h-5 w-5 text-purple-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 text-base">
                                                            {queue.patient_name || queue.full_name || 'Chưa có tên'}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {/* Hiển thị service_name */}
                                                            {queue.service_name || `[Mã: ${queue.service_code}]` || 'Dịch vụ khám bệnh'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="text-right">
                                                        <div className="text-sm font-medium text-purple-600 mb-1">
                                                            #{queue.queue_id}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {formatDate(queue.created_at)}
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500">Không có hàng đợi nào</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Queue Details */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-xl shadow-lg p-6"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Chi Tiết Bệnh Nhân</h2>

                            {selectedQueue ? (
                                <div className="space-y-6">
                                    {loadingPatient ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                                            <p className="text-gray-500 mt-2">Đang tải thông tin bệnh nhân...</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Patient Basic Info */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h3 className="font-semibold text-gray-900 mb-3">Thông Tin Cơ Bản</h3>
                                                <div className="grid grid-cols-1 gap-3">
                                                    <div className="flex items-center">
                                                        <User className="h-4 w-4 text-gray-500 mr-2" />
                                                        <span className="text-sm text-gray-600 mr-2">Họ tên:</span>
                                                        <span className="text-sm font-medium">
                                                            {selectedPatient?.full_name || selectedPatient?.name || selectedQueue.patient_name || 'Chưa có thông tin'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Phone className="h-4 w-4 text-gray-500 mr-2" />
                                                        <span className="text-sm text-gray-600 mr-2">Số điện thoại:</span>
                                                        <span className="text-sm font-medium">
                                                            {selectedPatient?.phone_number || selectedPatient?.phone || selectedQueue.patient_phone_number || 'Chưa có thông tin'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Mail className="h-4 w-4 text-gray-500 mr-2" />
                                                        <span className="text-sm text-gray-600 mr-2">Email:</span>
                                                        <span className="text-sm font-medium">
                                                            {selectedPatient?.email || selectedQueue.patient_email || 'Chưa có thông tin'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                                                        <span className="text-sm text-gray-600 mr-2">Ngày sinh:</span>
                                                        <span className="text-sm font-medium">
                                                            {selectedPatient?.dob || 'Chưa có thông tin'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                                                        <span className="text-sm text-gray-600 mr-2">Địa chỉ:</span>
                                                        <span className="text-sm font-medium">
                                                            {selectedPatient?.address || 'Chưa có thông tin'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Medical History - Only show if patient details are loaded */}
                                            {selectedPatient && (
                                                <div className="bg-blue-50 rounded-lg p-4">
                                                    <h3 className="font-semibold text-gray-900 mb-3">Lịch Sử Y Tế</h3>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        <div className="flex items-start">
                                                            <Heart className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                                                            <div className="flex-1">
                                                                <span className="text-sm text-gray-600">Dị ứng thuốc:</span>
                                                                <div className="text-sm font-medium mt-1">
                                                                    {selectedPatient.medical_history?.drug_allergies?.length > 0
                                                                        ? selectedPatient.medical_history.drug_allergies.join(', ')
                                                                        : 'Không có'
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start">
                                                            <FileText className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                                                            <div className="flex-1">
                                                                <span className="text-sm text-gray-600">Tiền sử bệnh:</span>
                                                                <div className="text-sm font-medium mt-1">
                                                                    {selectedPatient.medical_history?.disease_treatment_history?.length > 0
                                                                        ? selectedPatient.medical_history.disease_treatment_history.join(', ')
                                                                        : 'Không có'
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start">
                                                            <FileText className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                                                            <div className="flex-1">
                                                                <span className="text-sm text-gray-600">Thông tin y tế khác:</span>
                                                                <div className="text-sm font-medium mt-1">
                                                                    {selectedPatient.medical_history?.other_history
                                                                        ? selectedPatient.medical_history.other_history
                                                                        : 'Không có'
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Queue Info */}
                                            <div className="bg-purple-50 rounded-lg p-4">
                                                <h3 className="font-semibold text-gray-900 mb-3">Thông Tin Khám</h3>
                                                <div className="grid grid-cols-1 gap-3">
                                                    <div className="flex items-center">
                                                        <FileText className="h-4 w-4 text-gray-500 mr-2" />
                                                        <span className="text-sm text-gray-600 mr-2">Dịch vụ:</span>
                                                        <span className="text-sm font-medium">
                                                            {/* Hiển thị service_name */}
                                                            {selectedService?.service_name || selectedQueue.service_name || `[Mã: ${selectedQueue.service_code}]` || 'Dịch vụ khám bệnh'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                                                        <span className="text-sm text-gray-600 mr-2">Thời gian đặt:</span>
                                                        <span className="text-sm font-medium">{formatDate(selectedQueue.created_at)}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Activity className="h-4 w-4 text-gray-500 mr-2" />
                                                        <span className="text-sm text-gray-600 mr-2">Số thứ tự:</span>
                                                        <span className="text-sm font-medium">#{selectedQueue.queue_id}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">Chọn một bệnh nhân từ hàng đợi</p>
                                    <p className="text-gray-400 text-sm">để xem chi tiết thông tin</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default DoctorDashboard