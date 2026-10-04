package main

import (
	"backend/internal/api/middleware"
	"backend/internal/domain/dto/dtodoctor"
	"backend/internal/domain/patient"
	"backend/internal/infrastructure/db"
	persistence "backend/internal/infrastructure/persistence/service_repository"
	doctorrepository "backend/internal/infrastructure/persistence/staff_repository/doctor_repository"
	doctorusecase "backend/internal/usecase/doctor_usecase"
	serviceusecase "backend/internal/usecase/service_usecase"
	"backend/pkg/app_response/response"
	"backend/pkg/config"
	"backend/pkg/constants"
	dbinit "backend/pkg/db_init"
	"context"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
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

	port := os.Getenv("PORT")
	if port == "" {
		port = "9005"
	}

	// Repositories
	receiptRepo := doctorrepository.NewDrugReceiptRepository(dbClient)
	doctorRepo := doctorrepository.NewDoctorRepo(dbClient)
	bookingRepo := persistence.NewBookingQueueRepository(dbClient)

	// Usecases
	doctorUsecase := doctorusecase.NewDoctorUsecase(doctorRepo, receiptRepo)
	bookingUsecase := serviceusecase.NewBookingQueueUsecase(bookingRepo)

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.AllowCORS())

	// Probes
	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "medical-service"})
	})
	r.GET("/readyz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ready", "service": "medical-service"})
	})

	apiGroup := r.Group("/api")
	{
		// 1. Digital Prescription Generator
		createReceiptHandler := func(c *gin.Context) {
			var req dtodoctor.CreateDrugReceiptRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
				return
			}

			if req.DrugReceiptId == uuid.Nil {
				req.DrugReceiptId = uuid.New()
			}

			err := doctorUsecase.CreateDrugReceipt(c.Request.Context(), &req)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create prescription: " + err.Error()})
				return
			}

			// Automatically update appointment booking queue status to completed or receipt created
			if req.QueueId > 0 {
				_ = bookingUsecase.UpdateBookingStatus(c.Request.Context(), req.QueueId, constants.BookingStatusCompleted)
			}

			c.JSON(http.StatusCreated, response.NewCustomSuccessResponse(http.StatusCreated, gin.H{
				"prescription_id": req.DrugReceiptId,
				"queue_id":        req.QueueId,
				"drug_name":       req.DrugName,
				"instructions":    req.UsageInstructions,
			}, "Digital prescription created successfully"))
		}

		apiGroup.POST("/doctor/create-receipt", createReceiptHandler)
		apiGroup.POST("/v1/prescriptions", createReceiptHandler)

		// 2. Clinical Consultation / General Examination Recording
		apiGroup.POST("/v1/medical/examinations", func(c *gin.Context) {
			type CreateExamRequest struct {
				PatientID      string  `json:"patient_id"`
				DoctorID       string  `json:"doctor_id"`
				QueueID        int     `json:"queue_id"`
				BloodPressure  string  `json:"blood_pressure"`
				HeartRate      int     `json:"heart_rate"`
				Temperature    float64 `json:"temperature"`
				OxygenLevel    float64 `json:"oxygen_level"`
				Weight         float64 `json:"weight"`
				Height         float64 `json:"height"`
				Diagnosis      string  `json:"diagnosis"`
				ClinicalNotes  string  `json:"clinical_notes"`
			}

			var req CreateExamRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid exam request: " + err.Error()})
				return
			}

			patientUUID, err := uuid.Parse(req.PatientID)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient UUID"})
				return
			}

			// Calculate BMI if height and weight are provided
			var bmi float64
			if req.Height > 0 && req.Weight > 0 {
				heightMeters := req.Height
				if heightMeters > 3.0 {
					heightMeters = heightMeters / 100.0 // convert cm to m
				}
				bmi = req.Weight / (heightMeters * heightMeters)
			}

			exam := &patient.GeneralExamination{
				GeneralExamID: uuid.New(),
				PatientId:     patientUUID,
				VitalSigns:    req.BloodPressure,
				Temperature:   req.Temperature,
				Weight:        req.Weight,
				Height:        req.Height,
				BMI:           bmi,
			}

			_, err = dbClient.NewInsert().Model(exam).Exec(c.Request.Context())
			if err != nil {
				logrus.Errorf("Failed to record examination: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save examination: " + err.Error()})
				return
			}

			c.JSON(http.StatusCreated, response.NewCustomSuccessResponse(http.StatusCreated, gin.H{
				"exam_id":     exam.GeneralExamID,
				"patient_id":  exam.PatientId,
				"bmi":         bmi,
				"vital_signs": exam.VitalSigns,
			}, "Clinical examination recorded"))
		})

		// 3. Get Patient Medical Records & Prescription History
		apiGroup.GET("/v1/medical/records/:patientId", func(c *gin.Context) {
			patientIDStr := c.Param("patientId")
			patientUUID, err := uuid.Parse(patientIDStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient UUID"})
				return
			}

			var exams []*patient.GeneralExamination
			_ = dbClient.NewSelect().
				Model(&exams).
				Where("patient_id = ?", patientUUID).
				Scan(c.Request.Context())

			var histories []*patient.MedicalHistory
			_ = dbClient.NewSelect().
				Model(&histories).
				Where("patient_id = ?", patientUUID).
				Scan(c.Request.Context())

			c.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, gin.H{
				"patient_id":       patientUUID,
				"examinations":     exams,
				"medical_histories": histories,
			}, "Medical records fetched"))
		})

		// 4. Printable Prescription View
		apiGroup.GET("/v1/prescriptions/:id", func(c *gin.Context) {
			receiptIDStr := c.Param("id")
			receiptUUID, err := uuid.Parse(receiptIDStr)
			if err != nil {
				// Try queue ID
				qID, qErr := strconv.Atoi(receiptIDStr)
				if qErr != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
					return
				}
				receipt := &patient.DrugReceipt{}
				err = dbClient.NewSelect().Model(receipt).Where("queue_id = ?", qID).Relation("BookingQueue").Scan(c.Request.Context())
				if err != nil {
					c.JSON(http.StatusNotFound, gin.H{"error": "Prescription not found"})
					return
				}
				c.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, receipt, "Prescription fetched"))
				return
			}

			receipt := &patient.DrugReceipt{}
			err = dbClient.NewSelect().Model(receipt).Where("drug_receipt_id = ?", receiptUUID).Relation("BookingQueue").Scan(c.Request.Context())
			if err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Prescription not found"})
				return
			}

			c.JSON(http.StatusOK, response.NewCustomSuccessResponse(http.StatusOK, receipt, "Prescription fetched"))
		})
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	go func() {
		logrus.Infof("Medical Service running on port :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logrus.Fatalf("Medical Service listen error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logrus.Info("Shutting down Medical Service...")
	ctxTimeout, cancelTimeout := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancelTimeout()
	_ = srv.Shutdown(ctxTimeout)
	logrus.Info("Medical Service stopped cleanly.")
}
