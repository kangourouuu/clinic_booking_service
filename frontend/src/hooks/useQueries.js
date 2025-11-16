import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
    authService, 
    patientService, 
    doctorService, 
    nurseService,
    serviceService,
    adminService 
} from '../services/apiServices'
import toast from 'react-hot-toast'

// Query Keys
export const queryKeys = {
    // Auth
    currentUser: ['currentUser'],
    
    // Patients
    patients: ['patients'],
    patient: (id) => ['patient', id],
    patientProfile: ['patientProfile'],
    patientServices: ['patientServices'],
    patientMedicalHistory: ['patientMedicalHistory'],
    
    // Doctors
    doctors: ['doctors'],
    doctor: (id) => ['doctor', id],
    doctorProfile: ['doctorProfile'],
    doctorAppointments: ['doctorAppointments'],
    
    // Nurses
    nurses: ['nurses'],
    nurse: (id) => ['nurse', id],
    nurseProfile: ['nurseProfile'],
    nurseAssignedServices: ['nurseAssignedServices'],
    
    // Services
    serviceCategories: ['serviceCategories'],
    serviceCategory: (id) => ['serviceCategory', id],
    serviceSubcategories: (categoryId) => ['serviceSubcategories', categoryId],
    services: (subcategoryId) => ['services', subcategoryId],
    service: (id) => ['service', id],
    
    // Admin
    adminStats: ['adminStats'],
}

// ============ AUTH HOOKS ============

export const useLoginPatient = () => {
    return useMutation({
        mutationFn: authService.loginPatient,
        onSuccess: (data) => {
            toast.success('Login successful!')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Login failed')
        },
    })
}

export const useLoginDoctor = () => {
    return useMutation({
        mutationFn: authService.loginDoctor,
        onSuccess: (data) => {
            toast.success('Login successful!')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Login failed')
        },
    })
}

export const useLoginNurse = () => {
    return useMutation({
        mutationFn: authService.loginNurse,
        onSuccess: (data) => {
            toast.success('Login successful!')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Login failed')
        },
    })
}

export const useLoginAdmin = () => {
    return useMutation({
        mutationFn: authService.loginAdmin,
        onSuccess: (data) => {
            toast.success('Login successful!')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Login failed')
        },
    })
}

export const useRegisterPatient = () => {
    return useMutation({
        mutationFn: authService.registerPatient,
        onSuccess: (data) => {
            toast.success('Registration successful!')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Registration failed')
        },
    })
}

// ============ PATIENT HOOKS ============

export const usePatientProfile = () => {
    return useQuery({
        queryKey: queryKeys.patientProfile,
        queryFn: patientService.getProfile,
    })
}

export const useUpdatePatientProfile = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: patientService.updateProfile,
        onSuccess: (data) => {
            queryClient.invalidateQueries(queryKeys.patientProfile)
            toast.success('Profile updated successfully!')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update profile')
        },
    })
}

export const usePatientServices = () => {
    return useQuery({
        queryKey: queryKeys.patientServices,
        queryFn: patientService.getServices,
    })
}

export const usePatientMedicalHistory = () => {
    return useQuery({
        queryKey: queryKeys.patientMedicalHistory,
        queryFn: patientService.getMedicalHistory,
    })
}

// ============ DOCTOR HOOKS ============

export const useDoctorProfile = () => {
    return useQuery({
        queryKey: queryKeys.doctorProfile,
        queryFn: doctorService.getProfile,
    })
}

export const useUpdateDoctorProfile = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: doctorService.updateProfile,
        onSuccess: (data) => {
            queryClient.invalidateQueries(queryKeys.doctorProfile)
            toast.success('Profile updated successfully!')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update profile')
        },
    })
}

export const useDoctorAppointments = () => {
    return useQuery({
        queryKey: queryKeys.doctorAppointments,
        queryFn: doctorService.getAppointments,
    })
}

// ============ NURSE HOOKS ============

export const useNurseProfile = () => {
    return useQuery({
        queryKey: queryKeys.nurseProfile,
        queryFn: nurseService.getProfile,
    })
}

export const useUpdateNurseProfile = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: nurseService.updateProfile,
        onSuccess: (data) => {
            queryClient.invalidateQueries(queryKeys.nurseProfile)
            toast.success('Profile updated successfully!')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update profile')
        },
    })
}

export const useNurseAssignedServices = () => {
    return useQuery({
        queryKey: queryKeys.nurseAssignedServices,
        queryFn: nurseService.getAssignedServices,
    })
}

export const useMarkServiceCompleted = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: nurseService.markServiceCompleted,
        onSuccess: (data) => {
            queryClient.invalidateQueries(queryKeys.nurseAssignedServices)
            toast.success('Service marked as completed!')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to mark service as completed')
        },
    })
}

// ============ SERVICE HOOKS ============

export const useServiceCategories = () => {
    return useQuery({
        queryKey: queryKeys.serviceCategories,
        queryFn: serviceService.getCategories,
    })
}

export const useServiceSubcategories = (categoryId) => {
    return useQuery({
        queryKey: queryKeys.serviceSubcategories(categoryId),
        queryFn: () => serviceService.getSubcategories(categoryId),
        enabled: !!categoryId,
    })
}

export const useServices = (subcategoryId) => {
    return useQuery({
        queryKey: queryKeys.services(subcategoryId),
        queryFn: () => serviceService.getServices(subcategoryId),
        enabled: !!subcategoryId,
    })
}

export const useBookService = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: serviceService.bookService,
        onSuccess: (data) => {
            queryClient.invalidateQueries(queryKeys.patientServices)
            toast.success('Service booked successfully!')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to book service')
        },
    })
}

// ============ ADMIN HOOKS ============

export const useAdminStats = () => {
    return useQuery({
        queryKey: queryKeys.adminStats,
        queryFn: adminService.getStats,
    })
}

export const usePatients = () => {
    return useQuery({
        queryKey: queryKeys.patients,
        queryFn: adminService.getPatients,
    })
}

export const useDoctors = () => {
    return useQuery({
        queryKey: queryKeys.doctors,
        queryFn: adminService.getDoctors,
    })
}

export const useNurses = () => {
    return useQuery({
        queryKey: queryKeys.nurses,
        queryFn: adminService.getNurses,
    })
}

export const useCreateDoctor = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: adminService.createDoctor,
        onSuccess: (data) => {
            queryClient.invalidateQueries(queryKeys.doctors)
            toast.success('Doctor created successfully!')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create doctor')
        },
    })
}

export const useCreateNurse = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: adminService.createNurse,
        onSuccess: (data) => {
            queryClient.invalidateQueries(queryKeys.nurses)
            toast.success('Nurse created successfully!')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create nurse')
        },
    })
}

export const useUpdateDoctor = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: ({ id, data }) => adminService.updateDoctor(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries(queryKeys.doctors)
            toast.success('Doctor updated successfully!')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update doctor')
        },
    })
}

export const useUpdateNurse = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: ({ id, data }) => adminService.updateNurse(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries(queryKeys.nurses)
            toast.success('Nurse updated successfully!')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update nurse')
        },
    })
}

export const useDeleteDoctor = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: adminService.deleteDoctor,
        onSuccess: (data) => {
            queryClient.invalidateQueries(queryKeys.doctors)
            toast.success('Doctor deleted successfully!')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete doctor')
        },
    })
}

export const useDeleteNurse = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: adminService.deleteNurse,
        onSuccess: (data) => {
            queryClient.invalidateQueries(queryKeys.nurses)
            toast.success('Nurse deleted successfully!')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete nurse')
        },
    })
}
