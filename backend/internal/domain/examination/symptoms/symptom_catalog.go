package symptoms

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type SymptomCatalog struct {
	bun.BaseModel `bun:"table:symptom_catalog"`
	SymptomId     uuid.UUID `json:"symptom_id" bun:"symptom_id,pk,type:uuid"`
	SymptomName   string    `json:"symptom_name" bun:"symptom_name"`
	Description   string    `json:"symptom_description" bun:"symptom_description"`
}
