package servicehandler

import (
	serviceusecase "backend/internal/usecase/service_usecase"
	errorsresponse "backend/pkg/app_response/errors_response"
	"backend/pkg/app_response/response"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ServiceCategoryHandler struct {
	serviceCategoryUsecase serviceusecase.ServiceCategoryUsecase
}

func NewServiceCategoryHandler(serviceCategoryUsecase serviceusecase.ServiceCategoryUsecase) *ServiceCategoryHandler {
	return &ServiceCategoryHandler{serviceCategoryUsecase: serviceCategoryUsecase}
}

func (h *ServiceCategoryHandler) GetAllCategories(ctx *gin.Context) {

	serviceCategories, err := h.serviceCategoryUsecase.GetAllCategories(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Error has occur in server"))
		return
	}

	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, &serviceCategories, "all service-categories has fetched"))
}

func (h *ServiceCategoryHandler) GetCategoryById(ctx *gin.Context) {

	categoryId, err := strconv.Atoi(ctx.Query("service_category_id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "Invalid service_category_id"))
		return
	}

	serviceCategory, err := h.serviceCategoryUsecase.GetCategoryById(ctx, uint16(categoryId))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Error has occur in server"))
		return
	}

	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, &serviceCategory, "category has fetched"))
}
