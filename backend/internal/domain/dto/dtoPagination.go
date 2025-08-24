package dto

import "backend/pkg/common/pagination"

type PaginationResponse[T any] struct {
	Data       []*T                   `json:"data"`
	Pagination *pagination.Pagination `json:"pagination"`
}
