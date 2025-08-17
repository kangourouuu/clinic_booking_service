package examination

import (
	"backend/internal/domain/doctor"
	"backend/internal/domain/patient"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Examination struct {
	bun.BaseModel           `bun:"table:examination"`
	ExaminationId           uuid.UUID `json:"examination_id" bun:"examination_id,pk,type:uuid"`
	Date                    time.Time `json:"date" bun:"date"`
	Type                    string    `json:"type" bun:"type"`
	PaymentStatus           string    `json:"payment_status" bun:"payment_status,default:peding"` // pending, paid
	ClinicConfirmation      bool      `json:"clinic_confirm" bun:"clinic_confirm"`
	SimplifiedMedicalRecord *patient.GeneralExamination
	// ComprehensiveMedicalRecord

	ServiceId uuid.UUID `bun:"service_id,notnull"`
	PatientId uuid.UUID `bun:"patient_id,notnull"`
	DoctorId  uuid.UUID `bun:"doctor_id,notnull"`

	// Service *ExaminationService `bun:"rel:belongs-to,join:service_id=service_id"`
	Patient *patient.Patient `bun:"rel:belongs-to,join:patient_id=patient_id"`
	Doctor  *doctor.Doctor   `bun:"rel:belongs-to,join:doctor_id=doctor_id"`
}
