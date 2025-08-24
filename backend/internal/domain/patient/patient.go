package patient

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type NextOfKinInfo struct {
	FullName     string `json:"full_name" bun:"full_name"`
	Relationship string `json:"relationship" bun:"relationship"`
	PhoneNumber  string `json:"phone_number" bun:"phone_number"`
}

type Patient struct {
	bun.BaseModel     `bun:"table:patient"`
	PatientId         uuid.UUID       `json:"patient_id" bun:"patient_id,pk,type:uuid"`
	FullName          string          `json:"full_name" bun:"full_name"`
	DoB               time.Time       `json:"dob" bun:"dob"`
	Gender            string          `json:"gender" bun:"gender"`
	PhoneNumber       string          `json:"phone_number" bun:"phone_number,unique"`
	Password          string          `json:"-" bun:"password"`
	Email             string          `json:"email" bun:"email,unique"`
	Address           string          `json:"address" bun:"address"`
	PortraitPhotoURL  string          `json:"photo" bun:"photo"`
	HealthInsuranceID string          `json:"health_insurance_id" bun:"health_insurance_id"`
	CitizenID         string          `json:"citizen_id" bun:"citizen_id,notnull,unique"`
	NextOfKinInfo     []NextOfKinInfo `json:"next_of_kin_info" bun:"next_of_kin_info,type:jsonb"` // nullable
	Resereved1        string          `bun:"resereved1"`
	Resereved2        string          `bun:"resereved2"`
	Resereved3        string          `bun:"resereved3"`
	CreatedAt         time.Time       `json:"created_at"`
	UpdatedAt         time.Time       `json:"updated_at"`

	MedicalHistory     *MedicalHistory     `json:"medical_history,omitempty" bun:"rel:has-one,join:patient_id=patient_id"`
	GeneralExamination *GeneralExamination `json:"general_examination" bun:"rel:has-one,join:patient_id=patient_id"`
	BookingQueue       *BookingQueue       `json:"booking_queue" bun:"rel:has-one,join:patient_id=patient_id"`
}
