package dtoservice

import (
	"backend/internal/domain/examination/service"

	"github.com/google/uuid"
)

type CreateServiceRequest struct {
	ServiceName string  `json:"service_name"`
	ServiceCode string  `json:"service_code"`
	Cost        float64 `json:"cost"`
}

type UpdateServiceRequest struct {
	ServiceName string  `json:"service_name"`
	ServiceCode string  `json:"service_code"`
	Cost        float64 `json:"cost"`
}

type ServiceResponse struct {
	ServiceId   uuid.UUID `json:"service_id"`
	ServiceName string    `json:"service_name"`
	ServiceCode string    `json:"service_code"`
	Cost        float64   `json:"cost"`
}

type PatientRegisterService struct {
	PatientId          uuid.UUID `json:"patient_id"`
	PatientName        string    `json:"patient_name"`
	PatientEmail       string    `json:"patient_email"`
	PatientPhoneNumber string    `json:"patient_phone_number"`

	ServiceId   uuid.UUID `json:"service_id"`
	ServiceName string    `json:"service_name"`
	ServiceCode string    `json:"service_code"`
	Cost        float64   `json:"cost"`

	AppointmentDate string `json:"appointment"`
}

type AppointmentRequest struct {
	AppointmentDate string `json:"appointment"`
}

func ConvertServiceModelToServiceResponse(serviceModel *service.Services) *ServiceResponse {
	resp := &ServiceResponse{
		ServiceId:   serviceModel.ServiceId,
		ServiceName: serviceModel.ServiceName,
		ServiceCode: serviceModel.ServiceCode,
		Cost:        serviceModel.Cost,
	}
	return resp
}

func ConvertServiceModelToServiceList(serviceModel []*service.Services) []*ServiceResponse {
	services := make([]*ServiceResponse, len(serviceModel))

	for i, service := range serviceModel {
		services[i] = ConvertServiceModelToServiceResponse(service)
	}

	return services
}
