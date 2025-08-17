package servicehandler

import (
	"backend/internal/domain/dto/dtoservice"
	serviceusecase "backend/internal/usecase/service_usecase"
	errorsresponse "backend/pkg/app_response/errors_response"
	"backend/pkg/app_response/response"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type ServiceHandler struct {
	serviceUsecase serviceusecase.ServicesUsecase
}

func NewServiceHandler(serviceUsecase serviceusecase.ServicesUsecase) ServiceHandler {
	return ServiceHandler{
		serviceUsecase: serviceUsecase,
	}
}

func (h *ServiceHandler) GetServiceBySubcategoryId(ctx *gin.Context) {

	subcategoryId, err := strconv.Atoi(ctx.Query("service_subcategory_id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "Invalid service_subcategory_id"))
		return
	}

	resp, err := h.serviceUsecase.GetServiceListBySubcategoryId(ctx, uint16(subcategoryId))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Error has occured in server"))
		logrus.Error(err)
		return
	}

	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, &resp, "All service has fetched"))
}

func (h *ServiceHandler) CreateService(ctx *gin.Context) {
	var req dtoservice.CreateServiceRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "Invalid input"))
		return
	}

	err := h.serviceUsecase.CreateService(ctx, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Error has occured in server"))
		return
	}

	ctx.JSON(http.StatusCreated, response.NewCustomSuccessResponse(http.StatusCreated, &req, "Created successfully"))
}
