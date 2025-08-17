package service

import (
	"github.com/uptrace/bun"
)

type ServiceSubCategories struct {
	bun.BaseModel        `bun:"table:service_subcategories"`
	ServiceSubCategoryId uint16 `json:"service_subcategory_id" bun:"service_subcategory_id,pk"`
	Name                 string `json:"name" bun:"name"`

	ServiceCategoryId uint16             `json:"service_category_id" bun:"service_category_id"`
	ServiceCategory *ServiceCategories `bun:"rel:belongs-to,join:service_category_id=service_category_id"`

	Services []*Services `bun:"rel:has-many,join:service_subcategory_id=service_subcategory_id"`
}
