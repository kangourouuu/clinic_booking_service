package serviceusecase

import (
	"backend/internal/domain/dto/dtoservice"
	persistence "backend/internal/infrastructure/persistence/service-repository"
	"context"
)

type ServiceCategoryUsecase interface {
	GetAllCategories(ctx context.Context) ([]*dtoservice.ServiceCategoryResponse, error)
	GetCategoryById(ctx context.Context, categoryId uint16) (*dtoservice.ServiceCategoryResponse, error)
}

type serviceCategoryUsecase struct {
	repo persistence.ServiceCategoryRepository
}

func NewServiceCategoryUsecase(repo persistence.ServiceCategoryRepository) ServiceCategoryUsecase {
	return &serviceCategoryUsecase{repo: repo}
}

func (s *serviceCategoryUsecase) GetAllCategories(ctx context.Context) ([]*dtoservice.ServiceCategoryResponse, error) {
	services, err := s.repo.GetAllCategories(ctx)
	if err != nil {
		return nil, err
	}

	serviceList := dtoservice.ConvertServiceCategoryModelToServiceCategoryList(services)

	return serviceList, nil
}

func (s *serviceCategoryUsecase) GetCategoryById(ctx context.Context, categoryId uint16) (*dtoservice.ServiceCategoryResponse, error) {

	category, err := s.repo.GetCategoryById(ctx, categoryId)
	if err != nil {
		return nil, err
	}

	service := dtoservice.ConvertServiceCategoryModelToServiceCategoryResponse(category)

	return service, nil
}
