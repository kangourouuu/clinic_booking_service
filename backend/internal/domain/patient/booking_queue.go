package patient

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type PaymentStatus string
type BookingStatus string

const (
	PaymentStatusInProgess PaymentStatus = "waiting for payment"
	PaymentStatusPaid      PaymentStatus = "paid"
)

const (
	BookingStatusInProgress BookingStatus = "in progress"
	BookingStatusWaiting    BookingStatus = "waiting"
	BookingStatusReceipt    BookingStatus = "created drug receipt"
	BookingStatusCompleted  BookingStatus = "completed"
)

type BookingQueue struct {
	bun.BaseModel      `bun:"table:booking_queue"`
	QueueId            int       `json:"queue_id" bun:"queue_id,pk,autoincrement"`
	PatientId          uuid.UUID `json:"patient_id" bun:"patient_id,type:uuid"`
	PatientName        string    `json:"patient_name" bun:"patient_name"`
	PatientEmail       string    `json:"patient_email" bun:"patient_email"`
	PatientPhoneNumber string    `json:"patient_phone_number" bun:"patient_phone_number"`

	ServiceId   string  `json:"service_id" bun:"service_id"`
	ServiceName string  `json:"service_name" bun:"service_name"`
	ServiceCode string  `json:"service_code" bun:"service_code"`
	ServiceCost float64 `json:"service_cost" bun:"service_cost"`

	PaymentStatus PaymentStatus `json:"payment_status" bun:"payment_status,default:'waiting for payment'"`
	BookingStatus BookingStatus `json:"booking_status" bun:"booking_status,default:'in progress'"`

	AppointmentDate time.Time `json:"appointment" bun:"appointment,default:current_timestamp"`
	CreatedAt       time.Time `json:"created_at" bun:"created_at,default:current_timestamp"`

	DoctorId        *uuid.UUID `json:"doctor_id,omitempty" bun:"doctor_id,type:uuid"`
	DoctorName      string     `json:"doctor_name,omitempty" bun:"doctor_name"`
	TimeSlot        string     `json:"time_slot,omitempty" bun:"time_slot"`
	RoomNumber      string     `json:"room_number,omitempty" bun:"room_number"`
	QueueNumber     string     `json:"queue_number,omitempty" bun:"queue_number"`
	PaymentIntentId string     `json:"payment_intent_id,omitempty" bun:"payment_intent_id"`
	Notes           string     `json:"notes,omitempty" bun:"notes"`

	Patient     *Patient     `bun:"rel:belongs-to,join:patient_id=patient_id"`
	DrugReceipt *DrugReceipt `bun:"rel:has-one,join:queue_id=queue_id"`
}
