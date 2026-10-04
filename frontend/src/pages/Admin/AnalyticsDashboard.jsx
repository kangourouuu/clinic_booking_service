import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    DollarSign,
    Users,
    Calendar,
    Clock,
    CheckCircle2,
    ArrowUpRight,
    ArrowDownRight,
    Award,
    Activity,
    Stethoscope
} from 'lucide-react'

const AnalyticsDashboard = () => {
    const [timeRange, setTimeRange] = useState('week') // 'today' | 'week' | 'month'

    // Mock live KPI stats
    const kpis = [
        {
            title: 'Tổng doanh thu',
            value: '48.500.000 đ',
            change: '+14.2%',
            isPositive: true,
            icon: DollarSign,
            color: 'emerald'
        },
        {
            title: 'Lượt đặt khám',
            value: '142 lượt',
            change: '+8.5%',
            isPositive: true,
            icon: Calendar,
            color: 'blue'
        },
        {
            title: 'Đã hoàn thành',
            value: '118 ca',
            change: '+12.1%',
            isPositive: true,
            icon: CheckCircle2,
            color: 'sky'
        },
        {
            title: 'Thời gian chờ TB',
            value: '14 phút',
            change: '-3.2 phút',
            isPositive: true,
            icon: Clock,
            color: 'purple'
        },
    ]

    const serviceBreakdown = [
        { name: 'Khám Nội Tổng Quát', revenue: '18.250.000 đ', share: 38, count: 73 },
        { name: 'Khám Nhi & Tiêm Chủng', revenue: '12.400.000 đ', share: 26, count: 42 },
        { name: 'Khám Chuyên Khoa Tim Mạch', revenue: '9.800.000 đ', share: 20, count: 28 },
        { name: 'Chẩn Đoán Hình Ảnh & Siêu Âm', revenue: '5.200.000 đ', share: 11, count: 21 },
        { name: 'Xét Nghiệm Máu Định Kỳ', revenue: '2.850.000 đ', share: 5, count: 19 },
    ]

    const doctorWorkload = [
        { name: 'BS. CKII Nguyễn Văn Hùng', specialty: 'Nội Tổng Quát', patients: 38, rating: '4.9 ★', status: 'Đang trực' },
        { name: 'ThS. BS Trần Thị Mai', specialty: 'Khoa Nhi', patients: 31, rating: '5.0 ★', status: 'Đang trực' },
        { name: 'BS. CKI Lê Hoàng Nam', specialty: 'Tim Mạch', patients: 26, rating: '4.8 ★', status: 'Đang trực' },
        { name: 'BS. Phạm Thu Trang', specialty: 'Xét Nghiệm', patients: 23, rating: '4.9 ★', status: 'Nghỉ ca' },
    ]

    const weeklyTrend = [
        { day: 'Thứ 2', count: 45, height: '70%' },
        { day: 'Thứ 3', count: 52, height: '82%' },
        { day: 'Thứ 4', count: 48, height: '75%' },
        { day: 'Thứ 5', count: 64, height: '100%' },
        { day: 'Thứ 6', count: 58, height: '90%' },
        { day: 'Thứ 7', count: 38, height: '60%' },
        { day: 'Chủ Nhật', count: 22, height: '35%' },
    ]

    return (
        <div className="space-y-6">
            {/* Top Bar with Time Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        Tổng Quan Doanh Thu & Hiệu Suất Vận Hành
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                        Số liệu thống kê thời gian thực từ Stripe Gateway và hệ thống hàng đợi.
                    </p>
                </div>
                <div className="inline-flex rounded-xl bg-slate-200/80 p-1 text-xs font-bold text-slate-600">
                    <button
                        onClick={() => setTimeRange('today')}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${timeRange === 'today' ? 'bg-white text-slate-900 shadow-sm' : ''}`}
                    >
                        Hôm nay
                    </button>
                    <button
                        onClick={() => setTimeRange('week')}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${timeRange === 'week' ? 'bg-white text-slate-900 shadow-sm' : ''}`}
                    >
                        Tuần này
                    </button>
                    <button
                        onClick={() => setTimeRange('month')}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${timeRange === 'month' ? 'bg-white text-slate-900 shadow-sm' : ''}`}
                    >
                        Tháng này
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, idx) => {
                    const Icon = kpi.icon
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase text-slate-400">{kpi.title}</span>
                                <div className={`p-2.5 rounded-xl bg-${kpi.color}-50 text-${kpi.color}-600`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="text-2xl font-black text-slate-900 tracking-tight">{kpi.value}</div>
                                <div className="mt-1 flex items-center text-xs font-bold text-emerald-600">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                                    <span>{kpi.change} so với kỳ trước</span>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Grid: Charts & Distributions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Weekly Trend Bar Chart */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Lượng Bệnh Nhân Đặt Khám Theo Ngày</h3>
                            <p className="text-xs text-slate-400">Xu hướng khám trong 7 ngày gần nhất</p>
                        </div>
                        <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg">
                            TB: 49 ca/ngày
                        </span>
                    </div>

                    {/* Bar visualization */}
                    <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
                        {weeklyTrend.map((item, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className="text-[11px] font-mono font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {item.count}
                                </div>
                                <div className="w-full bg-slate-100 rounded-xl h-44 flex items-end overflow-hidden p-1">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: item.height }}
                                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                                        className="w-full bg-gradient-to-t from-primary-600 to-sky-400 rounded-lg group-hover:brightness-110 transition-all"
                                    />
                                </div>
                                <span className="text-xs font-medium text-slate-600 truncate">{item.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue Share by Service */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="pb-3 border-b border-slate-100 mb-3">
                        <h3 className="font-bold text-slate-900 text-base">Cơ Cấu Doanh Thu Dịch Vụ</h3>
                        <p className="text-xs text-slate-400">Phân bổ doanh thu theo danh mục lâm sàng</p>
                    </div>

                    <div className="space-y-3.5 flex-1 justify-center flex flex-col">
                        {serviceBreakdown.map((srv, idx) => (
                            <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="font-bold text-slate-800">{srv.name}</span>
                                    <span className="font-mono text-slate-900 font-bold">{srv.revenue} ({srv.share}%)</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                                        style={{ width: `${srv.share}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Doctor Workload & Consultations Table */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <div>
                        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                            <Stethoscope className="w-5 h-5 text-primary-600" />
                            <span>Hiệu Suất & Công Suất Khám Của Bác Sĩ</span>
                        </h3>
                        <p className="text-xs text-slate-400">Theo dõi số lượt khám và đánh giá của bệnh nhân</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                            <tr>
                                <th className="px-4 py-3 rounded-l-xl">Bác sĩ</th>
                                <th className="px-4 py-3">Chuyên khoa</th>
                                <th className="px-4 py-3 text-center">Bệnh nhân hôm nay</th>
                                <th className="px-4 py-3 text-center">Đánh giá</th>
                                <th className="px-4 py-3 rounded-r-xl text-right">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {doctorWorkload.map((doc, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs">
                                            {doc.name.split(' ').slice(-1)[0][0]}
                                        </div>
                                        <span>{doc.name}</span>
                                    </td>
                                    <td className="px-4 py-3.5">{doc.specialty}</td>
                                    <td className="px-4 py-3.5 text-center font-mono font-bold text-primary-700">
                                        {doc.patients} lượt
                                    </td>
                                    <td className="px-4 py-3.5 text-center font-bold text-amber-500">
                                        {doc.rating}
                                    </td>
                                    <td className="px-4 py-3.5 text-right">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                                            doc.status === 'Đang trực'
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {doc.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default AnalyticsDashboard
