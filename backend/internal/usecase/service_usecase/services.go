package serviceusecase

import (
	"backend/internal/domain/dto/dtoservice"
	persistence "backend/internal/infrastructure/persistence/service-repository"
	"context"

	"github.com/google/uuid"
)

type ServicesUsecase interface {
	GetServiceListBySubcategoryId(ctx context.Context, subcategoryId uint16) ([]*dtoservice.ServiceResponse, error)
	GetServiceByServiceId(ctx context.Context, serviceId uuid.UUID) (*dtoservice.ServiceResponse, error)

	// admin
	CreateService(ctx context.Context, d *dtoservice.CreateServiceRequest) error
	UpdateService(ctx context.Context, serviceId uuid.UUID, ud *dtoservice.UpdateServiceRequest) error
	DeleteService(ctx context.Context, serviceId uuid.UUID) error
}

type serviceUsecase struct {
	repo persistence.ServiceRepository
}

func NewServicesUsecase(repo persistence.ServiceRepository) ServicesUsecase {
	return &serviceUsecase{repo: repo}
}

func (s *serviceUsecase) CreateService(ctx context.Context, d *dtoservice.CreateServiceRequest) error {

	serviceModel := s.repo.BuildServiceModelForCreate(d)
	return s.repo.CreateService(ctx, serviceModel)
}

func (s *serviceUsecase) GetServiceListBySubcategoryId(ctx context.Context, subcategoryId uint16) ([]*dtoservice.ServiceResponse, error) {
	service, err := s.repo.GetServiceListBySubcategoryId(ctx, subcategoryId)
	if err != nil {
		return nil, err
	}

	serviceList := dtoservice.ConvertServiceModelToServiceList(service)
	return serviceList, nil
}

func (s *serviceUsecase) GetServiceByServiceId(ctx context.Context, serviceId uuid.UUID) (*dtoservice.ServiceResponse, error) {
	service, err := s.repo.GetServiceByServiceId(ctx, serviceId)
	if err != nil {
		return nil, err
	}
	serviceModel := dtoservice.ConvertServiceModelToServiceResponse(service)
	return serviceModel, nil
}

// admin
func (s *serviceUsecase) UpdateService(ctx context.Context, serviceId uuid.UUID, ud *dtoservice.UpdateServiceRequest) error {
	serviceModel := s.repo.BuildServiceModelForUpdate(ud)
	return s.repo.UpdateService(ctx, serviceId, serviceModel)
}
func (s *serviceUsecase) DeleteService(ctx context.Context, serviceId uuid.UUID) error {
	return s.repo.DeleteService(ctx, serviceId)
}
