package api

import (
	"backend/internal/domain/dto"
	"backend/internal/usecase"
	errorsresponse "backend/pkg/app_response/errors_response"
	"backend/pkg/app_response/response"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type AdminHandler struct {
	adminUsecase usecase.AdminUsecase
}

func NewAdminHandler(adminUsecase usecase.AdminUsecase) *AdminHandler {
	return &AdminHandler{adminUsecase: adminUsecase}
}

func (h *AdminHandler) LoginAdmin(ctx *gin.Context) {
	var loginRequest dto.LoginAdminRequest
	if err := ctx.ShouldBindJSON(&loginRequest); err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "Email or password is invalid"))
		return
	}

	resp, err := h.adminUsecase.AdminLogin(ctx, &loginRequest)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorsresponse.NewCustomErrResponse(http.StatusUnauthorized, err.Error()))
		logrus.Error(err)
		return
	}
	ctx.SetCookie("clinic_token", resp.Token, 3600*24, "/", "", false, true)
	ctx.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, resp, "Login Successfully"))
}
