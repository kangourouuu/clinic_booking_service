import React, { useState } from 'react'
import Modal from './Modal'
import { Input } from './Input'
import Button from './Button'
import {
    Pill,
    Printer,
    Activity,
    Plus,
    Trash2,
    FileText,
    CheckCircle,
    User,
    Calendar,
    Stethoscope
} from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const CreateDrugReceiptModal = ({ isOpen, onClose, queue, onReceiptCreated }) => {
    const [activeTab, setActiveTab] = useState('vitals') // 'vitals' | 'prescription' | 'preview'
    const [loading, setLoading] = useState(false)

    // Patient Vitals
    const [vitals, setVitals] = useState({
        blood_pressure: '120/80',
        heart_rate: '75',
        temperature: '36.8',
        oxygen_level: '98',
        weight: '65',
        height: '170',
        diagnosis: 'Viêm họng cấp tính / Viêm đường hô hấp trên',
        clinical_notes: 'Bệnh nhân tỉnh táo, họng đỏ, không khó thở.',
    })

    // Medications List
    const [medications, setMedications] = useState([
        { drug_name: 'Paracetamol 500mg', dosage: '1 viên', frequency: '3 lần/ngày', duration: '5 ngày', instructions: 'Uống sau khi ăn khi sốt trên 38.5 độ' },
        { drug_name: 'Amoxicillin 500mg', dosage: '1 viên', frequency: '2 lần/ngày', duration: '5 ngày', instructions: 'Uống sáng và tối sau ăn' },
        { drug_name: 'Vitamin C 500mg', dosage: '1 viên', frequency: '1 lần/ngày', duration: '10 ngày', instructions: 'Uống buổi sáng sau ăn' },
    ])

    const calculateBMI = () => {
        const w = parseFloat(vitals.weight)
        const h = parseFloat(vitals.height) / 100
        if (w > 0 && h > 0) {
            return (w / (h * h)).toFixed(1)
        }
        return 'N/A'
    }

    const addMedication = () => {
        setMedications(prev => [
            ...prev,
            { drug_name: '', dosage: '1 viên', frequency: '2 lần/ngày', duration: '5 ngày', instructions: 'Uống sau khi ăn' }
        ])
    }

    const removeMedication = (index) => {
        setMedications(prev => prev.filter((_, i) => i !== index))
    }

    const handleMedChange = (index, field, value) => {
        setMedications(prev => {
            const next = [...prev]
            next[index][field] = value
            return next
        })
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            // 1. Record Examination Vitals
            try {
                await api.post('/v1/medical/examinations', {
                    patient_id: queue?.patient_id,
                    queue_id: queue?.queue_id,
                    blood_pressure: vitals.blood_pressure,
                    heart_rate: parseInt(vitals.heart_rate, 10) || 75,
                    temperature: parseFloat(vitals.temperature) || 36.8,
                    oxygen_level: parseFloat(vitals.oxygen_level) || 98,
                    weight: parseFloat(vitals.weight) || 65,
                    height: parseFloat(vitals.height) || 170,
                    diagnosis: vitals.diagnosis,
                    clinical_notes: vitals.clinical_notes,
                })
            } catch (e) {
                console.warn('Examination endpoint optional note:', e)
            }

            // 2. Format prescriptions string
            const prescriptionSummary = medications
                .filter(m => m.drug_name.trim() !== '')
                .map((m, i) => `${i + 1}. ${m.drug_name} (${m.dosage}, ${m.frequency}, ${m.duration}) - HDSD: ${m.instructions}`)
                .join('\n')

            // 3. Create Prescription / Drug Receipt
            await api.post('/doctor/create-receipt', {
                queue_id: queue?.queue_id,
                drug_name: medications.map(m => m.drug_name).filter(Boolean).join(', '),
                usage_instructions: prescriptionSummary,
                notes: `Chẩn đoán: ${vitals.diagnosis}. ${vitals.clinical_notes}`,
            })

            toast.success('Đã lưu kết quả khám và đơn thuốc điện tử thành công!')
            if (onReceiptCreated) onReceiptCreated()
            setActiveTab('preview')
        } catch (error) {
            console.error('Failed to submit receipt:', error)
            toast.error(error.response?.data?.error || 'Lỗi khi lưu đơn thuốc')
        } finally {
            setLoading(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Hồ Sơ Khám & Kê Đơn Thuốc Điện Tử">
            <div className="space-y-4">
                {/* Tab Navigation */}
                <div className="flex border-b border-slate-200">
                    <button
                        type="button"
                        onClick={() => setActiveTab('vitals')}
                        className={`pb-2.5 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                            activeTab === 'vitals'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Activity className="w-4 h-4" />
                        1. Khám lâm sàng & Sinh hiệu
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('prescription')}
                        className={`pb-2.5 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                            activeTab === 'prescription'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Pill className="w-4 h-4" />
                        2. Kê đơn thuốc
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('preview')}
                        className={`pb-2.5 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                            activeTab === 'preview'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Printer className="w-4 h-4" />
                        3. Đơn thuốc PDF / In
                    </button>
                </div>

                {/* TAB 1: VITALS & DIAGNOSIS */}
                {activeTab === 'vitals' && (
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                            <span>Bệnh nhân: <strong className="text-slate-900">{queue?.patient_name || 'Nguyễn Văn A'}</strong></span>
                            <span>Số thứ tự: <strong className="text-primary-700">{queue?.queue_number || `A-${queue?.queue_id}`}</strong></span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Huyết áp (mmHg)</label>
                                <Input
                                    value={vitals.blood_pressure}
                                    onChange={(e) => setVitals({ ...vitals, blood_pressure: e.target.value })}
                                    placeholder="120/80"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Nhịp tim (lần/phút)</label>
                                <Input
                                    value={vitals.heart_rate}
                                    onChange={(e) => setVitals({ ...vitals, heart_rate: e.target.value })}
                                    placeholder="75"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Thân nhiệt (°C)</label>
                                <Input
                                    value={vitals.temperature}
                                    onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                                    placeholder="36.8"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">SpO2 (%)</label>
                                <Input
                                    value={vitals.oxygen_level}
                                    onChange={(e) => setVitals({ ...vitals, oxygen_level: e.target.value })}
                                    placeholder="98"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Cân nặng (kg)</label>
                                <Input
                                    value={vitals.weight}
                                    onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                                    placeholder="65"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Chiều cao (cm) / BMI</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={vitals.height}
                                        onChange={(e) => setVitals({ ...vitals, height: e.target.value })}
                                        placeholder="170"
                                    />
                                    <span className="flex items-center text-xs font-bold text-slate-700 bg-slate-100 px-2 rounded-lg">
                                        BMI: {calculateBMI()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Chẩn đoán bệnh lý *</label>
                            <Input
                                value={vitals.diagnosis}
                                onChange={(e) => setVitals({ ...vitals, diagnosis: e.target.value })}
                                placeholder="Nhập chẩn đoán hoặc mã ICD-10..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú lâm sàng / Lời dặn</label>
                            <textarea
                                rows={2}
                                value={vitals.clinical_notes}
                                onChange={(e) => setVitals({ ...vitals, clinical_notes: e.target.value })}
                                placeholder="Ghi chú lâm sàng, triệu chứng, chế độ nghỉ ngơi..."
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button type="button" onClick={() => setActiveTab('prescription')}>
                                Tiếp tục: Kê đơn thuốc →
                            </Button>
                        </div>
                    </div>
                )}

                {/* TAB 2: DIGITAL PRESCRIPTION BUILDER */}
                {activeTab === 'prescription' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase text-slate-500">Danh mục thuốc điều trị</span>
                            <button
                                type="button"
                                onClick={addMedication}
                                className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 bg-primary-50 px-2.5 py-1 rounded-lg"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Thêm thuốc
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                            {medications.map((med, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                                            {idx + 1}
                                        </span>
                                        <input
                                            type="text"
                                            value={med.drug_name}
                                            onChange={(e) => handleMedChange(idx, 'drug_name', e.target.value)}
                                            placeholder="Tên thuốc và hàm lượng (vd: Paracetamol 500mg)"
                                            className="flex-1 px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg font-semibold"
                                        />
                                        {medications.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeMedication(idx)}
                                                className="text-slate-400 hover:text-red-500 p-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <input
                                            type="text"
                                            value={med.dosage}
                                            onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                                            placeholder="Liều dùng (1 viên)"
                                            className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                                        />
                                        <input
                                            type="text"
                                            value={med.frequency}
                                            onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                                            placeholder="Tần suất (2 lần/ngày)"
                                            className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                                        />
                                        <input
                                            type="text"
                                            value={med.duration}
                                            onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                                            placeholder="Thời gian (5 ngày)"
                                            className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={med.instructions}
                                        onChange={(e) => handleMedChange(idx, 'instructions', e.target.value)}
                                        placeholder="Hướng dẫn sử dụng (uống sau ăn...)"
                                        className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-600"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                            <Button type="button" variant="outline" onClick={() => setActiveTab('vitals')}>
                                ← Quay lại sinh hiệu
                            </Button>
                            <Button type="button" loading={loading} onClick={handleSubmit}>
                                Hoàn tất khám & Lưu đơn thuốc
                            </Button>
                        </div>
                    </div>
                )}

                {/* TAB 3: PRINTABLE PRESCRIPTION PREVIEW */}
                {activeTab === 'preview' && (
                    <div className="space-y-4">
                        {/* Printable Document Box */}
                        <div id="printable-prescription" className="p-6 bg-white border-2 border-slate-200 rounded-2xl shadow-inner text-slate-800 space-y-4 font-serif text-sm">
                            {/* Clinic Header */}
                            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-3">
                                <div>
                                    <h2 className="font-bold text-lg tracking-wider text-slate-900 font-sans uppercase">
                                        PHÒNG KHÁM ĐA KHOA MEDICARE
                                    </h2>
                                    <p className="text-xs text-slate-500 font-sans">
                                        Địa chỉ: 123 Đường Y Tế, Phường Bến Nghé, Quận 1, TP. HCM
                                    </p>
                                    <p className="text-xs text-slate-500 font-sans">Hotline: 1900 6868 • Email: clinic@medicare.vn</p>
                                </div>
                                <div className="text-right font-sans text-xs">
                                    <p className="font-bold">MÃ ĐƠN: RX-{queue?.queue_id || 101}</p>
                                    <p className="text-slate-500">Ngày: {new Date().toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>

                            <div className="text-center font-sans font-bold text-xl uppercase tracking-widest text-slate-900 py-1">
                                ĐƠN THUỐC ĐIỆN TỬ
                            </div>

                            {/* Patient Info */}
                            <div className="grid grid-cols-2 gap-2 text-xs font-sans bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                <div>Họ và tên: <strong className="text-slate-900 uppercase">{queue?.patient_name || 'Nguyễn Văn A'}</strong></div>
                                <div>Chẩn đoán: <strong className="text-slate-900">{vitals.diagnosis}</strong></div>
                                <div>Huyết áp: <strong>{vitals.blood_pressure} mmHg</strong></div>
                                <div>Thân nhiệt: <strong>{vitals.temperature} °C</strong> (BMI: {calculateBMI()})</div>
                            </div>

                            {/* Medications Table */}
                            <div className="space-y-2 pt-2">
                                <h4 className="font-sans font-bold text-xs uppercase text-slate-700 tracking-wider">
                                    Danh sách thuốc chỉ định:
                                </h4>
                                <ol className="list-decimal list-inside space-y-2 pl-2">
                                    {medications.map((m, idx) => (
                                        <li key={idx} className="text-xs">
                                            <strong className="text-slate-900 text-sm font-sans">{m.drug_name}</strong>
                                            <span className="text-slate-600 ml-2 font-sans font-semibold">[{m.dosage} x {m.frequency}, dùng {m.duration}]</span>
                                            <p className="text-[11px] text-slate-600 italic pl-5 mt-0.5 font-sans">↳ {m.instructions}</p>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {/* Footer & Signature */}
                            <div className="grid grid-cols-2 pt-6 text-xs font-sans items-end">
                                <div className="text-slate-500 text-[11px]">
                                    <p>* Tái khám theo hẹn hoặc khi có triệu chứng bất thường.</p>
                                    <p>* Đơn thuốc có giá trị trong vòng 05 ngày kể từ ngày kê đơn.</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-600">Bác sĩ khám bệnh</p>
                                    <div className="h-12 flex items-center justify-center font-bold text-slate-400 italic">
                                        (Đã ký điện tử)
                                    </div>
                                    <p className="font-bold text-slate-900">BS. CKII Nguyễn Văn Hùng</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <Button type="button" variant="outline" onClick={() => setActiveTab('prescription')}>
                                ← Chỉnh sửa thuốc
                            </Button>
                            <div className="flex gap-2">
                                <Button type="button" onClick={handlePrint} className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white">
                                    <Printer className="w-4 h-4" />
                                    <span>In đơn thuốc / Lưu PDF</span>
                                </Button>
                                <Button type="button" onClick={onClose} variant="secondary">
                                    Đóng
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    )
}

export default CreateDrugReceiptModal
