package dtoservice

import "backend/internal/domain/examination/service"

type ServiceCategoryResponse struct {
	ServiceCategoryId uint16 `json:"service_category_id" `
	Name              string `json:"name"`
}

func ConvertServiceCategoryModelToServiceCategoryResponse(serviceModel *service.ServiceCategories) *ServiceCategoryResponse {
	resp := &ServiceCategoryResponse{
		ServiceCategoryId: serviceModel.ServiceCategoryId,
		Name: serviceModel.Name,
	}
	return resp
}

func ConvertServiceCategoryModelToServiceCategoryList(serviceModel []*service.ServiceCategories) []*ServiceCategoryResponse {
	services := make([]*ServiceCategoryResponse, len(serviceModel))

	for i, service := range serviceModel {
		services[i] = ConvertServiceCategoryModelToServiceCategoryResponse(service)
	}

	return services
}
