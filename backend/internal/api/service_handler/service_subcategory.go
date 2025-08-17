package servicehandler

import (
	serviceusecase "backend/internal/usecase/service_usecase"
	errorsresponse "backend/pkg/app_response/errors_response"
	"backend/pkg/app_response/response"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ServiceSubcategoryHandler struct {
	serviceSubcategoryUsecase serviceusecase.ServiceSubCategoryUsecase
}

func NewServiceSubCategoryHandler(serviceSubcategoryUsecase serviceusecase.ServiceSubCategoryUsecase) ServiceSubcategoryHandler {
	return ServiceSubcategoryHandler{serviceSubcategoryUsecase: serviceSubcategoryUsecase}
}

func (h *ServiceSubcategoryHandler) GetAllSubCategoriesByCategoryId(ctx *gin.Context) {

	categoryId, err := strconv.Atoi(ctx.Query("service_category_id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "Invalid service_category_id"))
		return
	}

	serviceSubcategories, err := h.serviceSubcategoryUsecase.GetAllSubCategoriesByCategoryId(ctx, uint16(categoryId))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Error has occur in server"))
		return
	}

	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, &serviceSubcategories, "All sub-categories has fetched"))
}

func (h *ServiceSubcategoryHandler) GetSubcategoryById(ctx *gin.Context) {
	subCategoryId, err := strconv.Atoi(ctx.Query("service_subcategory_id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "Invalid service_subcategory_id"))
		return
	}

	serviceSubcategory, err := h.serviceSubcategoryUsecase.GetSubCategoryById(ctx, uint16(subCategoryId))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Error has occur in server"))
		return
	}

	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, &serviceSubcategory, "category has fetched"))
}
