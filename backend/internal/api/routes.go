package api

import (
	doctorhandler "backend/internal/api/doctor-handler"
	"backend/internal/api/middleware"
	nurseHandler "backend/internal/api/nurse-handler"
	patientHandler "backend/internal/api/patient-handler"
	paymenthandler "backend/internal/api/payment_handler"
	servicehandler "backend/internal/api/service_handler"
	"backend/internal/infrastructure/db"
	cloudinaryutils "backend/pkg/common/utils/cloudinary_utils"

	patientrepository "backend/internal/infrastructure/persistence/patient_repository"
	persistence "backend/internal/infrastructure/persistence/service_repository"
	doctorrepository "backend/internal/infrastructure/persistence/staff_repository/doctor_repository"
	nurserepository "backend/internal/infrastructure/persistence/staff_repository/nurse_repository"
	"backend/internal/infrastructure/redis"
	doctorusecase "backend/internal/usecase/doctor-usecase"
	messagequeue "backend/internal/usecase/message_queue"
	nurseUsecase "backend/internal/usecase/nurse-usecase"
	patientUsecase "backend/internal/usecase/patient-usecase"
	paymentusecase "backend/internal/usecase/payment_usecase"
	serviceusecase "backend/internal/usecase/service_usecase"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
)

// localhost:9000/api
func SetupRoutes(r *gin.RouterGroup, e *casbin.Enforcer, rbmqUsecase messagequeue.RabbitMQUsecase, rc *redis.RedisClient) {

	messageQueueRepo := persistence.NewBookingQueueRepository(db.DatabaseClient.GetDB())
	messageQueueUsecase := serviceusecase.NewBookingQueueUsecase(messageQueueRepo)

	// nurse & message_queue
	nurseRepo := nurserepository.NewNurseRepo(db.DatabaseClient.GetDB())
	nurseService := nurseUsecase.NewNurseService(nurseRepo)
	nurseHandler := nurseHandler.NewNurseHandler(nurseService, messageQueueUsecase, *rc)

	// doctor
	doctorRepo := doctorrepository.NewDoctorRepo(db.DatabaseClient.GetDB())
	doctorService := doctorusecase.NewDoctorUsecase(doctorRepo)
	doctorHandler := doctorhandler.NewDoctorHandler(doctorService)

	// categories
	categoryRepo := persistence.NewServiceCategoryRepository(db.DatabaseClient.GetDB())
	categoryUsecase := serviceusecase.NewServiceCategoryUsecase(categoryRepo)
	categoryHandler := servicehandler.NewServiceCategoryHandler(categoryUsecase)

	// sub-categories
	subcategoryRepo := persistence.NewServiceSubCategoryRepository(db.DatabaseClient.GetDB())
	subcategoryUsecase := serviceusecase.NewServiceSubCategoryUsecase(subcategoryRepo)
	subcategoryHandler := servicehandler.NewServiceSubCategoryHandler(subcategoryUsecase)

	// service
	serviceRepo := persistence.NewServiceRepository(db.DatabaseClient.GetDB())
	serviceUsecase := serviceusecase.NewServicesUsecase(serviceRepo)
	serviceHandler := servicehandler.NewServiceHandler(serviceUsecase)

	// payment
	paymentUsecase := paymentusecase.NewPaymentMethods()
	paymentHandler := paymenthandler.NewPaymentHandler(rbmqUsecase, paymentUsecase)

	avatarUploader := cloudinaryutils.NewAvatarUploader()
	// patient
	patientRepo := patientrepository.NewPatientRepo(db.DatabaseClient.GetDB())
	patientService := patientUsecase.NewPatientService(patientRepo, *rc, avatarUploader)
	patientHandler := patientHandler.NewPatientHandler(patientService, serviceUsecase, messageQueueUsecase, paymentUsecase)

	r.POST("/login/patient", patientHandler.LoginPatient)
	r.POST("/login/nurse", nurseHandler.LoginNurse)
	r.POST("/login/doctor", doctorHandler.LoginDoctor)
	r.POST("/register", patientHandler.CreatePatient)

	adminGroup := r.Group("/admin")
	{
		adminGroup.POST("/create-patient", patientHandler.CreatePatient)
		adminGroup.POST("/create-service", serviceHandler.CreateService)
		adminGroup.POST("/create-nurse", nurseHandler.CreateNurse)
		adminGroup.POST("/create-doctor", doctorHandler.CreateDoctor)

		adminGroup.PUT("/patient/:id", patientHandler.UpdatePatient)
		adminGroup.DELETE("/patient/:id", patientHandler.DeletePatient)

		adminGroup.GET("/patients", patientHandler.GetPatients)
		adminGroup.GET("/nurses", nurseHandler.GetNurses)
		adminGroup.GET("/nurse/:id", nurseHandler.GetNurseById)
		adminGroup.DELETE("/nurse/:id", nurseHandler.DeleteNurse)

		adminGroup.GET("/doctors", doctorHandler.GetDoctors)
		adminGroup.GET("/doctor/:id", doctorHandler.GetDoctorById)
		adminGroup.DELETE("/doctor/:id", doctorHandler.DeleteDoctor)
	}

	paymentGroup := r.Group("/payment")
	{
		paymentGroup.POST("/webhook", paymentHandler.HandleWebHook)
	}

	// localhost:9000/api/patient
	patientGroup := r.Group("/patient")
	patientGroup.Use(middleware.AuthMiddleware())
	{

		patientGroup.GET("/profile", patientHandler.GetProfile)
		patientGroup.PUT("/:id", patientHandler.UpdatePatient)

		patientGroup.GET("/history_booking", patientHandler.GetBookingQueuesByPatientId)
		patientGroup.POST("/register-service/:serviceId", patientHandler.PatientRegisterService)

		patientGroup.GET("/service/categories", categoryHandler.GetAllCategories)
		patientGroup.GET("/service/category", categoryHandler.GetCategoryById)
		patientGroup.GET("/service/subcategories", subcategoryHandler.GetAllSubCategoriesByCategoryId)
		patientGroup.GET("/service/subcategory", subcategoryHandler.GetSubcategoryById)
		patientGroup.GET("/services", serviceHandler.GetServiceBySubcategoryId)
	}

	// localhost:9000/api/nurse
	nurseGroup := r.Group("/nurse")
	nurseGroup.Use(middleware.AuthMiddleware())
	{
		nurseGroup.GET("/profile", nurseHandler.GetNurseProfile)
		nurseGroup.PUT("/:id", nurseHandler.UpdateNurse)
		nurseGroup.GET("/queues", nurseHandler.GetAllBookingQueues)
		nurseGroup.DELETE("/mark_complete", nurseHandler.MarkCompleteQueue)
	}

	// localhost:9000/api/doctor
	doctorGroup := r.Group("/doctor")
	doctorGroup.Use(middleware.AuthMiddleware())
	{
		doctorGroup.GET("/patients", patientHandler.GetPatients)
		doctorGroup.GET("/profile", doctorHandler.GetDoctorProfile)
		doctorGroup.PUT("/:id", doctorHandler.UpdateDoctor)
		doctorGroup.GET("/patient/:id", patientHandler.GetPatientById)
		doctorGroup.GET("/queues", nurseHandler.GetAllBookingQueues)
	}
}
