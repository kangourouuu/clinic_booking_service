package drug

import (
	"backend/internal/domain/examination"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Prescription struct {
	bun.BaseModel      `bun:"table:prescription"`
	PrescriptionId     uuid.UUID `json:"prescription_id" bun:"prescription_id,pk,type:uuid"`
	DosageInstructions string    `json:"dosage_instructions" bun:"dosage_instructions"`
	Quantiy            byte      `json:"quantity" bun:"quantity"`
	Unit               string    `json:"unit" bun:"unit"`
	Notes              string    `json:"notes" bun:"notes"`
	Summary            string    `json:"summary" bun:"summary"`

	ExaminationId uuid.UUID                `bun:"examination_id,notnull"`
	Examination   *examination.Examination `bun:"rel:belongs-to,join:examination_id=examination_id"`
	DrugId        uuid.UUID                `bun:"drug_id,notnull"`
	Drug          *Drug                    `bun:"rel:belongs-to,join:drug_id=drug_id"`
}
