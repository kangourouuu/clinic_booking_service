package paraclinical

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type ParaclinicalCatalog struct {
	bun.BaseModel `bun:"table:paraclinical_catalog"`
	ParaclinicalCatalogId uuid.UUID `json:"paraclinical_catalog_id" bun:"paraclinical_catalog_id,pk,type:uuid"`
	TypeName string `json:"type_name" bun:"type_name"`
	Description string `json:"paraclinical_description" bun:"paraclinical_description"`
}