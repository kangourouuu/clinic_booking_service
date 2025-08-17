package paymenthandler

import (
	messagequeue "backend/internal/usecase/message_queue"
	paymentusecase "backend/internal/usecase/payment_usecase"
	errorsresponse "backend/pkg/app_response/errors_response"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/stripe/stripe-go/v82/webhook"
)

type PaymentHandler struct {
	rbmqUsecase    messagequeue.RabbitMQUsecase
	paymentUsecase paymentusecase.PaymentMethods
}

func NewPaymentHandler(rbmqUsecase messagequeue.RabbitMQUsecase, paymentUsecase paymentusecase.PaymentMethods) PaymentHandler {
	return PaymentHandler{rbmqUsecase: rbmqUsecase,
		paymentUsecase: paymentUsecase}
}

var webhookSecret = "whsec_69bf16774010514d064780853b0d11826c96e9833a2e06ad14395224c994700b"

func (h *PaymentHandler) HandleWebHook(ctx *gin.Context) {
	const MaxBodyBytes = int64(65536)
	ctx.Request.Body = http.MaxBytesReader(ctx.Writer, ctx.Request.Body, MaxBodyBytes)
	payload, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "failed to read webhook payload"))
		return
	}

	sigHeader := ctx.Request.Header.Get("Stripe-Signature")
	event, err := webhook.ConstructEventWithOptions(payload, sigHeader, webhookSecret, webhook.ConstructEventOptions{IgnoreAPIVersionMismatch: true})
	logrus.Print(webhookSecret)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorsresponse.NewCustomErrResponse(http.StatusBadRequest, "invalid Signature"))
		logrus.Info(sigHeader)
		logrus.Info(webhookSecret)
		logrus.Error(err)
		return
	}

	switch event.Type {
	case "checkout.session.completed":
		bookingQueuePublish, err := h.paymentUsecase.WebhookCheckAndSolving(event)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Failed to process payment"))
			return 
		}

		err = h.rbmqUsecase.PublishBooking(ctx, bookingQueuePublish)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, errorsresponse.NewCustomErrResponse(http.StatusInternalServerError, "Failed to publish booking queue"))
			return
		}
	}

}
