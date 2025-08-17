package patient

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type MedicalHistory struct {
	bun.BaseModel           `bun:"table:medical_history"`
	MedicalHistoryId        uuid.UUID `json:"medical_history_id" bun:"medical_history_id,pk,type:uuid"`
	DrugAllergies           []string  `json:"drug_allergies" bun:"drug_allergies,type:jsonb"`
	DiseaseTreatmentHistory []string  `json:"disease_treatment_history" bun:"disease_treatment_history,type:jsonb"`
	OtherHistory string `json:"other_history" bun:"other_history"`

	PatientId uuid.UUID `bun:"patient_id,notnull,type:uuid"`
	Patient   *Patient  `bun:"rel:belongs-to,join:patient_id=patient_id"`
}
