import api, { uploadFile } from './api'

// Auth Services
export const authService = {
    // Patient Authentication
    loginPatient: async (credentials) => {
        const response = await api.post('/login/patient', credentials)
        return response.data
    },

    registerPatient: async (userData) => {
        // Handle FormData for multipart upload
        const config = {}
        if (userData instanceof FormData) {
            config.headers = {
                'Content-Type': 'multipart/form-data'
            }
        }

        const response = await api.post('/register', userData, config)
        return response.data
    },

    // Nurse Authentication
    loginNurse: async (credentials) => {
        const response = await api.post('/login/nurse', credentials)
        return response.data
    },

    // Doctor Authentication
    loginDoctor: async (credentials) => {
        const response = await api.post('/login/doctor', credentials)
        return response.data
    },

    loginAdmin: async (credentials) => {
        const response = await api.post('/login/admin', credentials)
        return response.data
    },

    // Common logout (if needed)
    logout: async () => {
        const response = await api.post('/auth/logout')
        return response.data
    },
}

// Patient Services
export const patientService = {
    // Profile management
    getProfile: async () => {
        const response = await api.get('/patient/profile')
        return response.data
    },

    updateProfile: async (patientId, profileData) => {
        // Handle FormData for multipart upload
        const config = {}
        if (profileData instanceof FormData) {
            // Remove Content-Type header to let browser set multipart/form-data with boundary
            config.headers = {
                'Content-Type': undefined
            }
        }

        const response = await api.put(`/patient/${patientId}`, profileData, config)
        return response.data
    },

    updateProfileData: async (patientId, profileData) => {
        // Update profile without avatar (JSON) - use header to indicate no avatar
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'X-No-Avatar': 'true'
            }
        }
        const response = await api.put(`/patient/${patientId}`, profileData, config)
        return response.data
    },    // Service Categories
    getServiceCategories: async () => {
        const response = await api.get('/patient/service/categories')
        return response.data
    },

    getCategoryById: async (categoryId) => {
        const response = await api.get(`/patient/service/category?service_category_id=${categoryId}`)
        return response.data
    },

    // Service Subcategories
    getServiceSubcategories: async (categoryId) => {
        const response = await api.get(`/patient/service/subcategories?service_category_id=${categoryId}`)
        return response.data
    },

    getSubcategoryById: async (subcategoryId) => {
        const response = await api.get(`/patient/service/subcategory?service_subcategory_id=${subcategoryId}`)
        return response.data
    },

    // Services
    getServices: async (subcategoryId) => {
        const response = await api.get(`/patient/services?service_subcategory_id=${subcategoryId}`)
        return response.data
    },

    // Register for service
    registerService: async (serviceId, appointmentDate) => {
        const response = await api.post(`/patient/register-service/${serviceId}`, { appointment: appointmentDate })
        return response.data
    },

    // Service booking
    getBookingHistory: async (page = 1, limit = 10) => {
        const response = await api.get(`/patient/bookings?page=${page}&limit=${limit}`)
        return response.data
    },

    getHistoryBooking: async (page = 1, pageSize = 10) => {
        const response = await api.get(`/patient/history_booking?page=${page}&page_size=${pageSize}`);
        return response.data
    },

    getBookingDetail: async (queueId) => {
        const response = await api.get(`/patient/detail_booking?queueId=${queueId}`)
        return response.data
    },

    uploadAvatar: async (file, onProgress) => {
        const uploadResult = await uploadFile(file, onProgress)

        // Update profile with new avatar
        const response = await api.put('/patient/avatar', {
            avatar_url: uploadResult.url
        })

        return response.data
    },
}

// Nurse Services
export const nurseService = {
    // Profile management
    getProfile: async () => {
        const response = await api.get('/nurse/profile')
        return response.data
    },

    updateProfile: async (nurseId, profileData) => {
        const response = await api.put(`/nurse/${nurseId}`, profileData)
        return response.data
    },

    // Queue management
    getBookingQueues: async () => {
        const response = await api.get('/nurse/queues')
        return response.data
    },

    markCompleteQueue: async (queueId) => {
        const response = await api.delete(`/nurse/mark_complete?queueId=${queueId}`)
        return response.data
    },

    // Service management
    getRegisteredServices: async (page = 1, limit = 10, status = 'all') => {
        const response = await api.get(`/nurse/services?page=${page}&limit=${limit}&status=${status}`)
        return response.data
    },

    markServiceCompleted: async (serviceId) => {
        const response = await api.put(`/nurse/services/${serviceId}/complete`)
        return response.data
    },

    getServiceDetails: async (serviceId) => {
        const response = await api.get(`/nurse/services/${serviceId}`)
        return response.data
    },
}

export const adminService = {
// Patient Management
getPatients: async (page = 1, limit = 10) => {
    const response = await api.get(`/admin/patients?page=${page}&limit=${limit}`)
    return response.data
},

createPatient: async (patientData) => {
    const response = await api.post('/admin/create-patient', patientData)
    return response.data
},

updatePatient: async (patientId, patientData) => {
    const response = await api.put(`/admin/patient/${patientId}`, patientData)
    return response.data
},

deletePatient: async (patientId) => {
    const response = await api.delete(`/admin/patient/${patientId}`)
    return response.data
},

// Nurse Management
createNurse: async (nurseData) => {
    const response = await api.post('/admin/create-nurse', nurseData)
    return response.data
},

getAllNurses: async (page = 1, limit = 10) => {
    const response = await api.get(`/admin/nurses?page=${page}&limit=${limit}`)
    return response.data
},

getNurseById: async (nurseId) => {
    const response = await api.get(`/admin/nurse/${nurseId}`)
    return response.data
},

deleteNurse: async (nurseId) => {
    const response = await api.delete(`/admin/nurse/${nurseId}`)
    return response.data
},

// Doctor Management
createDoctor: async (doctorData) => {
    const response = await api.post('/admin/create-doctor', doctorData)
    return response.data
},

getAllDoctors: async (page = 1, limit = 10) => {
    const response = await api.get(`/admin/doctors?page=${page}&limit=${limit}`)
    return response.data
},

getDoctorById: async (doctorId) => {
    const response = await api.get(`/admin/doctor/${doctorId}`)
    return response.data
},

deleteDoctor: async (doctorId) => {
    const response = await api.delete(`/admin/doctor/${doctorId}`)
    return response.data
},

// Service Management
createService: async (serviceData) => {
    const response = await api.post('/admin/create-service', serviceData)
    return response.data
},

// Categories
getAllCategories: async () => {
    const response = await api.get('/patient/service/categories')
    return response.data
},

// Get service categories
getCategories: async () => {
    const response = await api.get('/services/categories')
    return response.data
},

// Subcategories
getAllSubcategories: async (categoryId) => {
    const response = await api.get(`/patient/service/subcategories?service_category_id=${categoryId}`)
    return response.data
},

// Get subcategories by category
getSubcategories: async (categoryId) => {
    const response = await api.get(`/services/categories/${categoryId}/subcategories`)
    return response.data
},

// Services by subcategory
getServicesBySubcategory: async (subcategoryId) => {
    const response = await api.get(`/patient/services?service_subcategory_id=${subcategoryId}`)
    return response.data
},

// Get services by subcategory
getServices: async (subcategoryId) => {
    const response = await api.get(`/services/subcategories/${subcategoryId}/services`)
    return response.data
},

// Get service details
getServiceDetails: async (serviceId) => {
    const response = await api.get(`/services/${serviceId}`)
    return response.data
},

// Book a service
bookService: async (bookingData) => {
    const response = await api.post('/services/book', bookingData)
    return response.data
},
}

// Doctor Services
export const doctorService = {
    getProfile: async () => {
        const response = await api.get('/doctor/profile')
        return response.data
    },
    updateProfile: async (doctorId, profileData) => {
        const response = await api.put(`/doctor/${doctorId}`, profileData)
        return response.data
    },
    getPatientById: async (patientId) => {
        const response = await api.get(`/doctor/patient/${patientId}`)
        return response.data
    },
    createDrugReceipt: async (receiptData) => {
        const response = await api.post('/doctor/create-receipt', receiptData)
        return response.data
    }
}

// Payment Services
export const paymentService = {
    // Create payment intent
    createPaymentIntent: async (bookingData) => {
        const response = await api.post('/payment/create-intent', bookingData)
        return response.data
    },

    // Confirm payment
    confirmPayment: async (paymentData) => {
        const response = await api.post('/payment/confirm', paymentData)
        return response.data
    },

    // Get payment history
    getPaymentHistory: async (page = 1, limit = 10) => {
        const response = await api.get(`/payment/history?page=${page}&limit=${limit}`)
        return response.data
    },
}