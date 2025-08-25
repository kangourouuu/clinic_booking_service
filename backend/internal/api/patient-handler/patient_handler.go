package patienthandler

import (
	"backend/internal/api/middleware"
	"backend/internal/domain/dto"
	dtopatient "backend/internal/domain/dto/dto_patient"
	"backend/internal/domain/dto/dtoservice"
	dtoqueue "backend/internal/domain/dto/queue"
	patientusecase "backend/internal/usecase/patient-usecase"
	paymentusecase "backend/internal/usecase/payment_usecase"
	serviceusecase "backend/internal/usecase/service_usecase"
	"strconv"

	errorsresponse "backend/pkg/app_response/errors_response"
	"backend/pkg/app_response/response"
	"backend/pkg/common/pagination"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

type PatientHandler struct {
	patientSvc          patientusecase.PatientUsecase
	serviceUsecase      serviceusecase.ServicesUsecase
	bookingQueueUsecase serviceusecase.BookingQueueUseCase
	paymentUsecase      paymentusecase.PaymentMethods
}

func NewPatientHandler(patientSvc patientusecase.PatientUsecase, serviceUsecase serviceusecase.ServicesUsecase, bookingQueueUsecase serviceusecase.BookingQueueUseCase, paymentUsecase paymentusecase.PaymentMethods) *PatientHandler {
	return &PatientHandler{
		patientSvc:          patientSvc,
		serviceUsecase:      serviceUsecase,
		bookingQueueUsecase: bookingQueueUsecase,
		paymentUsecase:      paymentUsecase,
	}
}

// register
func (h *PatientHandler) CreatePatient(ctx *gin.Context) {
	var req dtopatient.CreatePatientRequest

	err := ctx.ShouldBind(&req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "Invalid JSON format"))
		logrus.Error(err)
		return
	}

	file, err := ctx.FormFile("avatar")
	if err != nil && err != http.ErrMissingFile {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "failed to get file from avatar key"))
		return
	}

	err = h.patientSvc.CreatePatient(ctx, &req, file)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, err.Error()))
		logrus.Error(err)
		return
	}

	ctx.JSON(http.StatusCreated, response.NewCustomSuccessResponse(http.StatusCreated, req, "New patient has created"))
}

func (h *PatientHandler) GetPatients(ctx *gin.Context) {
	var paginationReq pagination.Pagination
	if err := ctx.ShouldBindQuery(&paginationReq); err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "invalid query parameters"))
		return
	}

	resp, err := h.patientSvc.GetPatients(ctx, &paginationReq)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Failed to fetch patient's data"))
		logrus.Error(err)
		return
	}

	fullResp := dto.PaginationResponse[dtopatient.PatientResponse]{
		Data:       resp,
		Pagination: &paginationReq,
	}

	logrus.Printf("Handler response: %+v", fullResp)
	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, &fullResp, "Data fetched"))
}

func (h *PatientHandler) GetPatientById(ctx *gin.Context) {
	id := ctx.Param("id")

	resp, err := h.patientSvc.GetPatientById(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Failed to fetch patient's data"))
		logrus.Error(err)
		return
	}
	logrus.Printf("Handler response: %+v", resp)
	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, &resp, "Data fetched"))
}

func (h *PatientHandler) UpdatePatient(ctx *gin.Context) {
	var req dtopatient.UpdatePatientRequest

	param := ctx.Param("id")

	// Parse multipart form
	err := ctx.Request.ParseMultipartForm(32 << 20) // 32MB max
	if err != nil {
		logrus.Errorf("Failed to parse multipart form: %v", err)
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "Failed to parse multipart form"))
		return
	}

	for key, values := range ctx.Request.MultipartForm.Value {
		logrus.Infof("  %s: %v", key, values)
	}

	for key, files := range ctx.Request.MultipartForm.File {
		logrus.Infof("  %s: %d files", key, len(files))
		for i, file := range files {
			logrus.Infof("    File %d: %s (size: %d)", i, file.Filename, file.Size)
		}
	}

	// Use ShouldBind for multipart form
	err = ctx.ShouldBind(&req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "Invalid form data: "+err.Error()))
		logrus.Errorf("Form binding failed: %v", err)
		return
	}

	// Set PatientId from URL param
	if patientUUID, err := uuid.Parse(param); err == nil {
		req.PatientId = patientUUID
	}

	logrus.Infof("Parsed request: %+v", req)

	// Try to get avatar file
	file, err := ctx.FormFile("avatar")
	if err != nil {
		// Check if avatar field contains "NO_CHANGE" string instead of file
		avatarValue := ctx.PostForm("avatar")
		logrus.Infof("Avatar field value: %s", avatarValue)
		if avatarValue != "NO_CHANGE" {
			logrus.Errorf("Failed to get avatar file and no NO_CHANGE value: %v", err)
			ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "failed to get file from avatar key"))
			return
		}
		// If "NO_CHANGE", pass nil file to indicate no avatar update
		logrus.Infof("Avatar set to NO_CHANGE, proceeding without file")
		file = nil
	}

	err = h.patientSvc.UpdatePatient(ctx, param, &req, file)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, err.Error()))
		logrus.Error(err)
		logrus.Print(&req)
		return
	}

	// return success response
	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, &req, "Data updated"))
}

func (h *PatientHandler) DeletePatient(ctx *gin.Context) {
	param := ctx.Param("id")

	err := h.patientSvc.DeletePatientById(ctx, param)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, err.Error()))
		logrus.Error(err)
		return
	}

	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, param, "Deleted"))
}

func (h *PatientHandler) LoginPatient(ctx *gin.Context) {
	var req dto.LoginRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "Invalid JSON format"))
		logrus.Error(err)
		return
	}

	loginResp, err := h.patientSvc.LoginPatient(ctx, &req)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorsresponse.NewCustomErrResponse(http.StatusUnauthorized, err.Error()))
		logrus.Error(err)
		return
	}

	ctx.SetCookie("clinic_token", loginResp.Token, 3600*24, "/", "", false, true)

	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, loginResp, "Login successfully"))
}

func (h *PatientHandler) GetProfile(ctx *gin.Context) {
	patientId, exists := ctx.Get("patient")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, errorsresponse.NewCustomErrResponse(http.StatusUnauthorized, "Patient ID not found"))
		return
	}

	patientIdStr, ok := patientId.(string)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Invalid patient ID format"))
		return
	}

	resp, err := h.patientSvc.GetPatientById(ctx, patientIdStr)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Failed to fetch patient profile"))
		logrus.Error(err)
		return
	}

	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, &resp, "Profile fetched successfully"))
}

func (h *PatientHandler) PatientRegisterService(ctx *gin.Context) {
	var appointment dtoservice.AppointmentRequest
	if err := ctx.ShouldBindJSON(&appointment); err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "appointment date is not valid"))
		logrus.Error(err)
		return
	}

	patientId, _, err := middleware.GetPatientIdFromToken(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Error has occured in server"))
		logrus.Error(err)
		return
	}

	patient, err := h.patientSvc.GetPatientById(ctx, patientId)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Error has occured in server"))
		logrus.Error(err)
		return
	}

	serviceId, err := uuid.Parse(ctx.Param("serviceId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "Invalid id"))
		return
	}

	service, err := h.serviceUsecase.GetServiceByServiceId(ctx, serviceId)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Error has occured in server"))
		logrus.Error(err)
		return
	}

	s, err := h.paymentUsecase.CreateCheckoutSession(patient, service, appointment)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Error has occured in server"))
		logrus.Error(err)
		return
	}

	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, gin.H{
		"url":        s.URL,
		"session_id": s.ID,
		// "information": &req,
	}, "Session created"))
}

func (h *PatientHandler) GetBookingQueuesByPatientId(ctx *gin.Context) {
	var paginationReq pagination.Pagination
	if err := ctx.ShouldBindQuery(&paginationReq); err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "Pagination not valid"))
		return
	}

	userId, exists := ctx.Get("patient")
	if !exists {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "Patient ID not found"))
		return
	}

	patientId := uuid.MustParse(userId.(string))
	logrus.Info(patientId)
	resp, err := h.bookingQueueUsecase.GetHistoryQueuesByPatientId(ctx, &paginationReq, patientId)
	if err != nil {
		logrus.Error(err)
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Error has occur in server"))
		return
	}

	fullResp := &dto.PaginationResponse[dtoqueue.BookingQueueResponse]{
		Data:       resp,
		Pagination: &paginationReq,
	}

	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, &fullResp, "History of booking"))
}

func (h *PatientHandler) GetDetailBookingByQueueId(ctx *gin.Context) {
	id := ctx.Query("queueId")
	queueId, err := strconv.Atoi(id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "Invalid Queue ID"))
		return
	}

	resp, err := h.bookingQueueUsecase.GetDetailsBookingByQueueId(ctx, queueId)
	if err != nil {
		logrus.Error(err)
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Error has occur in server"))
		return
	}

	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, &resp, "Data fetched"))
}
