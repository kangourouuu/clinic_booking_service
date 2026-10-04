package main

import (
	"backend/internal/api/middleware"
	servicehandler "backend/internal/api/service_handler"
	"backend/internal/infrastructure/db"
	persistence "backend/internal/infrastructure/persistence/service_repository"
	serviceusecase "backend/internal/usecase/service_usecase"
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

	port := os.Getenv("PORT")
	if port == "" {
		port = "9002"
	}

	dbClient := db.DatabaseClient.GetDB()

	// Seed catalog if empty
	_ = dbinit.SeedDataBase(context.Background(), dbClient)

	// Repositories
	categoryRepo := persistence.NewServiceCategoryRepository(dbClient)
	subcategoryRepo := persistence.NewServiceSubCategoryRepository(dbClient)
	serviceRepo := persistence.NewServiceRepository(dbClient)

	// Usecases
	categoryUsecase := serviceusecase.NewServiceCategoryUsecase(categoryRepo)
	subcategoryUsecase := serviceusecase.NewServiceSubCategoryUsecase(subcategoryRepo)
	serviceUsecase := serviceusecase.NewServicesUsecase(serviceRepo)

	// Handlers
	categoryH := servicehandler.NewServiceCategoryHandler(categoryUsecase)
	subcategoryH := servicehandler.NewServiceSubCategoryHandler(subcategoryUsecase)
	serviceH := servicehandler.NewServiceHandler(serviceUsecase)

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.AllowCORS())

	// Health probes
	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "catalog-service"})
	})
	r.GET("/readyz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ready", "service": "catalog-service"})
	})

	apiGroup := r.Group("/api")
	{
		// V1 Routes
		v1 := apiGroup.Group("/v1/catalog")
		{
			v1.GET("/categories", categoryH.GetAllCategories)
			v1.GET("/category", categoryH.GetCategoryById)
			v1.GET("/subcategories", subcategoryH.GetAllSubCategoriesByCategoryId)
			v1.GET("/subcategory", subcategoryH.GetSubcategoryById)
			v1.GET("/services", serviceH.GetServiceBySubcategoryId)
			v1.POST("/services", middleware.AuthMiddleware(), serviceH.CreateService)
		}

		// Legacy / Patient route mapping
		patientServiceGroup := apiGroup.Group("/patient/service")
		{
			patientServiceGroup.GET("/categories", categoryH.GetAllCategories)
			patientServiceGroup.GET("/category", categoryH.GetCategoryById)
			patientServiceGroup.GET("/subcategories", subcategoryH.GetAllSubCategoriesByCategoryId)
			patientServiceGroup.GET("/subcategory", subcategoryH.GetSubcategoryById)
		}
		apiGroup.GET("/patient/services", serviceH.GetServiceBySubcategoryId)

		// Admin create service
		adminGroup := apiGroup.Group("/admin")
		adminGroup.Use(middleware.AuthMiddleware())
		{
			adminGroup.POST("/create-service", serviceH.CreateService)
		}
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	go func() {
		logrus.Infof("Catalog Service running on port :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logrus.Fatalf("Catalog Service listen error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logrus.Info("Shutting down Catalog Service...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = srv.Shutdown(ctx)
	logrus.Info("Catalog Service exited cleanly.")
}
