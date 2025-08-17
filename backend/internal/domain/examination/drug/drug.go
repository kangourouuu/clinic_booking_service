package drug

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Drug struct {
	bun.BaseModel     `bun:"table:drug"`
	DrugId            uuid.UUID `json:"drug_id" bun:"drug_id,pk,type:uuid"`
	DrugCode          string    `json:"drug_code" bun:"drug_code,unique"`
	DrugName          string    `json:"drug_name" bun:"drug_name"`
	UsageInstructions string    `json:"usage_instructions" bun:"usage_instructions"`
	Notes             string    `json:"notes" bun:"notes"`
}
