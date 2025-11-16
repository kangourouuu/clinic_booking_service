import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Components (keep these eager loaded as they're small)
import ProtectedRoute from '../components/auth/ProtectedRoute'
import Loading from '../components/ui/Loading'

// Lazy load pages for better code splitting
// Public Pages
const HomePage = lazy(() => import('../pages/Home/HomePage'))
const RegisterPage = lazy(() => import('../pages/Auth/RegisterPage'))
const PatientLoginPage = lazy(() => import('../pages/Auth/PatientLoginPage'))
const NurseLoginPage = lazy(() => import('../pages/Auth/NurseLoginPage'))
const DoctorLoginPage = lazy(() => import('../pages/Auth/DoctorLoginPage'))
const AdminLoginPage = lazy(() => import('../pages/Auth/AdminLoginPage'))

// Patient Pages
const PatientDashboard = lazy(() => import('../pages/Patient/PatientDashboard'))
const PatientProfile = lazy(() => import('../pages/Patient/PatientProfile'))
const ServiceCategories = lazy(() => import('../pages/Patient/ServiceCategories'))
const ServiceSubcategories = lazy(() => import('../pages/Patient/ServiceSubcategories'))
const ServiceList = lazy(() => import('../pages/Patient/ServiceList'))
const ServiceRegistration = lazy(() => import('../pages/Patient/ServiceRegistration'))
const BookingForm = lazy(() => import('../pages/Patient/BookingForm'))
const BookingHistory = lazy(() => import('../pages/Patient/BookingHistory'))
const MedicalHistory = lazy(() => import('../pages/Patient/MedicalHistory'))

// Payment Pages
const PaymentSuccess = lazy(() => import('../pages/Payment/PaymentSuccess'))
const PaymentCancel = lazy(() => import('../pages/Payment/PaymentCancel'))

// Nurse Pages
const NurseDashboard = lazy(() => import('../pages/Nurse/NurseDashboard'))
const NurseProfile = lazy(() => import('../pages/Nurse/NurseProfile'))
const NurseServiceManagement = lazy(() => import('../pages/Nurse/NurseServiceManagement'))
const PatientQueue = lazy(() => import('../pages/Nurse/PatientQueue'))

// Doctor Pages
const DoctorDashboard = lazy(() => import('../pages/Doctor/DoctorDashboard'))
const DoctorProfile = lazy(() => import('../pages/Doctor/DoctorProfile'))
const DoctorSchedule = lazy(() => import('../pages/Doctor/DoctorSchedule'))
const PatientManagement = lazy(() => import('../pages/Doctor/PatientManagement'))

// Admin Pages
const AdminDashboardPage = lazy(() => import('../pages/Admin/AdminDashboardPage'))

// Error Pages
const NotFound = lazy(() => import('../pages/Error/NotFound'))
const Unauthorized = lazy(() => import('../pages/Error/Unauthorized'))

// Loading fallback component
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <Loading />
    </div>
)

const AppRoutes = () => {
    const { user } = useAuth()

    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />

                {/* Auth Routes - Redirect to dashboard if already logged in */}
                <Route
                    path="/auth/login"
                    element={<Navigate to="/patient/login" replace />}
                />
                <Route
                    path="/patient/login"
                    element={
                        user ? (
                            <Navigate to="/patient/dashboard" replace />
                        ) : (
                            <PatientLoginPage />
                        )
                    }
                />
                <Route
                    path="/nurse/login"
                    element={
                        user ? (
                            <Navigate to="/nurse/dashboard" replace />
                        ) : (
                            <NurseLoginPage />
                        )
                    }
                />
                <Route
                    path="/doctor/login"
                    element={
                        user ? (
                            <Navigate to="/doctor/dashboard" replace />
                        ) : (
                            <DoctorLoginPage />
                        )
                    }
                />
                <Route
                    path="/admin/login"
                    element={
                        user ? (
                            <Navigate to="/admin/dashboard" replace />
                        ) : (
                            <AdminLoginPage />
                        )
                    }
                />
                <Route
                    path="/auth/register"
                    element={
                        user ? (
                            <Navigate to="/patient/dashboard" replace />
                        ) : (
                            <RegisterPage />
                        )
                    }
                />

                {/* Patient Routes */}
                <Route path="/patient/*" element={
                    <ProtectedRoute allowedRoles={['patient']}>
                        <Routes>
                            <Route path="dashboard" element={<PatientDashboard />} />
                            <Route path="profile" element={<PatientProfile />} />
                            <Route path="services" element={<ServiceCategories />} />
                            <Route path="services/category/:categoryId" element={<ServiceSubcategories />} />
                            <Route path="services/subcategory/:subcategoryId" element={<ServiceList />} />
                            <Route path="service-registration" element={<ServiceRegistration />} />
                            <Route path="booking/:serviceId" element={<BookingForm />} />
                            <Route path="bookings" element={<BookingHistory />} />
                            <Route path="medical-history" element={<MedicalHistory />} />
                            <Route path="" element={<Navigate to="dashboard" replace />} />
                        </Routes>
                    </ProtectedRoute>
                } />

                {/* Nurse Routes */}
                <Route path="/nurse/*" element={
                    <ProtectedRoute allowedRoles={['nurse']}>
                        <Routes>
                            <Route path="dashboard" element={<NurseDashboard />} />
                            <Route path="profile" element={<NurseProfile />} />
                            <Route path="services" element={<NurseServiceManagement />} />
                            <Route path="queue" element={<PatientQueue />} />
                            <Route path="" element={<Navigate to="dashboard" replace />} />
                        </Routes>
                    </ProtectedRoute>
                } />

                {/* Doctor Routes */}
                <Route path="/doctor/*" element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <Routes>
                            <Route path="dashboard" element={<DoctorDashboard />} />
                            <Route path="profile" element={<DoctorProfile />} />
                            <Route path="schedule" element={<DoctorSchedule />} />
                            <Route path="patients" element={<PatientManagement />} />
                            <Route path="" element={<Navigate to="dashboard" replace />} />
                        </Routes>
                    </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/*" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <Routes>
                            <Route path="dashboard" element={<AdminDashboardPage />} />
                            <Route path="" element={<Navigate to="dashboard" replace />} />
                        </Routes>
                    </ProtectedRoute>
                } />

                {/* Payment Routes - Public routes for Stripe redirects */}
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/cancel" element={<PaymentCancel />} />

                {/* Error Routes */}
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    )
}

export default AppRoutes