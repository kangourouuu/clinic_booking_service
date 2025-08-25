import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Shield, Clock, Users, Award, Phone, Calendar, Stethoscope, Activity, ChevronRight, Star, CheckCircle, FlaskConical, Microscope, Quote } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Button from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'

const HomePage = () => {
    const features = [
        {
            icon: Shield,
            title: 'An toàn & Tin cậy',
            description: 'Đội ngũ bác sĩ giàu kinh nghiệm với hơn 10 năm hoạt động',
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            icon: Clock,
            title: 'Phục vụ 24/7',
            description: 'Sẵn sàng phục vụ bạn mọi lúc, mọi nơi với dịch vụ cấp cứu',
            color: 'text-teal-600',
            bgColor: 'bg-teal-50'
        },
        {
            icon: Users,
            title: 'Đội ngũ chuyên nghiệp',
            description: 'Hơn 50 bác sĩ chuyên khoa với trình độ cao và tâm huyết',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            icon: Award,
            title: 'Công nghệ hiện đại',
            description: 'Trang thiết bị y tế tiên tiến nhập khẩu từ châu Âu',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        }
    ]

    const services = [
        {
            title: 'Khám tổng quát',
            description: 'Kiểm tra sức khỏe định kỳ và tầm soát bệnh sớm',
            image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            link: '/services/general',
            icon: Stethoscope
        },
        {
            title: 'Khám chuyên khoa',
            description: 'Tim mạch, Tiêu hóa, Thần kinh, Da liễu...',
            image: 'https://images.unsplash.com/photo-1612531386530-97286d97c2d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            link: '/services/specialist',
            icon: Activity
        },
        {
            title: 'Xét nghiệm',
            description: 'Xét nghiệm máu, nước tiểu, vi sinh với kết quả nhanh',
            image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            link: '/services/lab',
            icon: FlaskConical
        },
        {
            title: 'Chẩn đoán hình ảnh',
            description: 'X-quang, CT, MRI, Siêu âm chất lượng cao',
            image: 'https://images.unsplash.com/photo-1579154286993-4093d15435e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            link: '/services/imaging',
            icon: Microscope
        }
    ]

    const stats = [
        { number: '10+', label: 'Năm kinh nghiệm' },
        { number: '50+', label: 'Bác sĩ chuyên khoa' },
        { number: '10k+', label: 'Bệnh nhân tin tưởng' },
        { number: '24/7', label: 'Phục vụ không ngừng' }
    ]

    const testimonials = [
        {
            name: 'Nguyễn Văn A',
            role: 'Khách hàng',
            content: 'Dịch vụ tuyệt vời, bác sĩ tận tâm và chu đáo. Tôi rất hài lòng với kết quả khám chữa bệnh.',
            rating: 5
        },
        {
            name: 'Trần Thị B',
            role: 'Khách hàng',
            content: 'Phòng khám hiện đại, sạch sẽ. Quy trình khám nhanh gọn, không phải chờ đợi lâu.',
            rating: 5
        }
    ]

    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative bg-white overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 -left-1/4 w-full h-full bg-gradient-to-br from-blue-50 via-white to-cyan-50 rounded-full filter blur-3xl opacity-40" />
                <div className="absolute -bottom-1/2 -right-1/4 w-3/4 h-3/4 bg-gradient-to-tr from-purple-50 via-white to-pink-50 rounded-full filter blur-3xl opacity-30" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Text content */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-10 text-center lg:text-left"
                        >
                            <div className="space-y-6">
                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight font-medical">
                                    Chăm sóc
                                    <span className="text-primary-600"> sức khỏe </span>
                                    toàn diện
                                </h1>
                                <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                    Với đội ngũ bác sĩ giàu kinh nghiệm và trang thiết bị y tế hiện đại,
                                    chúng tôi cam kết mang đến dịch vụ chăm sóc sức khỏe tốt nhất cho bạn và gia đình.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button size="xl" className="text-lg px-8 py-4 shadow-lg">
                                        <Calendar className="h-5 w-5 mr-3" />
                                        Đặt lịch khám
                                    </Button>
                                </motion.div>
                                <Button variant="ghost" size="xl" className="text-lg px-8 py-4">
                                    <Phone className="h-5 w-5 mr-3" />
                                    Hotline: 1900 1234
                                </Button>
                            </div>

                            {/* Quick stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
                                {stats.map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                                        className="text-center"
                                    >
                                        <div className="text-3xl lg:text-4xl font-bold text-primary-600">
                                            {stat.number}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Hero image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative z-10">
                                <img
                                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                    alt="Medical professionals"
                                    className="rounded-3xl shadow-2xl"
                                />

                                {/* Floating cards */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.6 }}
                                    className="absolute -top-8 -left-8 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-gray-100"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-green-100 p-2 rounded-lg">
                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">99.9%</div>
                                            <div className="text-sm text-gray-600">Hài lòng</div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.8 }}
                                    className="absolute -bottom-8 -right-8 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-gray-100"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-blue-100 p-2 rounded-lg">
                                            <Activity className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">24/7</div>
                                            <div className="text-sm text-gray-600">Hỗ trợ</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 font-medical">
                            Tại sao chọn MediCare?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Chúng tôi cam kết mang đến trải nghiệm chăm sóc sức khỏe tốt nhất
                            với những ưu điểm vượt trội
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="h-full"
                            >
                                <Card className="h-full border-gray-200/80 hover:border-primary-300/50 hover:shadow-xl transition-all duration-300 group">
                                    <CardContent className="p-8 text-center space-y-4">
                                        <div className={`inline-flex p-4 rounded-full ${feature.bgColor} group-hover:scale-110 group-hover:bg-primary-100 transition-all duration-300`}>
                                            <feature.icon className={`h-8 w-8 ${feature.color} group-hover:text-primary-600 transition-colors duration-300`} />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 font-medical">
                            Dịch vụ y tế
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Đa dạng dịch vụ y tế chất lượng cao, đáp ứng mọi nhu cầu chăm sóc sức khỏe của bạn
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((service, index) => {
                            const Icon = service.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <Card className="overflow-hidden h-full flex flex-col group border-gray-200/80 hover:shadow-xl transition-all duration-300">
                                        <div className="relative overflow-hidden">
                                            <img
                                                src={service.image}
                                                alt={service.title}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full">
                                                <Icon className="h-6 w-6 text-primary-600" />
                                            </div>
                                        </div>
                                        <CardContent className="p-6 flex flex-col flex-grow">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                {service.title}
                                            </h3>
                                            <p className="text-gray-600 mb-4 flex-grow">
                                                {service.description}
                                            </p>
                                            <Link
                                                to={service.link}
                                                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium group-hover:translate-x-1 transition-all duration-200"
                                            >
                                                Tìm hiểu thêm
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Link>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </div>

                    <div className="text-center mt-16">
                        <Button size="lg" className="text-lg px-8 py-4">
                            Xem tất cả dịch vụ
                            <ChevronRight className="h-5 w-5 ml-2" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 font-medical">
                            Khách hàng nói gì về chúng tôi
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Những phản hồi chân thực từ khách hàng đã tin tưởng sử dụng dịch vụ của chúng tôi
                        </p>
                    </div>

                    <div className="space-y-12">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                viewport={{ once: true }}
                            >
                                <Card className="border-gray-200/80 shadow-lg">
                                    <CardContent className="p-8 relative">
                                        <Quote className="absolute top-6 left-6 h-12 w-12 text-gray-100" />
                                        <div className="relative z-10">
                                            <div className="flex items-center space-x-1 mb-4">
                                                {[...Array(testimonial.rating)].map((_, i) => (
                                                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                                ))}
                                            </div>
                                            <blockquote className="text-gray-700 text-lg leading-relaxed mb-6">
                                                "{testimonial.content}"
                                            </blockquote>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                                    <span className="text-primary-600 font-semibold">
                                                        {testimonial.name.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24 bg-gradient-to-r from-primary-600 to-teal-600 overflow-hidden">
                <div className="absolute inset-0 bg-medical-pattern opacity-20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <h2 className="text-4xl font-bold text-white font-medical">
                                Sẵn sàng chăm sóc sức khỏe của bạn?
                            </h2>
                            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
                                Đặt lịch khám ngay hôm nay để được tư vấn và chăm sóc bởi đội ngũ y tế chuyên nghiệp
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="secondary" size="xl" className="text-lg px-8 py-4 bg-white/90 hover:bg-white text-primary-600 shadow-lg">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    Đặt lịch khám
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="outline" size="xl" className="text-lg px-8 py-4 border-white/50 text-white hover:bg-white hover:text-primary-600">
                                    <Phone className="h-5 w-5 mr-2" />
                                    Gọi ngay: 1900 1234
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </Layout>
    )
}

export default HomePage
