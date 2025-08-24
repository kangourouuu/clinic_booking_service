import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Layout from '../../components/layout/Layout'
import { Users, Clock, User, FileText, CheckSquare, Wifi, WifiOff, RefreshCw, Shield, ListChecks, ClipboardList } from 'lucide-react'
import { nurseService } from '../../services/apiServices'
import { useAuth } from '../../context/AuthContext'
import useWebSocket from '../../hooks/useWebSocket'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'

const StatCard = ({ title, value, icon, color }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 border-${color}-500`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
                {icon}
            </div>
        </div>
    </motion.div>
)

const QuickActionButton = ({ title, icon, color }) => (
    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-${color}-500 to-${color}-600 text-white shadow-lg hover:shadow-xl transition-all`}>
        {icon}
        <span className="mt-2 text-sm font-semibold">{title}</span>
    </motion.button>
)

const NurseDashboard = () => {
    const { user } = useAuth()
    const [stats, setStats] = useState({ totalQueues: 0, pendingQueues: 0, completedToday: 0 })
    const [queues, setQueues] = useState([])
    const [loading, setLoading] = useState(true)

    const wsUrl = process.env.NODE_ENV === 'development' ? 'ws://localhost:9000/api/nurse/queues' : `wss://${window.location.host}/api/nurse/queues`

    const handleWebSocketMessage = (data) => {
        if (typeof data === 'object' && data.type) {
            const sortQueues = (q) => q.sort((a, b) => a.queue_id - b.queue_id)
            switch (data.type) {
                case 'queue_list':
                case 'queue_updated':
                    const sorted = sortQueues(data.data || [])
                    setQueues(sorted)
                    updateStats(sorted)
                    if (data.type === 'queue_updated') toast.info('Hàng đợi đã được cập nhật')
                    setLoading(false)
                    break
                case 'queue_added':
                    setQueues(prev => sortQueues([...prev, data.queue]))
                    updateStats(prev => sortQueues([...prev, data.queue]))
                    toast.success(`Bệnh nhân mới: ${data.queue.patient_name || 'N/A'}`)
                    break
                case 'queue_removed':
                    setQueues(prev => prev.filter(q => q.queue_id !== data.queue_id))
                    updateStats(prev => prev.filter(q => q.queue_id !== data.queue_id))
                    toast.info('Bệnh nhân đã hoàn thành khám')
                    break
                case 'error':
                    toast.error(data.message || 'Lỗi WebSocket')
                    break
                default: break
            }
        }
    }

    const updateStats = (currentQueues) => {
        setStats(prev => ({
            ...prev,
            totalQueues: currentQueues.length,
            pendingQueues: currentQueues.filter(q => q.status !== 'completed').length,
        }))
    }

    const { isConnected, sendMessage, reconnect } = useWebSocket(wsUrl, {
        onMessage: handleWebSocketMessage,
        onOpen: () => {
            setLoading(true)
            setTimeout(() => sendMessage({ type: 'get_queues', nurse_id: user?.id }), 100)
            toast.success('Kết nối real-time thành công')
        },
        onClose: () => toast.error('Mất kết nối real-time'),
        onError: () => { setLoading(false); toast.error('Lỗi kết nối WebSocket') },
    })

    const refreshQueues = () => {
        if (isConnected && user?.id) {
            sendMessage({ type: 'get_queues', nurse_id: user.id })
        } else {
            reconnect()
        }
    }

    const handleCompleteQueue = async (queueId) => {
        try {
            await nurseService.markCompleteQueue(queueId)
            setQueues(prev => prev.filter(q => q.queue_id !== queueId))
            setStats(prev => ({ ...prev, completedToday: prev.completedToday + 1 }))
            toast.success('Đã hoàn thành hàng đợi!')
        } catch (error) {
            toast.error('Lỗi khi hoàn thành hàng đợi')
        }
    }

    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'

    if (loading && !queues.length) {
        return <Layout><div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div></Layout>
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">Bảng điều khiển</h1>
                            <p className="text-gray-600 mt-1">Chào mừng, Y tá {user?.full_name || '...'}!</p>
                        </div>
                        <div className="flex items-center gap-2 mt-4 sm:mt-0 bg-white p-2 rounded-full shadow-sm">
                            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                            <span className="text-sm font-medium text-gray-700">{isConnected ? 'Đã kết nối' : 'Mất kết nối'}</span>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <StatCard title="Tổng Hàng Đợi" value={stats.totalQueues} icon={<Users className="h-6 w-6" />} color="green" />
                        <StatCard title="Đang Chờ Xử Lý" value={stats.pendingQueues} icon={<Clock className="h-6 w-6" />} color="yellow" />
                        <StatCard title="Hoàn Thành Hôm Nay" value={stats.completedToday} icon={<CheckSquare className="h-6 w-6" />} color="blue" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Hàng Đợi Hiện Tại</h2>
                                <Button size="sm" variant="ghost" onClick={refreshQueues} disabled={loading}><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
                            </div>
                            <div className="space-y-3 h-[45vh] overflow-y-auto">
                                {loading && !queues.length ? <p>Đang tải...</p> : queues.length > 0 ? queues.map(queue => (
                                    <div key={queue.queue_id} className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><User className="h-5 w-5 text-green-600" /></div>
                                        <div className="ml-4 flex-grow">
                                            <p className="font-semibold text-gray-800">{queue.patient_name || 'N/A'}</p>
                                            <p className="text-sm text-gray-500">{queue.service_name || 'Dịch vụ khám'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-700">{formatDate(queue.created_at)}</p>
                                            <span className="text-xs text-yellow-600">Đang chờ</span>
                                        </div>
                                        <Button size="sm" className="ml-4 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleCompleteQueue(queue.queue_id)}>Hoàn thành</Button>
                                    </div>
                                )) : <div className="text-center py-10"><Users className="h-12 w-12 text-gray-300 mx-auto" /><p className="mt-2 text-gray-500">Hàng đợi trống</p></div>}
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Thao Tác Nhanh</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <QuickActionButton title="Quản lý hàng đợi" icon={<Users className="h-6 w-6" />} color="green" />
                                    <QuickActionButton title="Lịch trình" icon={<Clock className="h-6 w-6" />} color="blue" />
                                    <QuickActionButton title="Báo cáo" icon={<FileText className="h-6 w-6" />} color="purple" />
                                    <QuickActionButton title="Hồ sơ" icon={<User className="h-6 w-6" />} color="yellow" />
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Nhiệm Vụ Hôm Nay</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3"><div className="w-5 h-5 flex items-center justify-center rounded-full bg-green-100"><CheckSquare className="h-3 w-3 text-green-600"/></div><span className="text-sm text-gray-700">Kiểm tra hàng đợi bệnh nhân</span></li>
                                    <li className="flex items-center gap-3"><div className="w-5 h-5 flex items-center justify-center rounded-full bg-green-100"><ClipboardList className="h-3 w-3 text-green-600"/></div><span className="text-sm text-gray-700">Cập nhật trạng thái dịch vụ</span></li>
                                    <li className="flex items-center gap-3"><div className="w-5 h-5 flex items-center justify-center rounded-full bg-yellow-100"><ListChecks className="h-3 w-3 text-yellow-600"/></div><span className="text-sm text-gray-700">Hoàn thành báo cáo ca trực</span></li>
                                </ul>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default NurseDashboard