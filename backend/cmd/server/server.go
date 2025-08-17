package server

import (
	"backend/internal/api/middleware"
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

const (
	serviceName = "clinic-management"
	version     = "0.0.0.1"
)

type Server struct {
	httpServer *http.Server
}

func New(port string, router *gin.Engine) *Server {
	return &Server{
		httpServer: &http.Server{
			Addr:    ":" + port,
			Handler: router,
		},
	}
}

func serviceHandler() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.String(http.StatusOK, "Service: %s\nVersion: %s", serviceName, version)
	}
}

func NewEngine() *gin.Engine {
	engine := gin.Default()

	// Add global CORS middleware only
	engine.Use(middleware.AllowCORS())
	// Remove global AuthMiddleware - will be applied selectively in routes

	engine.GET("/service", serviceHandler())

	return engine
}

func (s *Server) Run() error {
	go func() {
		logrus.Infof("Service %s is listening on port %s", serviceName, s.httpServer.Addr)
		if err := s.httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// gracefully shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logrus.Infof("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	if err := s.httpServer.Shutdown(ctx); err != nil {
		logrus.Errorf("Service %s forced to shutdown", serviceName)
	}
	defer cancel()

	logrus.Infof("Service %s has been shutdown", serviceName)
	return nil
}

