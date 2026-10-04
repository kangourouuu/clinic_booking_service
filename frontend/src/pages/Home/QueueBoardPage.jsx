import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Activity,
    Clock,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    UserCheck,
    Stethoscope,
    Users,
    CheckCircle2,
    Sparkles,
    Building2
} from 'lucide-react'
import useWebSocket from '../../hooks/useWebSocket'
import api from '../../services/api'

const QueueBoardPage = () => {
    const [currentTime, setCurrentTime] = useState(new Date())
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [nowServing, setNowServing] = useState(null)
    const [upNext, setUpNext] = useState([])
    const [completed, setCompleted] = useState([])
    const [stats, setStats] = useState({ totalToday: 0, waiting: 0, serving: 0 })

    // Live Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    // Play chime sound
    const playChime = () => {
        if (!soundEnabled) return
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)()
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'sine'
            osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15) // A5
            gain.gain.setValueAtTime(0.15, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start()
            osc.stop(ctx.currentTime + 0.6)
        } catch (e) {
            console.warn('Audio chime error:', e)
        }
    }

    // Toggle Fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
            }
        }
    }

    // Fetch initial board state via REST
    const fetchBoardData = async () => {
        try {
            const res = await api.get('/v1/queues/board')
            if (res.data) {
                const data = res.data
                setNowServing(data.now_serving || null)
                setUpNext(data.up_next || [])
                setCompleted(data.completed || [])
                setStats({
                    totalToday: data.total_in_queue || 0,
                    waiting: (data.up_next || []).length,
                    serving: data.now_serving ? 1 : 0
                })
            }
        } catch (err) {
            console.error('Failed to fetch queue board data:', err)
        }
    }

    useEffect(() => {
        fetchBoardData()
        const poller = setInterval(fetchBoardData, 15000)
        return () => clearInterval(poller)
    }, [])

    // Real-time WebSocket connection
    const wsUrl = process.env.NODE_ENV === 'development'
        ? 'ws://localhost:8080/ws/queues'
        : `wss://${window.location.host}/ws/queues`

    const { isConnected } = useWebSocket(wsUrl, {
        onMessage: (msg) => {
            console.log('Queue board live update received:', msg)
            playChime()
            fetchBoardData()
        }
    })

    const maskName = (name) => {
        if (!name) return 'Bệnh nhân'
        const parts = name.trim().split(' ')
        if (parts.length === 1) return parts[0]
        return `${parts[0]} ${parts.slice(1).map(p => p[0] + '***').join(' ')}`
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between p-4 md:p-8 select-none overflow-hidden">
            {/* Top Bar / Clinic Header */}
            <header className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-3 rounded-2xl shadow-lg shadow-cyan-500/20">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-sky-200 to-white bg-clip-text text-transparent">
                            MEDICARE CLINIC
                        </h1>
                        <p className="text-xs md:text-sm text-slate-400 font-medium flex items-center gap-2">
                            <span>BẢNG ĐIỀU HÀNH HÀNG ĐỢI KHÁM BỆNH</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span className="text-emerald-400 font-semibold">{isConnected ? 'LIVE' : 'SYNCING'}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    {/* Digital Clock */}
                    <div className="text-right">
                        <div className="text-2xl md:text-4xl font-mono font-bold tracking-widest text-cyan-400">
                            {currentTime.toLocaleTimeString('vi-VN', { hour12: false })}
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                            {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl p-1.5">
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`p-2.5 rounded-lg transition-colors ${soundEnabled ? 'text-cyan-400 bg-cyan-950/50' : 'text-slate-500'}`}
                            title="Bật/Tắt âm báo"
                        >
                            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            className="p-2.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                            title="Toàn màn hình (F11)"
                        >
                            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Board Grid */}
            <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
                {/* Left Column: NOW SERVING (Large Ticket Display) */}
                <div className="lg:col-span-7 flex flex-col justify-between">
                    <div className="bg-gradient-to-b from-slate-900/90 to-slate-900/40 border-2 border-cyan-500/40 rounded-3xl p-6 md:p-8 shadow-2xl shadow-cyan-500/10 flex-1 flex flex-col justify-between relative overflow-hidden">
                        {/* Background Glow */}
                        <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-sm tracking-wider uppercase border border-cyan-500/30">
                                <Activity className="w-4 h-4 animate-pulse text-cyan-400" />
                                ĐANG PHỤC VỤ • NOW SERVING
                            </span>
                            <span className="text-slate-400 text-sm font-medium">
                                Phòng khám: <strong className="text-white font-bold">{nowServing?.room_number || 'Phòng 101'}</strong>
                            </span>
                        </div>

                        {/* Ticket Number Section */}
                        <div className="my-auto py-8 text-center">
                            <AnimatePresence mode="wait">
                                {nowServing ? (
                                    <motion.div
                                        key={nowServing.queue_id || nowServing.queue_number}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        transition={{ type: 'spring', damping: 15 }}
                                    >
                                        <div className="text-8xl md:text-9xl font-black font-mono tracking-tighter text-transparent bg-gradient-to-r from-cyan-300 via-sky-100 to-white bg-clip-text drop-shadow-[0_10px_20px_rgba(6,182,212,0.4)]">
                                            {nowServing.queue_number || `A-${nowServing.queue_id}`}
                                        </div>
                                        <div className="mt-4 text-3xl md:text-4xl font-bold text-white tracking-wide">
                                            {maskName(nowServing.patient_name)}
                                        </div>
                                        <div className="mt-2 text-lg md:text-xl text-cyan-300/90 font-medium">
                                            {nowServing.service_name || 'Khám tổng quát'}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="py-12 text-slate-500 text-xl font-medium flex flex-col items-center gap-3">
                                        <Users className="w-16 h-16 opacity-30 animate-pulse" />
                                        <span>Đang chờ gọi số tiếp theo...</span>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Doctor Info Footer */}
                        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
                                    <Stethoscope className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-semibold">Bác sĩ phụ trách</p>
                                    <p className="text-base font-bold text-white">{nowServing?.doctor_name || 'BS. Nguyễn Văn A (CKI)'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 uppercase font-semibold">Trạng thái</p>
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Đang khám
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: UP NEXT & RECENT COMPLETED */}
                <div className="lg:col-span-5 flex flex-col space-y-6 justify-between">
                    {/* UP NEXT LIST */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 md:p-6 flex-1 flex flex-col">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                            <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-sky-400" />
                                <span>CHUẨN BỊ • UP NEXT</span>
                            </h2>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                {upNext.length} người đang đợi
                            </span>
                        </div>

                        <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[340px] pr-1">
                            {upNext.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-8">Không có bệnh nhân chờ</p>
                            ) : (
                                upNext.slice(0, 5).map((item, idx) => (
                                    <motion.div
                                        key={item.queue_id || idx}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-slate-950/60 border border-slate-800/80 hover:border-sky-500/40 rounded-xl p-3.5 flex items-center justify-between transition-colors"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 font-mono font-bold text-xs flex items-center justify-center">
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <div className="font-bold text-white text-base">
                                                    {maskName(item.patient_name)}
                                                </div>
                                                <div className="text-xs text-slate-400 truncate max-w-[180px]">
                                                    {item.service_name || 'Dịch vụ khám'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-mono font-black text-sky-400">
                                                {item.queue_number || `A-${item.queue_id}`}
                                            </span>
                                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>~{(idx + 1) * 15} phút</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RECENTLY COMPLETED */}
                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5 text-emerald-400">
                                <CheckCircle2 className="w-4 h-4" />
                                Vừa hoàn thành
                            </span>
                            <span>{completed.length} lượt</span>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto py-1">
                            {completed.length === 0 ? (
                                <span className="text-xs text-slate-600">Chưa có lượt hoàn thành hôm nay</span>
                            ) : (
                                completed.slice(0, 4).map((c, i) => (
                                    <span
                                        key={c.queue_id || i}
                                        className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 font-mono font-bold text-xs"
                                    >
                                        ✓ {c.queue_number || `A-${c.queue_id}`}
                                    </span>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Status Ticker */}
            <footer className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-6">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        Tổng lượt khám hôm nay: <strong className="text-white">{stats.totalToday}</strong>
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-400" />
                        Đang chờ: <strong className="text-white">{stats.waiting}</strong>
                    </span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Hệ thống gọi số tự động • MediCare Healthcare System</span>
                </div>
            </footer>
        </div>
    )
}

export default QueueBoardPage
