package main

import (
	dtoqueue "backend/internal/domain/dto/queue"
	"backend/internal/domain/patient"
	"backend/internal/infrastructure/db"
	persistence "backend/internal/infrastructure/persistence/service_repository"
	"backend/internal/infrastructure/redis"
	messagequeue "backend/internal/usecase/message_queue"
	serviceusecase "backend/internal/usecase/service_usecase"
	"backend/pkg/app_response/response"
	"backend/pkg/common/pagination"
	"backend/pkg/config"
	"backend/pkg/constants"
	dbinit "backend/pkg/db_init"
	"backend/pkg/distributed_lock"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"sync"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// Hub manages active WebSocket clients
type Hub struct {
	clients    map[*websocket.Conn]bool
	broadcast  chan []byte
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	mu         sync.Mutex
}

func newHub() *Hub {
	return &Hub{
		clients:    make(map[*websocket.Conn]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
	}
}

func (h *Hub) run() {
	for {
		select {
		case conn := <-h.register:
			h.mu.Lock()
			h.clients[conn] = true
			h.mu.Unlock()
		case conn := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[conn]; ok {
				delete(h.clients, conn)
				_ = conn.Close()
			}
			h.mu.Unlock()
		case message := <-h.broadcast:
			h.mu.Lock()
			for conn := range h.clients {
				err := conn.WriteMessage(websocket.TextMessage, message)
				if err != nil {
					_ = conn.Close()
					delete(h.clients, conn)
				}
			}
			h.mu.Unlock()
		}
	}
}

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

	rc, err := dbinit.InitRedis()
	var redisClient redis.RedisClient
	if err != nil || rc == nil {
		logrus.Warn("Redis connection not available, running without cache/pubsub")
	} else {
		redisClient = *rc
	}

	rabbitMQClient, err := dbinit.InitRabbitMQ()
	if err != nil {
		logrus.Warn("RabbitMQ connection not available: ", err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "9003"
	}

	bookingRepo := persistence.NewBookingQueueRepository(dbClient)
	bookingUsecase := serviceusecase.NewBookingQueueUsecase(bookingRepo)
	locker := distributed_lock.NewRedisLocker(redisClient.Client)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Initialize RabbitMQ usecase & Start hardened consumer
	var msgUsecase messagequeue.RabbitMQUsecase
	if rabbitMQClient != nil {
		msgUsecase = messagequeue.NewRabbitMQUsecase(rabbitMQClient, bookingRepo, redisClient)
		_ = msgUsecase.SetupInfrastructure(ctx)

		go func() {
			err := msgUsecase.StartBookingConsumer(ctx)
			if err != nil {
				logrus.Errorf("Booking consumer error: %v", err)
			}
		}()
	}

	// WebSocket Hub
	hub := newHub()
	go hub.run()

	// Subscribe to Redis pub/sub queue updates
	if redisClient.Client != nil {
		go func() {
			pubsub := redisClient.Client.Subscribe(ctx, constants.CHANNEL_REDIS)
			ch := pubsub.Channel()
			for msg := range ch {
				logrus.Infof("Redis event received on %s: %s", constants.CHANNEL_REDIS, msg.Payload)
				// Fetch current queues and broadcast to all connected WebSocket clients
				pag := &pagination.Pagination{Page: 1, PageSize: 50}
				queues, err := bookingUsecase.GetBookingQueues(context.Background(), pag)
				if err == nil {
					payload, _ := json.Marshal(gin.H{
						"type": "queue_updated",
						"data": queues,
					})
					hub.broadcast <- payload
				}
			}
		}()
	}

	r := gin.New()
	r.Use(gin.Recovery())

	// Probes
	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "booking-service"})
	})
	r.GET("/readyz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ready", "service": "booking-service"})
	})

	// WebSocket handler helper
	handleWebSocket := func(c *gin.Context) {
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			logrus.Errorf("WebSocket upgrade failed: %v", err)
			return
		}

		hub.register <- conn
		defer func() {
			hub.unregister <- conn
		}()

		// Send initial queue list on connect
		pag := &pagination.Pagination{Page: 1, PageSize: 50}
		queues, err := bookingUsecase.GetBookingQueues(c.Request.Context(), pag)
		if err == nil {
			initialData, _ := json.Marshal(gin.H{
				"type": "queue_list",
				"data": queues,
			})
			_ = conn.WriteMessage(websocket.TextMessage, initialData)
		}

		for {
			_, msgBytes, err := conn.ReadMessage()
			if err != nil {
				break
			}

			var req map[string]interface{}
			if err := json.Unmarshal(msgBytes, &req); err == nil {
				if req["type"] == "get_queues" {
					qList, _ := bookingUsecase.GetBookingQueues(c.Request.Context(), pag)
					respBytes, _ := json.Marshal(gin.H{
						"type": "queue_list",
						"data": qList,
					})
					_ = conn.WriteMessage(websocket.TextMessage, respBytes)
				}
			}
		}
	}

	// WebSocket Endpoints
	r.GET("/ws/queues", handleWebSocket)
	r.GET("/api/nurse/queues", handleWebSocket)
	r.GET("/api/doctor/queues", handleWebSocket)

	apiGroup := r.Group("/api")
	{
		// 1. Create Appointment / Register Service (Protected by Redis Distributed Lock)
		createBookingHandler := func(c *gin.Context) {
			type CreateBookingRequest struct {
				PatientID       string    `json:"patient_id"`
				PatientName     string    `json:"patient_name"`
				PatientEmail    string    `json:"patient_email"`
				PatientPhone    string    `json:"patient_phone"`
				ServiceID       string    `json:"service_id"`
				ServiceName     string    `json:"service_name"`
				ServiceCode     string    `json:"service_code"`
				ServiceCost     float64   `json:"service_cost"`
				DoctorID        string    `json:"doctor_id"`
				DoctorName      string    `json:"doctor_name"`
				AppointmentDate time.Time `json:"appointment_date"`
				TimeSlot        string    `json:"time_slot"`
				Notes           string    `json:"notes"`
			}

			var req CreateBookingRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
				return
			}

			// Fallback user ID from gateway header if not provided in body
			if req.PatientID == "" {
				req.PatientID = c.GetHeader(constants.HeaderUserID)
			}
			patientUUID, err := uuid.Parse(req.PatientID)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient UUID format"})
				return
			}

			// Layer 1: Distributed Lock on Slot (Fast-fail anti-race check)
			lockKey := fmt.Sprintf("slot:%s:%s:%s", req.DoctorID, req.AppointmentDate.Format("2006-01-02"), req.TimeSlot)
			lockToken, acquired, err := locker.Acquire(c.Request.Context(), lockKey, 15*time.Second)
			if err != nil || !acquired {
				c.JSON(http.StatusConflict, gin.H{"error": "This appointment slot is currently being booked by another user. Please choose another slot."})
				return
			}
			defer func() {
				_ = locker.Release(context.Background(), lockKey, lockToken)
			}()

			var docUUID *uuid.UUID
			if req.DoctorID != "" {
				if d, err := uuid.Parse(req.DoctorID); err == nil {
					docUUID = &d
				}
			}

			// Generate Queue Number (e.g. A-101)
			queueNumber := fmt.Sprintf("A-%d", time.Now().Unix()%900+100)

			bq := &patient.BookingQueue{
				PatientId:          patientUUID,
				PatientName:        req.PatientName,
				PatientEmail:       req.PatientEmail,
				PatientPhoneNumber: req.PatientPhone,
				ServiceId:          req.ServiceID,
				ServiceName:        req.ServiceName,
				ServiceCode:        req.ServiceCode,
				ServiceCost:        req.ServiceCost,
				DoctorId:           docUUID,
				DoctorName:         req.DoctorName,
				TimeSlot:           req.TimeSlot,
				QueueNumber:        queueNumber,
				RoomNumber:         "Room 101",
				Notes:              req.Notes,
				PaymentStatus:      patient.PaymentStatus(constants.PaymentStatusPending),
				BookingStatus:      patient.BookingStatus(constants.BookingStatusPendingPayment),
				AppointmentDate:    req.AppointmentDate,
				CreatedAt:          time.Now(),
			}

			// Layer 2: PostgreSQL Partial Unique Constraint
			if err := bookingRepo.Create(c.Request.Context(), bq); err != nil {
				c.JSON(http.StatusConflict, gin.H{"error": "Slot already reserved or booking conflict: " + err.Error()})
				return
			}

			// Publish queue update event
			if redisClient.Client != nil {
				_ = redisClient.Publish(c.Request.Context(), constants.CHANNEL_REDIS, "created")
			}

			c.JSON(http.StatusCreated, response.NewCustomSuccessResponse(http.StatusCreated, bq, "Booking created successfully"))
		}

		apiGroup.POST("/v1/bookings", createBookingHandler)
		apiGroup.POST("/patient/register-service/:serviceId", createBookingHandler)

		// 2. Booking History
		apiGroup.GET("/v1/bookings/history", func(c *gin.Context) {
			patientIDStr := c.Query("patient_id")
			if patientIDStr == "" {
				patientIDStr = c.GetHeader(constants.HeaderUserID)
			}
			pUUID, err := uuid.Parse(patientIDStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
				return
			}

			page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
			pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
			pag := &pagination.Pagination{Page: page, PageSize: pageSize}

			list, err := bookingUsecase.GetHistoryQueuesByPatientId(c.Request.Context(), pag, pUUID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, list, "History retrieved"))
		})
		apiGroup.GET("/patient/history_booking", func(c *gin.Context) {
			patientIDStr := c.GetHeader(constants.HeaderUserID)
			pUUID, err := uuid.Parse(patientIDStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
				return
			}
			page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
			pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
			pag := &pagination.Pagination{Page: page, PageSize: pageSize}

			list, err := bookingUsecase.GetHistoryQueuesByPatientId(c.Request.Context(), pag, pUUID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, list, "History retrieved"))
		})

		// 3. Detail Booking
		apiGroup.GET("/patient/detail_booking", func(c *gin.Context) {
			queueID, err := strconv.Atoi(c.Query("queueId"))
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid queue ID"})
				return
			}
			detail, err := bookingUsecase.GetDetailsBookingByQueueId(c.Request.Context(), queueID)
			if err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
				return
			}
			c.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, detail, "Booking details retrieved"))
		})

		// 4. Mark complete queue (for nurse/doctor)
		markCompleteHandler := func(c *gin.Context) {
			queueIDStr := c.Query("queueId")
			if queueIDStr == "" {
				queueIDStr = c.Param("id")
			}
			queueID, err := strconv.Atoi(queueIDStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid queue ID"})
				return
			}

			err = bookingUsecase.UpdateBookingStatus(c.Request.Context(), queueID, constants.BookingStatusCompleted)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			// Broadcast update
			if redisClient.Client != nil {
				_ = redisClient.Publish(c.Request.Context(), constants.CHANNEL_REDIS, "completed")
			}

			c.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, gin.H{"queue_id": queueID}, "Queue marked completed"))
		}

		apiGroup.DELETE("/nurse/mark_complete", markCompleteHandler)
		apiGroup.DELETE("/v1/queues/:id/complete", markCompleteHandler)

		// 5. Lobby Queue Board Endpoint (for TV display & mobile patient queue tracker)
		apiGroup.GET("/v1/queues/board", func(c *gin.Context) {
			pag := &pagination.Pagination{Page: 1, PageSize: 50}
			queues, err := bookingUsecase.GetBookingQueues(c.Request.Context(), pag)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			var nowServing *dtoqueue.BookingQueueResponse
			var upNext []*dtoqueue.BookingQueueResponse
			var completed []*dtoqueue.BookingQueueResponse

			for _, q := range queues {
				if q.BookingStatus == constants.BookingStatusInProgress {
					if nowServing == nil {
						nowServing = q
					} else {
						upNext = append(upNext, q)
					}
				} else if q.BookingStatus == constants.BookingStatusWaiting || q.BookingStatus == string(patient.BookingStatusWaiting) {
					upNext = append(upNext, q)
				} else if q.BookingStatus == constants.BookingStatusCompleted || q.BookingStatus == string(patient.BookingStatusCompleted) {
					if len(completed) < 5 {
						completed = append(completed, q)
					}
				}
			}

			c.JSON(http.StatusOK, gin.H{
				"now_serving": nowServing,
				"up_next":     upNext,
				"completed":   completed,
				"total_in_queue": len(queues),
				"timestamp":   time.Now().Format(time.RFC3339),
			})
		})
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	go func() {
		logrus.Infof("Booking Service running on port :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logrus.Fatalf("Booking Service listen error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logrus.Info("Shutting down Booking Service...")
	ctxTimeout, cancelTimeout := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancelTimeout()
	_ = srv.Shutdown(ctxTimeout)
	logrus.Info("Booking Service stopped cleanly.")
}
