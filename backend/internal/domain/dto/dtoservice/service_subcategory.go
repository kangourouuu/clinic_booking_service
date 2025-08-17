package dtoservice

import "backend/internal/domain/examination/service"

type ServiceSubcategoryResponse struct {
	ServiceSubCategoryId uint16 `json:"service_subcategory_id"`
	Name                 string `json:"name"`
}

func ConvertServiceSubCategoryModelToServiceSubCategoryResponse(serviceModel *service.ServiceSubCategories) *ServiceSubcategoryResponse {
	resp := &ServiceSubcategoryResponse{
		ServiceSubCategoryId: serviceModel.ServiceSubCategoryId,
		Name:              serviceModel.Name,
	}
	return resp
}

func ConvertServiceSubCategoryModelToServiceSubCategoryList(serviceModel []*service.ServiceSubCategories) []*ServiceSubcategoryResponse {
	services := make([]*ServiceSubcategoryResponse, len(serviceModel))

	for i, service := range serviceModel {
		services[i] = ConvertServiceSubCategoryModelToServiceSubCategoryResponse(service)
	}

	return services
}
