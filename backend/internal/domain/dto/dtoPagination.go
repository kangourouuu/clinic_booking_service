package dto

import "backend/pkg/common/pagination"

type PaginationResponse struct {
	Data       interface{}            `json:"data"`
	Pagination *pagination.Pagination `json:"pagination"`
}
