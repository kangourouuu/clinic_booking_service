package main

import (
	"backend/internal/api/middleware"
	"backend/pkg/constants"
	"context"
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

type GatewayConfig struct {
	Port              string
	AuthServiceURL    string
	CatalogServiceURL string
	BookingServiceURL string
	PaymentServiceURL string
	MedicalServiceURL string
	FrontendDir       string
}

func loadConfig() GatewayConfig {
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	authURL := os.Getenv("AUTH_SERVICE_URL")
	if authURL == "" {
		authURL = "http://localhost:9001"
	}

	catalogURL := os.Getenv("CATALOG_SERVICE_URL")
	if catalogURL == "" {
		catalogURL = "http://localhost:9002"
	}

	bookingURL := os.Getenv("BOOKING_SERVICE_URL")
	if bookingURL == "" {
		bookingURL = "http://localhost:9003"
	}

	paymentURL := os.Getenv("PAYMENT_SERVICE_URL")
	if paymentURL == "" {
		paymentURL = "http://localhost:9004"
	}

	medicalURL := os.Getenv("MEDICAL_SERVICE_URL")
	if medicalURL == "" {
		medicalURL = "http://localhost:9005"
	}

	frontendDir := os.Getenv("FRONTEND_STATIC_DIR")
	if frontendDir == "" {
		// Default to relative frontend/dist
		frontendDir = "../frontend/dist"
	}

	return GatewayConfig{
		Port:              port,
		AuthServiceURL:    authURL,
		CatalogServiceURL: catalogURL,
		BookingServiceURL: bookingURL,
		PaymentServiceURL: paymentURL,
		MedicalServiceURL: medicalURL,
		FrontendDir:       frontendDir,
	}
}

// createReverseProxy creates a reverse proxy forwarding requests to the target microservice
func createReverseProxy(targetURLStr string) (*httputil.ReverseProxy, error) {
	target, err := url.Parse(targetURLStr)
	if err != nil {
		return nil, err
	}

	proxy := httputil.NewSingleHostReverseProxy(target)

	originalDirector := proxy.Director
	proxy.Director = func(req *http.Request) {
		originalDirector(req)
		req.Host = target.Host
	}

	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		logrus.Errorf("Proxy error connecting to %s (%s): %v", targetURLStr, r.URL.Path, err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadGateway)
		_, _ = w.Write([]byte(fmt.Sprintf(`{"error":"Service unavailable at %s: %s"}`, targetURLStr, err.Error())))
	}

	return proxy, nil
}

// proxyHandler wraps httputil.ReverseProxy for Gin
func proxyHandler(proxy *httputil.ReverseProxy) gin.HandlerFunc {
	return func(c *gin.Context) {
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}

// tracingAndAuthMiddleware adds request tracing and propagates verified user claims to downstream services
func tracingAndAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		reqID := c.GetHeader(constants.HeaderRequestID)
		if reqID == "" {
			reqID = uuid.NewString()
			c.Request.Header.Set(constants.HeaderRequestID, reqID)
		}
		c.Writer.Header().Set(constants.HeaderRequestID, reqID)

		// Check if request has JWT token in header or cookie
		tokenString := ""
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			if strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
				tokenString = strings.TrimSpace(authHeader[7:])
			} else {
				tokenString = strings.TrimSpace(authHeader)
			}
		}
		if tokenString == "" {
			if cookie, err := c.Cookie("clinic_token"); err == nil && cookie != "" {
				tokenString = cookie
			}
		}

		if tokenString != "" {
			claims, err := middleware.ValidateToken(tokenString)
			if err == nil && claims != nil {
				if sub, ok := (*claims)["sub"].(string); ok {
					c.Request.Header.Set(constants.HeaderUserID, sub)
				}
				if role, ok := (*claims)["role"].(string); ok {
					c.Request.Header.Set(constants.HeaderUserRole, role)
				}
			}
		}

		c.Next()
	}
}

func main() {
	cfg := loadConfig()

	logrus.SetFormatter(&logrus.JSONFormatter{})
	logrus.Infof("Starting Clinic API Gateway on port :%s", cfg.Port)
	logrus.Infof("Auth Service: %s | Catalog: %s | Booking: %s | Payment: %s | Medical: %s",
		cfg.AuthServiceURL, cfg.CatalogServiceURL, cfg.BookingServiceURL, cfg.PaymentServiceURL, cfg.MedicalServiceURL)

	authProxy, err := createReverseProxy(cfg.AuthServiceURL)
	if err != nil {
		logrus.Fatalf("Failed to initialize auth proxy: %v", err)
	}

	catalogProxy, err := createReverseProxy(cfg.CatalogServiceURL)
	if err != nil {
		logrus.Fatalf("Failed to initialize catalog proxy: %v", err)
	}

	bookingProxy, err := createReverseProxy(cfg.BookingServiceURL)
	if err != nil {
		logrus.Fatalf("Failed to initialize booking proxy: %v", err)
	}

	paymentProxy, err := createReverseProxy(cfg.PaymentServiceURL)
	if err != nil {
		logrus.Fatalf("Failed to initialize payment proxy: %v", err)
	}

	medicalProxy, err := createReverseProxy(cfg.MedicalServiceURL)
	if err != nil {
		logrus.Fatalf("Failed to initialize medical proxy: %v", err)
	}

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.AllowCORS())
	r.Use(tracingAndAuthMiddleware())

	// Liveness & Readiness Probes
	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "api-gateway"})
	})
	r.GET("/readyz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ready", "service": "api-gateway"})
	})

	// 1. WebSocket Proxy for Live Queue Broadcasting
	r.Any("/ws/*path", proxyHandler(bookingProxy))

	// 2. Authentication & User Management Routes
	authRoutes := []string{
		"/api/v1/auth/*path",
		"/api/v1/staff/*path",
		"/api/v1/admin/*path",
		"/api/login/*path",
		"/api/register",
		"/api/admin/*path",
	}
	for _, route := range authRoutes {
		r.Any(route, proxyHandler(authProxy))
	}

	// 3. Service Catalog & Categories Routes
	catalogRoutes := []string{
		"/api/v1/catalog/*path",
		"/api/v1/services/*path",
		"/api/v1/categories/*path",
		"/api/services/*path",
		"/api/patient/service/*path",
		"/api/patient/services",
	}
	for _, route := range catalogRoutes {
		r.Any(route, proxyHandler(catalogProxy))
	}

	// 4. Booking & Queue Management Routes
	bookingRoutes := []string{
		"/api/v1/bookings/*path",
		"/api/v1/queues/*path",
		"/api/patient/history_booking",
		"/api/patient/detail_booking",
		"/api/patient/register-service/*path",
		"/api/nurse/queues",
		"/api/nurse/mark_complete",
		"/api/doctor/queues",
	}
	for _, route := range bookingRoutes {
		r.Any(route, proxyHandler(bookingProxy))
	}

	// 5. Payment Routes
	paymentRoutes := []string{
		"/api/v1/payments/*path",
		"/api/payment/*path",
	}
	for _, route := range paymentRoutes {
		r.Any(route, proxyHandler(paymentProxy))
	}

	// 6. Medical Records, Examinations & Prescriptions Routes
	medicalRoutes := []string{
		"/api/v1/medical/*path",
		"/api/v1/prescriptions/*path",
		"/api/doctor/create-receipt",
		"/api/doctor/patient/*path",
	}
	for _, route := range medicalRoutes {
		r.Any(route, proxyHandler(medicalProxy))
	}

	// 7. General Profile & Staff management fallback to auth
	profileRoutes := []string{
		"/api/patient/profile",
		"/api/patient/:id",
		"/api/doctor/profile",
		"/api/doctor/:id",
		"/api/nurse/profile",
		"/api/nurse/:id",
		"/api/health",
	}
	for _, route := range profileRoutes {
		r.Any(route, proxyHandler(authProxy))
	}

	// 8. Static Frontend Single Page Application (SPA) Serving
	// If frontend dist directory exists, serve static assets and fallback to index.html
	if _, err := os.Stat(cfg.FrontendDir); err == nil {
		logrus.Infof("Serving frontend static assets from %s", cfg.FrontendDir)
		r.NoRoute(func(c *gin.Context) {
			path := c.Request.URL.Path

			// Don't serve HTML on unhandled /api calls
			if strings.HasPrefix(path, "/api") {
				c.JSON(http.StatusNotFound, gin.H{"error": "Endpoint not found"})
				return
			}

			targetFile := filepath.Join(cfg.FrontendDir, filepath.Clean(path))
			if info, err := os.Stat(targetFile); err == nil && !info.IsDir() {
				c.File(targetFile)
				return
			}

			// SPA Fallback: serve index.html
			c.File(filepath.Join(cfg.FrontendDir, "index.html"))
		})
	} else {
		logrus.Warnf("Frontend directory %s not found. Static file serving disabled.", cfg.FrontendDir)
		r.NoRoute(func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"service": "Clinic Booking Service API Gateway",
				"version": "2.0.0",
				"message": "Welcome to the Clinic Booking Service Microservices API Gateway",
			})
		})
	}

	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: r,
	}

	// Graceful shutdown
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logrus.Fatalf("API Gateway listen error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logrus.Info("Shutting down API Gateway...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		logrus.Errorf("API Gateway forced shutdown: %v", err)
	}
	logrus.Info("API Gateway stopped gracefully.")
}
