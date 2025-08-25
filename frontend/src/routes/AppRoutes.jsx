import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Components
import ProtectedRoute from '../components/auth/ProtectedRoute'

// Public Pages
import HomePage from '../pages/Home/HomePage'
import RegisterPage from '../pages/Auth/RegisterPage'
import PatientLoginPage from '../pages/Auth/PatientLoginPage'
import NurseLoginPage from '../pages/Auth/NurseLoginPage'
import DoctorLoginPage from '../pages/Auth/DoctorLoginPage'

// Patient Pages
import PatientDashboard from '../pages/Patient/PatientDashboard'
import PatientProfile from '../pages/Patient/PatientProfile'
import ServiceCategories from '../pages/Patient/ServiceCategories'
import ServiceSubcategories from '../pages/Patient/ServiceSubcategories'
import ServiceList from '../pages/Patient/ServiceList'
import ServiceRegistration from '../pages/Patient/ServiceRegistration'
import BookingForm from '../pages/Patient/BookingForm'
import BookingHistory from '../pages/Patient/BookingHistory'
import MedicalHistory from '../pages/Patient/MedicalHistory'

// Payment Pages
import PaymentSuccess from '../pages/Payment/PaymentSuccess'
import PaymentCancel from '../pages/Payment/PaymentCancel'

// Nurse Pages
import NurseDashboard from '../pages/Nurse/NurseDashboard'
import NurseProfile from '../pages/Nurse/NurseProfile'
import NurseServiceManagement from '../pages/Nurse/NurseServiceManagement'
import PatientQueue from '../pages/Nurse/PatientQueue'

// Doctor Pages
import DoctorDashboard from '../pages/Doctor/DoctorDashboard'
import DoctorProfile from '../pages/Doctor/DoctorProfile'
import DoctorSchedule from '../pages/Doctor/DoctorSchedule'
import PatientManagement from '../pages/Doctor/PatientManagement'

// Admin Pages
import AdminLoginPage from '../pages/Auth/AdminLoginPage'
import AdminDashboardPage from '../pages/Admin/AdminDashboardPage'

// Error Pages
import NotFound from '../pages/Error/NotFound'
import Unauthorized from '../pages/Error/Unauthorized'

const AppRoutes = () => {
    const { user } = useAuth()

    return (
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
    )
}

export default AppRoutes