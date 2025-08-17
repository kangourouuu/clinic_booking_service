import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Layout from '../../components/layout/Layout'
import {
    Users,
    Clock,
    User,
    FileText,
    Activity,
    Shield,
    TrendingUp,
    CheckSquare,
    AlertCircle,
    Wifi,
    WifiOff,
    RefreshCw
} from 'lucide-react'
import { nurseService } from '../../services/apiServices'
import { useAuth } from '../../context/AuthContext'
import useWebSocket from '../../hooks/useWebSocket'
import toast from 'react-hot-toast'

const NurseDashboard = () => {
    const { user } = useAuth()
    const [stats, setStats] = useState({
        totalQueues: 0,
        pendingQueues: 0,
        completedToday: 0,
        totalPatients: 0
    })
    const [queues, setQueues] = useState([])
    const [loading, setLoading] = useState(true)

        // WebSocket configuration
    const wsUrl = process.env.NODE_ENV === 'development'
        ? 'ws://localhost:9000/api/nurse/queues'
        : `wss://${window.location.host}/api/nurse/queues`


    // Handle WebSocket messages
    const handleWebSocketMessage = (data) => {
        console.log('Nurse Dashboard - WebSocket message:', data)

        // Handle simple trigger messages from Redis
        if (typeof data === 'string') {
            console.log('Nurse Dashboard - Received trigger:', data)
            return
        }

        // Handle structured JSON messages
        if (typeof data === 'object' && data.type) {
            switch (data.type) {
                case 'queue_list':
                case 'queue_updated':
                    console.log('Nurse Dashboard - Updating queue list:', data.data)

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

                        console.log('Nurse Dashboard - Queue data updated:', sortedQueues.length, 'queues')
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
                    console.log('Nurse Dashboard - New queue added:', data.queue)
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
                    console.log('Nurse Dashboard - Queue removed:', data.queue_id)
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
                    console.error('Nurse Dashboard - WebSocket error:', data.message)
                    toast.error(data.message || 'Lỗi kết nối WebSocket')
                    break

                default:
                    console.log('Nurse Dashboard - Unknown message type:', data.type)
            }
        }
    }

    const handleWebSocketOpen = () => {
        console.log('Nurse Dashboard - WebSocket connected')
        setLoading(true)

        // Request initial queue data with small delay to ensure connection is ready
        setTimeout(() => {
            sendMessage({
                type: 'get_queues',
                nurse_id: user?.id // Assuming nurse_id is needed for nurse queues
            })
        }, 100)

        toast.success('Kết nối real-time đã được thiết lập')
    }

    const handleWebSocketClose = () => {
        console.log('Nurse Dashboard - WebSocket disconnected')
        toast.error('Mất kết nối real-time')
    }

    const handleWebSocketError = (error) => {
        console.error('Nurse Dashboard - WebSocket error:', error)
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
                nurse_id: user.id
            })
        } else {
            reconnect()
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
            title: 'Đang Chờ Xử Lý',
            value: stats.pendingQueues,
            icon: Clock,
            color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
            change: '+12%'
        },
        {
            title: 'Hoàn Thành Hôm Nay',
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

    const handleCompleteQueue = async (queueId) => {
        try {
            // Ensure queueId is a number if needed
            const id = queueId || queueId === 0 ? queueId : null
            if (id === null) {
                toast.error('ID queue không hợp lệ')
                return
            }

            console.log('Completing queue with ID:', id, 'Type:', typeof id)
            await nurseService.markCompleteQueue(id)

            // Remove completed queue from the list immediately  
            const updatedQueues = queues.filter(q => (q.queue_id || q.id) !== queueId)
            setQueues(updatedQueues)

            // Update stats
            setStats(prev => ({
                ...prev,
                totalQueues: updatedQueues.length,
                pendingQueues: updatedQueues.length,
                completedToday: prev.completedToday + 1
            }))

            toast.success('Đã hoàn thành queue thành công!')
        } catch (error) {
            console.error('Error completing queue:', error)
            toast.error('Lỗi khi hoàn thành queue. Vui lòng thử lại.')
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'in-progress':
                return 'bg-blue-100 text-blue-800'
            case 'completed':
                return 'bg-green-100 text-green-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'Đang chờ'
            case 'in-progress':
                return 'Đang xử lý'
            case 'completed':
                return 'Hoàn thành'
            default:
                return 'Không xác định'
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent':
                return 'text-red-600'
            case 'high':
                return 'text-orange-600'
            case 'normal':
                return 'text-green-600'
            default:
                return 'text-gray-600'
        }
    }

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Chào mừng, Y tá {user?.full_name || 'Nurse'}
                                </h1>
                                <p className="text-gray-600">
                                    Hôm nay là {new Date().toLocaleDateString('vi-VN', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                                <Shield className="h-5 w-5 text-green-500" />
                                <span className="text-sm font-medium text-gray-700">
                                    {user?.position || 'Y tá'}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statCards.map((stat, index) => (
                            <motion.div
                                key={stat.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">
                                            {stat.title}
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {stat.value}
                                        </p>
                                        <p className="text-sm text-green-600 mt-1">
                                            {stat.change} từ tháng trước
                                        </p>
                                    </div>
                                    <div className={`${stat.color} p-3 rounded-lg`}>
                                        <stat.icon className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Queue Management */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-xl shadow-lg p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Hàng Đợi Hiện Tại
                                </h2>
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
                                        className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                        <span>Làm mới</span>
                                    </button>

                                    <div className="text-sm text-gray-500">
                                        {queues.length} bệnh nhân • Theo thứ tự
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                        <span className="ml-2 text-gray-600">Đang tải...</span>
                                    </div>
                                ) : queues.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 text-lg font-medium">Chưa có dữ liệu</p>
                                        <p className="text-gray-400 text-sm">Hiện tại không có hàng đợi nào</p>
                                    </div>
                                ) : (
                                    queues.slice(0, 5).map((queue) => (
                                        <div
                                            key={queue.queue_id || queue.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                                    <User className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <p className="font-medium text-gray-900">
                                                            {queue.patient_name || queue.patientName || queue.patient?.name || 'Chưa có tên'}
                                                        </p>
                                                        <AlertCircle className="h-4 w-4 text-orange-500" />
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        {queue.service_name || queue.serviceType || queue.service?.service_name || 'Dịch vụ khám bệnh'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-gray-900">
                                                    {queue.appointment_time || queue.time || new Date(queue.created_at || new Date()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <div className="flex items-center space-x-2">
                                                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                                        Đang chờ
                                                    </span>
                                                    <button
                                                        onClick={() => handleCompleteQueue(queue.queue_id || queue.id)}
                                                        className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors duration-200"
                                                    >
                                                        Hoàn thành
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium">
                                Xem Tất Cả Hàng Đợi
                            </button>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white rounded-xl shadow-lg p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Thao Tác Nhanh
                                </h2>
                                <TrendingUp className="h-5 w-5 text-gray-400" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105">
                                    <Users className="h-6 w-6 mx-auto mb-2" />
                                    <span className="text-sm font-medium">Quản Lý Hàng Đợi</span>
                                </button>

                                <button className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
                                    <Clock className="h-6 w-6 mx-auto mb-2" />
                                    <span className="text-sm font-medium">Lịch Trình</span>
                                </button>

                                <button className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
                                    <FileText className="h-6 w-6 mx-auto mb-2" />
                                    <span className="text-sm font-medium">Báo Cáo</span>
                                </button>

                                <button className="p-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 transform hover:scale-105">
                                    <User className="h-6 w-6 mx-auto mb-2" />
                                    <span className="text-sm font-medium">Hồ Sơ</span>
                                </button>
                            </div>

                            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                <h3 className="font-medium text-green-900 mb-2">
                                    Nhiệm Vụ Hôm Nay
                                </h3>
                                <ul className="text-sm text-green-700 space-y-1">
                                    <li>• Kiểm tra hàng đợi bệnh nhân</li>
                                    <li>• Cập nhật trạng thái dịch vụ</li>
                                    <li>• Hoàn thành báo cáo ca trực</li>
                                </ul>
                            </div>

                            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <div className="flex items-center space-x-2">
                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                    <span className="text-sm font-medium text-yellow-800">
                                        Cảnh báo: {stats.pendingQueues} hàng đợi đang chờ xử lý
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default NurseDashboard
