package patient

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type GeneralExamination struct {
	bun.BaseModel `bun:"table:general_exam"`
	GeneralExamID uuid.UUID `json:"general_id" bun:"general_id,pk,type:uuid"`
	VitalSigns    string    `json:"vital_signs" bun:"vital_signs"`
	Temperature   float64   `json:"temperature" bun:"temperature"`
	Weight        float64   `json:"weight" bun:"weight"`
	Height        float64   `json:"height" bun:"height"`
	BMI           float64   `json:"bmi" bun:"bmi"` // must be calculated
	ReservedField string    `json:"-"`

	PatientId uuid.UUID `json:"patient_id" bun:"patient_id,pk,type:uuid"`
	Patient   *Patient  `bun:"rel:belongs-to,join:patient_id=patient_id"`
}
