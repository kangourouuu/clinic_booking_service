package dtoqueue

import (
	"backend/internal/domain/patient"
	"time"

	"github.com/google/uuid"
)

type BookingQueuePublish struct {
	PatientId          uuid.UUID  `json:"patient_id"`
	PatientName        string     `json:"patient_name,omitempty"`
	PatientEmail       string     `json:"patient_email,omitempty"`
	PatientPhoneNumber string     `json:"patient_phone_number,omitempty"`

	ServiceId   string  `json:"service_id"`
	ServiceName string  `json:"service_name,omitempty"`
	ServiceCode string  `json:"service_code,omitempty"`
	Cost        float64 `json:"cost,omitempty"`

	DoctorId        *uuid.UUID `json:"doctor_id,omitempty"`
	DoctorName      string     `json:"doctor_name,omitempty"`
	TimeSlot        string     `json:"time_slot,omitempty"`
	RoomNumber      string     `json:"room_number,omitempty"`
	QueueNumber     string     `json:"queue_number,omitempty"`
	PaymentIntentId string     `json:"payment_intent_id,omitempty"`
	Notes           string     `json:"notes,omitempty"`

	PaymentStatus string `json:"payment_status"`
	BookingStatus string `json:"booking_status"`

	AppointmentDate time.Time `json:"appointment"`
	CreatedAt       time.Time `json:"created_at"`
}

type BookingQueueResponse struct {
	QueueId            int        `json:"queue_id"`
	PatientId          uuid.UUID  `json:"patient_id"`
	PatientName        string     `json:"patient_name,omitempty"`
	PatientEmail       string     `json:"patient_email,omitempty"`
	PatientPhoneNumber string     `json:"patient_phone_number,omitempty"`

	ServiceName string  `json:"service_name,omitempty"`
	ServiceCode string  `json:"service_code,omitempty"`
	Cost        float64 `json:"cost,omitempty"`

	DoctorId        *uuid.UUID `json:"doctor_id,omitempty"`
	DoctorName      string     `json:"doctor_name,omitempty"`
	TimeSlot        string     `json:"time_slot,omitempty"`
	RoomNumber      string     `json:"room_number,omitempty"`
	QueueNumber     string     `json:"queue_number,omitempty"`
	PaymentIntentId string     `json:"payment_intent_id,omitempty"`

	PaymentStatus string `json:"payment_status"`
	BookingStatus string `json:"booking_status"`

	AppointmentDate time.Time `json:"appointment"`
	CreatedAt       time.Time `json:"created_at"`

	DrugName          string `json:"drug_name,omitempty"`
	UsageInstructions string `json:"usage_instructions,omitempty"`
	Notes             string `json:"notes,omitempty"`
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
		DoctorId:           bq.DoctorId,
		DoctorName:         bq.DoctorName,
		TimeSlot:           bq.TimeSlot,
		RoomNumber:         bq.RoomNumber,
		QueueNumber:        bq.QueueNumber,
		PaymentIntentId:    bq.PaymentIntentId,
		PaymentStatus:      string(bq.PaymentStatus),
		BookingStatus:      string(bq.BookingStatus),
		AppointmentDate:    bq.AppointmentDate,
		CreatedAt:          bq.CreatedAt,
		Notes:              bq.Notes,
	}
	if bq.DrugReceipt != nil {
		resp.DrugName = bq.DrugReceipt.DrugName
		resp.UsageInstructions = bq.DrugReceipt.UsageInstructions
		if bq.DrugReceipt.Notes != "" {
			resp.Notes = bq.DrugReceipt.Notes
		}
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
