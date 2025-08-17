package service

import "github.com/uptrace/bun"

type ServiceCategories struct {
	bun.BaseModel     `bun:"table:service_categories"`
	ServiceCategoryId uint16 `json:"service_category_id" bun:"service_category_id,pk"`
	Name              string `json:"name" bun:"name"`

	ServiceSubCategory []*ServiceSubCategories `bun:"rel:has-many,join:service_category_id=service_category_id"`
}
