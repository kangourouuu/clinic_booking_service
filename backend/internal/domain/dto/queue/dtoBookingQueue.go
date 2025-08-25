package dtoqueue

import (
	"backend/internal/domain/patient"
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

	PaymentStatus string `json:"payment_status"`
	BookingStatus string `json:"booking_status"`

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

	PaymentStatus string `json:"payment_status"`
	BookingStatus string `json:"booking_status"`

	AppointmentDate time.Time `json:"appointment"`
	CreatedAt       time.Time `json:"created_at"`

	DrugName          string `json:"drug_name"`
	UsageInstructions string `json:"usage_instructions"`
	Notes             string `json:"notes"`
}

func ConvertToResponse(bq *patient.BookingQueue) *BookingQueueResponse {
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
		PaymentStatus:      string(bq.PaymentStatus),
		BookingStatus:      string(bq.BookingStatus),
		AppointmentDate:    bq.AppointmentDate,
		CreatedAt:          bq.CreatedAt,
	}
	if bq.DrugReceipt != nil {
		resp.DrugName = bq.DrugReceipt.DrugName
		resp.UsageInstructions = bq.DrugReceipt.UsageInstructions
		resp.Notes = bq.DrugReceipt.Notes
	}
	return resp
}

func ConvertToListResponse(bq []*patient.BookingQueue) []*BookingQueueResponse {
	resp := make([]*BookingQueueResponse, len(bq))
	for i, bqValue := range bq {
		resp[i] = ConvertToResponse(bqValue)
	}
	return resp
}
