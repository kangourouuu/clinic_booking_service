package dtoqueue

import (
	"backend/internal/domain/queue"
	"time"

	"github.com/google/uuid"
)

type BookingQueuePublish struct {
	PatientId          uuid.UUID `json:"patient_id"`
	PatientName        string    `json:"patient_name,omitempty"`
	PatientEmail       string    `json:"patient_email,omitempty"`
	PatientPhoneNumber string    `json:"patient_phone_number,omitempty"`

	ServiceId   string  `json:"service_id"`
	ServiceName string  `json:"service_name,omitempty"`
	ServiceCode string  `json:"service_code,omitempty"`
	Cost        float64 `json:"cost,omitempty"`

	AppointmentDate time.Time `json:"appointment"`
	CreatedAt       time.Time `json:"created_at"`
}

type BookingQueueResponse struct {
	QueueId            int       `json:"queue_id"`
	PatientId          uuid.UUID `json:"patient_id"`
	PatientName        string    `json:"patient_name,omitempty"`
	PatientEmail       string    `json:"patient_email,omitempty"`
	PatientPhoneNumber string    `json:"patient_phone_number,omitempty"`

	ServiceName string  `json:"service_name,omitempty"`
	ServiceCode string  `json:"service_code,omitempty"`
	Cost        float64 `json:"cost,omitempty"`

	AppointmentDate time.Time `json:"appointment"`
	CreatedAt       time.Time `json:"created_at"`
}

func ConvertToResponse(bq *queue.BookingQueue) *BookingQueueResponse {
    if bq == nil {
        return nil
    }
	resp := &BookingQueueResponse{
		QueueId:            bq.QueueId,
		PatientId:          bq.PatientId,
		PatientName:        bq.PatientName,
		PatientEmail:       bq.PatientEmail,
		PatientPhoneNumber: bq.PatientPhoneNumber,
		ServiceName:        bq.ServiceName,
		ServiceCode:        bq.ServiceCode,
		Cost:               bq.ServiceCost,
		AppointmentDate:    bq.AppointmentDate,
		CreatedAt:          bq.CreatedAt,
	}
	return resp
}

func ConvertToListResponse(bq []*queue.BookingQueue) []*BookingQueueResponse {
	resp := make([]*BookingQueueResponse, len(bq))
	for i, bqValue := range bq {
		resp[i] = ConvertToResponse(bqValue)
	}
	return resp
}
