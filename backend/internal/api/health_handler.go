package api

import (
	"backend/internal/infrastructure/db"
	"backend/internal/infrastructure/rabbitmq"
	"backend/internal/infrastructure/redis"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type HealthHandler struct {
	redisClient    *redis.RedisClient
	rabbitMQClient *rabbitmq.RabbitMQClient
}

func NewHealthHandler(redisClient *redis.RedisClient, rabbitMQClient *rabbitmq.RabbitMQClient) *HealthHandler {
	return &HealthHandler{
		redisClient:    redisClient,
		rabbitMQClient: rabbitMQClient,
	}
}

type HealthCheckResponse struct {
	Status   string            `json:"status"`
	Services map[string]string `json:"services"`
}

func (h *HealthHandler) HealthCheck(ctx *gin.Context) {
	healthStatus := HealthCheckResponse{
		Status:   "healthy",
		Services: make(map[string]string),
	}

	// Check database
	dbStatus := "healthy"
	if db.DatabaseClient != nil && db.DatabaseClient.GetDB() != nil {
		dbCtx, dbCancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer dbCancel()

		if err := db.DatabaseClient.GetDB().PingContext(dbCtx); err != nil {
			dbStatus = "unhealthy"
			healthStatus.Status = "degraded"
		}
	} else {
		dbStatus = "not_configured"
	}
	healthStatus.Services["database"] = dbStatus

	// Check Redis (optional)
	redisStatus := "not_configured"
	if h.redisClient != nil && h.redisClient.Client != nil {
		redisCtx, redisCancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer redisCancel()

		if err := h.redisClient.Ping(redisCtx); err != nil {
			redisStatus = "unhealthy"
			// Redis is optional, don't mark overall status as degraded
		} else {
			redisStatus = "healthy"
		}
	}
	healthStatus.Services["redis"] = redisStatus

	// Check RabbitMQ (optional)
	rabbitMQStatus := "not_configured"
	if h.rabbitMQClient != nil && h.rabbitMQClient.Connection != nil {
		if h.rabbitMQClient.Connection.IsClosed() {
			rabbitMQStatus = "unhealthy"
			// RabbitMQ is optional, don't mark overall status as degraded
		} else {
			rabbitMQStatus = "healthy"
		}
	}
	healthStatus.Services["rabbitmq"] = rabbitMQStatus

	// Return 200 OK even if some optional services are down
	// Only return non-200 if critical services (database) are actively unhealthy
	// Return 200 if database is not configured (during startup/initialization)
	statusCode := http.StatusOK
	if dbStatus == "unhealthy" {
		statusCode = http.StatusServiceUnavailable
		healthStatus.Status = "unhealthy"
	}

	ctx.JSON(statusCode, healthStatus)
}
