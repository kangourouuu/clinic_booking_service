import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Layout from '../../components/layout/Layout'
import { Users, Calendar, User, FileText, Clock, TrendingUp, CheckSquare, Pill, Phone, Mail, Wifi, WifiOff, RefreshCw, Stethoscope, Heart } from 'lucide-react'
import { doctorService } from '../../services/apiServices'
import { useAuth } from '../../context/AuthContext'
import useWebSocket from '../../hooks/useWebSocket'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import { Loading } from '../../components/ui/Loading'
import CreateDrugReceiptModal from '../../components/ui/CreateDrugReceiptModal'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'

const StatCard = ({ title, value, icon, color }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full" whileHover={{ y: -5 }}>
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

const DoctorDashboard = () => {
    const { user } = useAuth()
    const [stats, setStats] = useState({ totalQueues: 0, pendingQueues: 0, completedToday: 0, totalPatients: 0 })
    const [queues, setQueues] = useState([])
    const [selectedQueue, setSelectedQueue] = useState(null)
    const [loading, setLoading] = useState(true)
    const [loadingPatient, setLoadingPatient] = useState(false)
    const [isCreateReceiptModalOpen, setCreateReceiptModalOpen] = useState(false)

    const wsUrl = process.env.NODE_ENV === 'development' ? 'ws://localhost:9000/api/doctor/queues' : `wss://${window.location.host}/api/doctor/queues`

    const handleWebSocketMessage = (data) => {
        if (typeof data === 'object' && data.type) {
            switch (data.type) {
                case 'queue_list':
                case 'queue_updated':
                    const sortedQueues = (data.data || []).sort((a, b) => a.queue_id - b.queue_id)
                    setQueues(sortedQueues)
                    updateStats(sortedQueues)
                    if (data.type === 'queue_updated') toast.info('Danh sách hàng đợi đã được cập nhật')
                    setLoading(false)
                    break
                case 'queue_added':
                    setQueues(prev => [...prev, data.queue].sort((a, b) => a.queue_id - b.queue_id))
                    updateStats(prev => [...prev, data.queue])
                    toast.success(`Bệnh nhân mới: ${data.queue.patient_name || 'Không rõ'}`)
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
            pendingQueues: currentQueues.length, // Assuming all fetched are pending
        }))
    }

    const { isConnected, sendMessage, reconnect } = useWebSocket(wsUrl, {
        onMessage: handleWebSocketMessage,
        onOpen: () => {
            setLoading(true)
            setTimeout(() => sendMessage({ type: 'get_queues', doctor_id: user?.id }), 100)
            toast.success('Kết nối real-time thành công')
        },
        onClose: () => toast.error('Mất kết nối real-time'),
        onError: () => { setLoading(false); toast.error('Lỗi kết nối WebSocket') },
    })

    const refreshQueues = () => {
        if (isConnected && user?.id) {
            sendMessage({ type: 'get_queues', doctor_id: user.id })
        } else {
            reconnect()
        }
    }

    const completeQueue = (queueId) => {
        if (isConnected) {
            sendMessage({ type: 'complete_queue', queue_id: queueId, doctor_id: user?.id })
            if (selectedQueue?.queue_id === queueId) {
                setSelectedQueue(null)
            }
        } else {
            toast.error('Không có kết nối WebSocket')
        }
    }

    const handleSelectQueue = async (queue) => {
        setSelectedQueue(queue)
        if (queue.patient_id) {
            setLoadingPatient(true)
            try {
                const patientData = await doctorService.getPatientById(queue.patient_id)
                queue.patientDetails = patientData.data || patientData
            } catch (error) {
                toast.error('Không thể tải chi tiết bệnh nhân')
            } finally {
                setLoadingPatient(false)
            }
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        let date;
        // Handle dd/mm/yyyy format from backend
        if (/^\d{1,2}[-\/]\d{1,2}[-\/]\d{4}/.test(dateString)) {
            const parts = dateString.split(/[-\/]/);
            // new Date(year, month-1, day)
            date = new Date(parts[2], parts[1] - 1, parts[0]);
        } else {
            // Fallback for ISO strings
            date = new Date(dateString);
        }
    
        if (isNaN(date.getTime())) {
            return 'N/A';
        }
    
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    if (loading && !queues.length) {
        return <Layout><div className="flex items-center justify-center min-h-screen"><Loading size="lg"/></div></Layout>
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-8xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl p-8 mb-8 text-white relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
                        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/10 rounded-full"></div>
                        <h1 className="text-4xl font-bold z-10 relative">Bảng điều khiển</h1>
                        <p className="mt-2 text-primary-100 z-10 relative">Chào mừng trở lại, Bác sĩ {user?.full_name || '...'}!</p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Tổng Hàng Đợi" value={stats.totalQueues} icon={<Users className="h-6 w-6" />} color="blue" />
                        <StatCard title="Đang Chờ Khám" value={stats.pendingQueues} icon={<Clock className="h-6 w-6" />} color="yellow" />
                        <StatCard title="Đã Khám Hôm Nay" value={stats.completedToday} icon={<CheckSquare className="h-6 w-6" />} color="green" />
                        <StatCard title="Tổng Bệnh Nhân" value={stats.totalPatients} icon={<Heart className="h-6 w-6" />} color="purple" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Hàng Đợi Khám Bệnh</h2>
                                <Button size="sm" variant="ghost" onClick={refreshQueues} disabled={loading}><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
                            </div>
                            <div className="space-y-3 h-[60vh] overflow-y-auto">
                                {queues.length > 0 ? queues.map(queue => (
                                    <div key={queue.queue_id} onClick={() => handleSelectQueue(queue)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedQueue?.queue_id === queue.queue_id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-100'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><User className="h-6 w-6 text-blue-600" /></div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{queue.patient_name || 'Chưa có tên'}</h3>
                                                <p className="text-sm text-gray-500">{queue.service_name || 'Dịch vụ khám'}</p>
                                            </div>
                                            <div className="ml-auto text-right">
                                                <p className="text-sm font-bold text-blue-600">#{queue.queue_id}</p>
                                                <p className="text-xs text-gray-400">{formatDate(queue.created_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : <div className="text-center py-10"><Users className="h-12 w-12 text-gray-300 mx-auto" /><p className="mt-2 text-gray-500">Hàng đợi trống</p></div>}
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Chi Tiết Bệnh Nhân</h2>
                            {selectedQueue ? (
                                <div className="h-[60vh] overflow-y-auto pr-2">
                                    {loadingPatient ? <div className="flex items-center justify-center h-full"><Loading size="md" text="" /></div> : (
                                        <div className="space-y-6">
                                            <div className="p-6 rounded-xl bg-gray-50 border border-gray-200">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">{selectedQueue.patientDetails?.full_name || selectedQueue.patient_name}</h3>
                                                    <p className="text-gray-600">Ngày sinh: {formatDate(selectedQueue.patientDetails?.dob)}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                                                    <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400"/><span>{selectedQueue.patientDetails?.email || 'N/A'}</span></div>
                                                    <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400"/><span>{selectedQueue.patientDetails?.phone_number || 'N/A'}</span></div>
                                                </div>
                                            </div>

                                            <div className="p-6 rounded-xl bg-primary-50 border border-primary-200">
                                                <h4 className="font-semibold text-primary-800 mb-3">Thông Tin Khám</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between"><span>Dịch vụ:</span><strong className="text-right">{selectedQueue.service_name}</strong></div>
                                                    <div className="flex justify-between"><span>Ngày đặt lịch:</span><strong className="text-right">{formatDate(selectedQueue.created_at)}</strong></div>
                                                    <div className="flex justify-between"><span>Số thứ tự:</span><strong className="text-right">#{selectedQueue.queue_id}</strong></div>
                                                </div>
                                            </div>

                                            {selectedQueue.patientDetails?.medical_history && (
                                                <div className="p-6 rounded-xl bg-red-50 border border-red-200">
                                                    <h4 className="font-semibold text-red-800 mb-3">Tiền sử bệnh án</h4>
                                                    <div className="text-sm space-y-2">
                                                        <p><strong>Dị ứng:</strong> {selectedQueue.patientDetails.medical_history.drug_allergies?.join(', ') || 'Không có'}</p>
                                                        <p><strong>Bệnh nền:</strong> {selectedQueue.patientDetails.medical_history.disease_treatment_history?.join(', ') || 'Không có'}</p>
                                                        <p><strong>Ghi chú:</strong> {selectedQueue.patientDetails.medical_history.other_history || 'Không có'}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="pt-6 border-t">
                                                <Button onClick={() => setCreateReceiptModalOpen(true)} className="w-full bg-primary-600 hover:bg-primary-700 text-white"><Pill className="h-4 w-4 mr-2"/>Tạo đơn thuốc</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center bg-white rounded-2xl shadow-lg p-6">
                                    <User className="h-20 w-20 text-gray-300" />
                                    <p className="mt-4 text-lg font-medium text-gray-600">Chọn bệnh nhân từ hàng đợi</p>
                                    <p className="text-sm text-gray-400">Chi tiết thông tin sẽ được hiển thị tại đây.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                    {selectedQueue && (
                        <CreateDrugReceiptModal
                            isOpen={isCreateReceiptModalOpen}
                            onClose={() => setCreateReceiptModalOpen(false)}
                            queue={selectedQueue}
                            onReceiptCreated={() => {
                                toast.success('Đơn thuốc đã được tạo thành công!');
                                // Optionally, you can refresh patient data here
                            }}
                        />
                    )}
                </div>
            </div>
        </Layout>
    )
}

export default DoctorDashboard