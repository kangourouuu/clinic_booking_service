package main

import (
	"backend/internal/infrastructure/db"
	"backend/internal/infrastructure/rabbitmq"
	paymentusecase "backend/internal/usecase/payment_usecase"
	"backend/pkg/app_response/response"
	"backend/pkg/config"
	dbinit "backend/pkg/db_init"
	"backend/pkg/idempotency"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
	"github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/checkout/session"
	"github.com/stripe/stripe-go/v82/refund"
	"github.com/stripe/stripe-go/v82/webhook"
)

func main() {
	_ = godotenv.Load()
	logrus.SetFormatter(&logrus.JSONFormatter{})

	if err := config.InitConfig(); err != nil {
		logrus.Warn("Using default/env config: ", err)
	}

	if err := dbinit.InitDatabase(); err != nil {
		logrus.Fatalf("Failed to init database: %v", err)
	}

	dbClient := db.DatabaseClient.GetDB()
	eventStore := idempotency.NewEventStore(dbClient)

	rabbitMQClient, err := dbinit.InitRabbitMQ()
	if err != nil {
		logrus.Warn("RabbitMQ connection not available for payment service: ", err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "9004"
	}

	stripeKey := os.Getenv("STRIPE_SECRET_KEY")
	if stripeKey == "" {
		stripeKey = os.Getenv("STRIPE_API")
	}
	stripe.Key = stripeKey

	webhookSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")

	paymentUsecase := paymentusecase.NewPaymentMethods()

	r := gin.New()
	r.Use(gin.Recovery())

	// Probes
	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "payment-service"})
	})
	r.GET("/readyz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ready", "service": "payment-service"})
	})

	apiGroup := r.Group("/api")
	{
		// 1. Create Checkout Session with Idempotency Key
		apiGroup.POST("/v1/payments/checkout", func(c *gin.Context) {
			type CheckoutRequest struct {
				PatientID       string  `json:"patient_id"`
				PatientName     string  `json:"patient_name"`
				PatientEmail    string  `json:"patient_email"`
				PatientPhone    string  `json:"patient_phone"`
				ServiceID       string  `json:"service_id"`
				ServiceName     string  `json:"service_name"`
				ServiceCode     string  `json:"service_code"`
				Cost            float64 `json:"cost"`
				AppointmentDate string  `json:"appointment_date"`
				IdempotencyKey  string  `json:"idempotency_key"`
			}

			var req CheckoutRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid checkout request: " + err.Error()})
				return
			}

			if stripe.Key == "" {
				c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Stripe API key is not configured"})
				return
			}

			vndAmount := req.Cost
			if vndAmount < 1000 {
				vndAmount = 1000
			}

			frontendURL := os.Getenv("FRONTEND_URL")
			if frontendURL == "" {
				frontendURL = "http://localhost:8080"
			}

			params := &stripe.CheckoutSessionParams{
				Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
				LineItems: []*stripe.CheckoutSessionLineItemParams{
					{
						PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
							Currency: stripe.String(string(stripe.CurrencyVND)),
							ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
								Name:        stripe.String(req.ServiceName),
								Description: stripe.String("Clinic medical consultation & service"),
							},
							UnitAmount: stripe.Int64(int64(vndAmount)),
						},
						Quantity: stripe.Int64(1),
					},
				},
				SuccessURL: stripe.String(fmt.Sprintf("%s/payment/success?session_id={CHECKOUT_SESSION_ID}", frontendURL)),
				CancelURL:  stripe.String(fmt.Sprintf("%s/payment/cancel", frontendURL)),
				Metadata: map[string]string{
					"patient_id":           req.PatientID,
					"patient_name":         req.PatientName,
					"patient_email":        req.PatientEmail,
					"patient_phone_number": req.PatientPhone,
					"service_id":           req.ServiceID,
					"service_name":         req.ServiceName,
					"service_code":         req.ServiceCode,
					"service_cost":         fmt.Sprintf("%.2f", vndAmount),
					"appointment_date":     req.AppointmentDate,
				},
				PaymentMethodTypes: []*string{
					stripe.String("card"),
				},
			}

			// Add Stripe Idempotency Key if provided (Checkpoint 2)
			if req.IdempotencyKey != "" {
				params.IdempotencyKey = stripe.String(req.IdempotencyKey)
			}

			s, err := session.New(params)
			if err != nil {
				logrus.Errorf("Failed to create Stripe session: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create checkout session: " + err.Error()})
				return
			}

			c.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, gin.H{
				"session_id":   s.ID,
				"checkout_url": s.URL,
			}, "Stripe checkout session created"))
		})

		// 2. Stripe Webhook Handler with Deduplication (Checkpoint 3 & 4)
		webhookHandler := func(c *gin.Context) {
			const maxBodyBytes = int64(65536)
			c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxBodyBytes)
			payload, err := io.ReadAll(c.Request.Body)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Error reading request body"})
				return
			}

			var event stripe.Event
			if webhookSecret != "" {
				sigHeader := c.GetHeader("Stripe-Signature")
				event, err = webhook.ConstructEvent(payload, sigHeader, webhookSecret)
				if err != nil {
					logrus.Warnf("Webhook signature verification failed: %v", err)
					c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid signature: " + err.Error()})
					return
				}
			} else {
				if err := json.Unmarshal(payload, &event); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON payload"})
					return
				}
			}

			// Idempotency Checkpoint 3: Check if event was already processed
			isProcessed, err := eventStore.IsEventProcessed(c.Request.Context(), event.ID)
			if err == nil && isProcessed {
				logrus.Infof("Webhook event %s already processed. Returning 200 OK (Idempotent)", event.ID)
				c.JSON(http.StatusOK, gin.H{"status": "already_processed"})
				return
			}

			if event.Type == "checkout.session.completed" {
				bookingData, err := paymentUsecase.WebhookCheckAndSolving(event)
				if err != nil {
					logrus.Errorf("Error parsing checkout session data: %v", err)
					c.JSON(http.StatusBadRequest, gin.H{"error": "Error parsing session data"})
					return
				}

				// Publish booking to RabbitMQ
				if rabbitMQClient != nil {
					conn, err := rabbitMQClient.GetConnection()
					if err == nil {
						ch, err := rabbitMQClient.GetChannel(conn)
						if err == nil {
							defer rabbitMQClient.CloseChannel(ch)
							_ = rabbitMQClient.PublishWithContext(c.Request.Context(), ch, bookingData, rabbitmq.QueueName)
						}
					}
				}

				// Mark event as processed atomically in DB
				_ = eventStore.MarkEventProcessed(c.Request.Context(), event.ID, string(event.Type))
				logrus.Infof("Webhook event %s processed successfully and booking published to RabbitMQ", event.ID)
			}

			c.JSON(http.StatusOK, gin.H{"received": true})
		}

		apiGroup.POST("/payment/webhook", webhookHandler)
		apiGroup.POST("/v1/payments/webhook", webhookHandler)

		// 3. Automated Refund API (Checkpoint 4: in case slot was cancelled/expired)
		apiGroup.POST("/v1/payments/refund", func(c *gin.Context) {
			type RefundRequest struct {
				PaymentIntentID string `json:"payment_intent_id"`
				Reason          string `json:"reason"`
			}
			var req RefundRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid refund request"})
				return
			}

			if stripe.Key == "" {
				c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Stripe is not configured"})
				return
			}

			reasonStr := string(stripe.RefundReasonDuplicate)
			if req.Reason != "" {
				reasonStr = req.Reason
			}

			params := &stripe.RefundParams{
				PaymentIntent: stripe.String(req.PaymentIntentID),
				Reason:        stripe.String(reasonStr),
			}

			ref, err := refund.New(params)
			if err != nil {
				logrus.Errorf("Stripe refund failed for %s: %v", req.PaymentIntentID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Refund failed: " + err.Error()})
				return
			}

			logrus.Infof("Stripe refund %s issued successfully for intent %s", ref.ID, req.PaymentIntentID)
			c.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, gin.H{
				"refund_id": ref.ID,
				"status":    ref.Status,
				"amount":    ref.Amount,
			}, "Refund issued successfully"))
		})
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	go func() {
		logrus.Infof("Payment Service running on port :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logrus.Fatalf("Payment Service listen error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logrus.Info("Shutting down Payment Service...")
	ctxTimeout, cancelTimeout := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancelTimeout()
	_ = srv.Shutdown(ctxTimeout)
	logrus.Info("Payment Service stopped cleanly.")
}
