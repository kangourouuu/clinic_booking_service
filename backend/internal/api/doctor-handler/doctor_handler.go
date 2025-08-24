package doctorhandler

import (
	"backend/internal/domain/dto"
	"backend/internal/domain/dto/dtodoctor"
	doctorusecase "backend/internal/usecase/doctor-usecase"
	errorsresponse "backend/pkg/app_response/errors_response"
	"backend/pkg/app_response/response"
	"backend/pkg/common/pagination"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type DoctorHandler struct {
	doctorSvc doctorusecase.DoctorUsecase
}

func NewDoctorHandler(doctorSvc doctorusecase.DoctorUsecase) *DoctorHandler {
	return &DoctorHandler{doctorSvc: doctorSvc}
}

func (h *DoctorHandler) CreateDoctor(ctx *gin.Context) {
	var req dtodoctor.CreateDoctorRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "invalid input"))
		logrus.Error(err)
		return
	}

	err := h.doctorSvc.CreateDoctor(ctx, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, err.Error()))
		logrus.Error(err)
		return
	}

	ctx.JSON(http.StatusCreated, response.NewCustomSuccessResponse(http.StatusCreated, &req, "Created a new nurse"))
}

func (h *DoctorHandler) LoginDoctor(ctx *gin.Context) {
	var req dto.LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "Email or Password incorrect"))
		logrus.Error(err)
		return
	}

	resp, err := h.doctorSvc.Login(ctx, &req)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorsresponse.NewCustomErrResponse(http.StatusUnauthorized, err.Error()))
		logrus.Error(err)
		return
	}

	ctx.SetCookie("clinic_token", resp.Token, 3600*24, "/", "", false, true)

	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, &resp, "Doctor login successfully"))
}

func (h *DoctorHandler) GetDoctors(ctx *gin.Context) {
	var pagination *pagination.Pagination
	if err := ctx.ShouldBindQuery(&pagination); err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "invalid page"))
	}
	d, err := h.doctorSvc.GetDoctors(ctx, pagination)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, err.Error()))
		logrus.Error(err)
		return
	}
	fullResp := dto.PaginationResponse[dtodoctor.DoctorResponse]{
		Data:       d,
		Pagination: pagination,
	}
	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, &fullResp, "Data fetch"))
}

func (h *DoctorHandler) GetDoctorById(ctx *gin.Context) {
	id := ctx.Param("id")
	d, err := h.doctorSvc.GetDoctorById(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, err.Error()))
		logrus.Error(err)
		return
	}

	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, &d, "Data fetch"))
}

func (h *DoctorHandler) UpdateDoctor(ctx *gin.Context) {
	var req dtodoctor.UpdateDoctorRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "invalid input"))
		logrus.Error(err)
		return
	}
	id := ctx.Param("id")
	err := h.doctorSvc.UpdateDoctorById(ctx, id, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, err.Error()))
		logrus.Error(err)
		return
	}

	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, &req, "Doctor updated"))
}

func (h *DoctorHandler) DeleteDoctor(ctx *gin.Context) {
	id := ctx.Param("id")
	err := h.doctorSvc.DeleteDoctorById(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Failed to delete doctor"))
		logrus.Error(err)
		return
	}
	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, id, "Doctor deleted"))
}

func (h *DoctorHandler) GetDoctorProfile(ctx *gin.Context) {
	doctorId, exists := ctx.Get("doctor")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, errorsresponse.NewCustomErrResponse(http.StatusUnauthorized, "Doctor ID not found"))
		return
	}

	doctorIdStr, ok := doctorId.(string)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Invalid doctor ID format"))
		return
	}

	doctor, err := h.doctorSvc.GetDoctorById(ctx, doctorIdStr)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Failed to fetch doctor profile"))
	}

	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, &doctor, "Profile doctor has fetched"))
}
