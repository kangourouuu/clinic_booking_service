import React from 'react'
import { Link } from 'react-router-dom'
import {
    Heart,
    Phone,
    Mail,
    MapPin,
    Facebook,
    Twitter,
    Instagram,
    Youtube
} from 'lucide-react'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    const footerLinks = {
        services: [
            { name: 'Khám tổng quát', href: '/services/general' },
            { name: 'Khám chuyên khoa', href: '/services/specialist' },
            { name: 'Xét nghiệm', href: '/services/lab' },
            { name: 'Chẩn đoán hình ảnh', href: '/services/imaging' },
        ],
        company: [
            { name: 'Về chúng tôi', href: '/about' },
            { name: 'Đội ngũ bác sĩ', href: '/doctors' },
            { name: 'Tin tức', href: '/news' },
            { name: 'Tuyển dụng', href: '/careers' },
        ],
        support: [
            { name: 'Hỗ trợ khách hàng', href: '/support' },
            { name: 'Hướng dẫn đặt lịch', href: '/guide' },
            { name: 'Câu hỏi thường gặp', href: '/faq' },
            { name: 'Chính sách bảo mật', href: '/privacy' },
        ]
    }

    const socialLinks = [
        { icon: Facebook, href: '#', label: 'Facebook' },
        { icon: Twitter, href: '#', label: 'Twitter' },
        { icon: Instagram, href: '#', label: 'Instagram' },
        { icon: Youtube, href: '#', label: 'Youtube' },
    ]

    return (
        <footer className="bg-gray-900 text-white">
            {/* Main footer content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company info */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center space-x-3">
                            <div className="bg-primary-600 p-2 rounded-xl">
                                <Heart className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold font-medical">MediCare</h2>
                                <p className="text-sm text-gray-400">Professional Healthcare</p>
                            </div>
                        </Link>

                        <p className="text-gray-400 text-sm leading-relaxed">
                            Chúng tôi cam kết mang đến dịch vụ chăm sóc sức khỏe chất lượng cao
                            với đội ngũ bác sĩ giàu kinh nghiệm và trang thiết bị hiện đại.
                        </p>

                        {/* Contact info */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-3 text-sm text-gray-400">
                                <Phone className="h-4 w-4 text-primary-400" />
                                <span>1900 1234</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm text-gray-400">
                                <Mail className="h-4 w-4 text-primary-400" />
                                <span>info@medicare.vn</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm text-gray-400">
                                <MapPin className="h-4 w-4 text-primary-400" />
                                <span>123 Nguyễn Văn Cừ, Q1, TP.HCM</span>
                            </div>
                        </div>

                        {/* Social links */}
                        <div className="flex space-x-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    className="p-2 bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors duration-200"
                                    aria-label={social.label}
                                >
                                    <social.icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Dịch vụ</h3>
                        <ul className="space-y-2">
                            {footerLinks.services.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Công ty</h3>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
                        <ul className="space-y-2">
                            {footerLinks.support.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom footer */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            © {currentYear} MediCare. Tất cả quyền được bảo lưu.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <Link
                                to="/terms"
                                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                            >
                                Điều khoản sử dụng
                            </Link>
                            <Link
                                to="/privacy"
                                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                            >
                                Chính sách bảo mật
                            </Link>
                            <Link
                                to="/cookies"
                                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                            >
                                Chính sách Cookie
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
