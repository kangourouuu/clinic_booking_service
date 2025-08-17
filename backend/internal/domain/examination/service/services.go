package service

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Services struct {
	bun.BaseModel `bun:"table:services"`
	ServiceId     uuid.UUID `json:"service_id" bun:"service_id,pk,type:uuid"`
	ServiceCode   string    `json:"service_code" bun:"service_code"`
	ServiceName   string    `json:"service_name" bun:"service_name"`
	Cost          float64   `json:"cost" bun:"cost"`

	ServiceSubCategoryId uint16                `json:"service_subcategory_id" bun:"service_subcategory_id"`
	ServiceSubCategory   *ServiceSubCategories `bun:"rel:belongs-to,join:service_subcategory_id=service_subcategory_id"`
}
