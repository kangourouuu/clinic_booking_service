package examination

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Diagnosis struct {
	bun.BaseModel       `bun:"table:diagnosis"`
	DiagnosisId         uuid.UUID `json:"diagnosis_id" bun:"diagnosis_id,pk,type:uuid"`
	PrimaryDisease      []string  `json:"primary_disease" bun:"primary_disease"`
	AccompanyingDisease []string  `json:"accompanying_disease" bun:"accompanying_disease"`

	ExaminationId uuid.UUID    `bun:"examination_id,notnull"`
	Examination   *Examination `bun:"rel:belongs-to,join:examination_id=examination_id"`
}
