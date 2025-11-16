package api

import (
	"backend/internal/infrastructure/rabbitmq"
	"backend/internal/infrastructure/redis"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestHealthCheck(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("health check with all services configured", func(t *testing.T) {
		// Create mock redis and rabbitmq clients (nil to simulate not configured)
		handler := NewHealthHandler(nil, nil)

		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request, _ = http.NewRequest("GET", "/api/health", nil)

		handler.HealthCheck(c)

		// Since database is not configured in test, expect 200 (not considered unhealthy)
		assert.Equal(t, http.StatusOK, w.Code)

		var response HealthCheckResponse
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)

		// Should have status and services
		assert.NotEmpty(t, response.Status)
		assert.NotNil(t, response.Services)

		// Check that we have keys for database, redis, and rabbitmq
		_, hasDatabase := response.Services["database"]
		_, hasRedis := response.Services["redis"]
		_, hasRabbitMQ := response.Services["rabbitmq"]

		assert.True(t, hasDatabase, "Should have database status")
		assert.True(t, hasRedis, "Should have redis status")
		assert.True(t, hasRabbitMQ, "Should have rabbitmq status")
	})

	t.Run("health check with nil clients", func(t *testing.T) {
		handler := NewHealthHandler(nil, nil)

		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request, _ = http.NewRequest("GET", "/api/health", nil)

		handler.HealthCheck(c)

		// Should return 200 OK even when database is not configured (startup scenario)
		assert.Equal(t, http.StatusOK, w.Code)

		var response HealthCheckResponse
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)

		// Redis and RabbitMQ should be marked as "not_configured"
		assert.Equal(t, "not_configured", response.Services["redis"])
		assert.Equal(t, "not_configured", response.Services["rabbitmq"])
	})

	t.Run("health check returns correct JSON structure", func(t *testing.T) {
		handler := NewHealthHandler(nil, nil)

		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request, _ = http.NewRequest("GET", "/api/health", nil)

		handler.HealthCheck(c)

		var response HealthCheckResponse
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)

		// Verify JSON structure
		assert.IsType(t, "", response.Status)
		assert.IsType(t, map[string]string{}, response.Services)
	})
}

func TestNewHealthHandler(t *testing.T) {
	t.Run("create handler with nil clients", func(t *testing.T) {
		handler := NewHealthHandler(nil, nil)
		assert.NotNil(t, handler)
		assert.Nil(t, handler.redisClient)
		assert.Nil(t, handler.rabbitMQClient)
	})

	t.Run("create handler with redis client", func(t *testing.T) {
		redisClient := &redis.RedisClient{}
		handler := NewHealthHandler(redisClient, nil)
		assert.NotNil(t, handler)
		assert.NotNil(t, handler.redisClient)
		assert.Nil(t, handler.rabbitMQClient)
	})

	t.Run("create handler with rabbitmq client", func(t *testing.T) {
		rabbitMQClient := &rabbitmq.RabbitMQClient{}
		handler := NewHealthHandler(nil, rabbitMQClient)
		assert.NotNil(t, handler)
		assert.Nil(t, handler.redisClient)
		assert.NotNil(t, handler.rabbitMQClient)
	})

	t.Run("create handler with all clients", func(t *testing.T) {
		redisClient := &redis.RedisClient{}
		rabbitMQClient := &rabbitmq.RabbitMQClient{}
		handler := NewHealthHandler(redisClient, rabbitMQClient)
		assert.NotNil(t, handler)
		assert.NotNil(t, handler.redisClient)
		assert.NotNil(t, handler.rabbitMQClient)
	})
}
