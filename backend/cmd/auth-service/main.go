package main

import (
	"backend/internal/api"
	doctorhandler "backend/internal/api/doctor-handler"
	"backend/internal/api/middleware"
	nurseHandler "backend/internal/api/nurse-handler"
	patientHandler "backend/internal/api/patient-handler"
	"backend/internal/infrastructure/db"
	patientrepository "backend/internal/infrastructure/persistence/patient_repository"
	staffrepository "backend/internal/infrastructure/persistence/staff_repository"
	doctorrepository "backend/internal/infrastructure/persistence/staff_repository/doctor_repository"
	nurserepository "backend/internal/infrastructure/persistence/staff_repository/nurse_repository"
	"backend/internal/infrastructure/redis"
	"backend/internal/usecase"
	doctorusecase "backend/internal/usecase/doctor-usecase"
	nurseUsecase "backend/internal/usecase/nurse-usecase"
	patientUsecase "backend/internal/usecase/patient-usecase"
	cloudinaryutils "backend/pkg/common/utils/cloudinary_utils"
	"backend/pkg/config"
	dbinit "backend/pkg/db_init"
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
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

	rc, err := dbinit.InitRedis()
	var redisClient redis.RedisClient
	if err != nil || rc == nil {
		logrus.Warn("Redis not available for auth-service, running without token cache")
	} else {
		redisClient = *rc
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "9001"
	}

	// Repositories
	dbClient := db.DatabaseClient.GetDB()
	patientRepo := patientrepository.NewPatientRepo(dbClient)
	nurseRepo := nurserepository.NewNurseRepo(dbClient)
	doctorRepo := doctorrepository.NewDoctorRepo(dbClient)
	drugReceiptRepo := doctorrepository.NewDrugReceiptRepository(dbClient)
	adminRepo := staffrepository.NewAdminRepository(dbClient)

	// Usecases
	avatarUploader := cloudinaryutils.NewAvatarUploader()
	patientService := patientUsecase.NewPatientService(patientRepo, redisClient, avatarUploader)
	nurseService := nurseUsecase.NewNurseService(nurseRepo)
	doctorService := doctorusecase.NewDoctorUsecase(doctorRepo, drugReceiptRepo)
	adminService := usecase.NewAdminUsecase(adminRepo)

	// Handlers
	patientH := patientHandler.NewPatientHandler(patientService, nil, nil, nil)
	nurseH := nurseHandler.NewNurseHandler(nurseService, nil, redisClient)
	doctorH := doctorhandler.NewDoctorHandler(doctorService, nil)
	adminH := api.NewAdminHandler(adminService)

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.AllowCORS())

	// Probes
	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "auth-service"})
	})
	r.GET("/readyz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ready", "service": "auth-service"})
	})

	apiGroup := r.Group("/api")
	{
		apiGroup.POST("/login/patient", patientH.LoginPatient)
		apiGroup.POST("/login/nurse", nurseH.LoginNurse)
		apiGroup.POST("/login/doctor", doctorH.LoginDoctor)
		apiGroup.POST("/login/admin", adminH.LoginAdmin)
		apiGroup.POST("/register", patientH.CreatePatient)

		// V1 Routes
		v1 := apiGroup.Group("/v1/auth")
		{
			v1.POST("/login/patient", patientH.LoginPatient)
			v1.POST("/login/nurse", nurseH.LoginNurse)
			v1.POST("/login/doctor", doctorH.LoginDoctor)
			v1.POST("/login/admin", adminH.LoginAdmin)
			v1.POST("/register", patientH.CreatePatient)
			v1.GET("/profile", middleware.AuthMiddleware(), patientH.GetProfile)
		}

		adminGroup := apiGroup.Group("/admin")
		adminGroup.Use(middleware.AuthMiddleware())
		{
			adminGroup.POST("/create-patient", patientH.CreatePatient)
			adminGroup.POST("/create-nurse", nurseH.CreateNurse)
			adminGroup.POST("/create-doctor", doctorH.CreateDoctor)

			adminGroup.GET("/patients", patientH.GetPatients)
			adminGroup.PUT("/patient/:id", patientH.UpdatePatient)
			adminGroup.DELETE("/patient/:id", patientH.DeletePatient)

			adminGroup.GET("/nurses", nurseH.GetNurses)
			adminGroup.GET("/nurse/:id", nurseH.GetNurseById)
			adminGroup.DELETE("/nurse/:id", nurseH.DeleteNurse)

			adminGroup.GET("/doctors", doctorH.GetDoctors)
			adminGroup.GET("/doctor/:id", doctorH.GetDoctorById)
			adminGroup.DELETE("/doctor/:id", doctorH.DeleteDoctor)
		}

		// Patient profile
		patientGroup := apiGroup.Group("/patient")
		patientGroup.Use(middleware.AuthMiddleware())
		{
			patientGroup.GET("/profile", patientH.GetProfile)
			patientGroup.PUT("/:id", patientH.UpdatePatient)
		}

		// Nurse profile
		nurseGroup := apiGroup.Group("/nurse")
		nurseGroup.Use(middleware.AuthMiddleware())
		{
			nurseGroup.GET("/profile", nurseH.GetNurseProfile)
			nurseGroup.PUT("/:id", nurseH.UpdateNurse)
		}

		// Doctor profile & patient records
		doctorGroup := apiGroup.Group("/doctor")
		doctorGroup.Use(middleware.AuthMiddleware())
		{
			doctorGroup.GET("/profile", doctorH.GetDoctorProfile)
			doctorGroup.PUT("/:id", doctorH.UpdateDoctor)
			doctorGroup.GET("/patients", patientH.GetPatients)
			doctorGroup.GET("/patient/:id", patientH.GetPatientById)
		}
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	go func() {
		logrus.Infof("Auth Service running on port :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logrus.Fatalf("Auth Service listen error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logrus.Info("Shutting down Auth Service...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = srv.Shutdown(ctx)
	logrus.Info("Auth Service exited cleanly.")
}
