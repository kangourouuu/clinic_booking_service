package serviceusecase

import (
	"backend/internal/domain/dto/dtoservice"
	persistence "backend/internal/infrastructure/persistence/service-repository"
	"context"
)

type ServiceSubCategoryUsecase interface {
	GetAllSubCategoriesByCategoryId(ctx context.Context, categoryId uint16) ([]*dtoservice.ServiceSubcategoryResponse, error)
	GetSubCategoryById(ctx context.Context, subCategoryId uint16) (*dtoservice.ServiceSubcategoryResponse, error)
}

type serviceSubCategoryUsecase struct {
	repo persistence.ServiceSubCategory
}

func NewServiceSubCategoryUsecase(repo persistence.ServiceSubCategory) ServiceSubCategoryUsecase {
	return &serviceSubCategoryUsecase{repo: repo}
}

func (s *serviceSubCategoryUsecase) GetAllSubCategoriesByCategoryId(ctx context.Context, categoryId uint16) ([]*dtoservice.ServiceSubcategoryResponse, error) {

	service, err := s.repo.GetAllSubCategoriesByCategoryId(ctx, categoryId)
	if err != nil {
		return nil, err
	}

	services := dtoservice.ConvertServiceSubCategoryModelToServiceSubCategoryList(service)
	return services, nil
}
func (s *serviceSubCategoryUsecase) GetSubCategoryById(ctx context.Context, subCategoryId uint16) (*dtoservice.ServiceSubcategoryResponse, error) {

	subcategory, err := s.repo.GetSubCategoryById(ctx, subCategoryId)
	if err != nil {
		return nil, err
	}

	service := dtoservice.ConvertServiceSubCategoryModelToServiceSubCategoryResponse(subcategory)
	return service, nil
}
