package services

import (
	"backend/internal/infrastructure/db"
	persistence "backend/internal/infrastructure/persistence/service-repository"
	"backend/internal/infrastructure/rabbitmq"
	"backend/internal/infrastructure/redis"
	messagequeue "backend/internal/usecase/message_queue"
	"sync"
)

// ServiceLocator manages shared instances
type ServiceLocator struct {
	rabbitMQUsecase messagequeue.RabbitMQUsecase
	once            sync.Once
}

var instance *ServiceLocator
var once sync.Once

// GetInstance returns singleton ServiceLocator
func GetInstance() *ServiceLocator {
	once.Do(func() {
		instance = &ServiceLocator{}
	})
	return instance
}

// InitializeRabbitMQUsecase initializes the shared RabbitMQ UseCase
func (sl *ServiceLocator) InitializeRabbitMQUsecase(rabbitMQClient *rabbitmq.RabbitMQClient, redisClient *redis.RedisClient) {
	sl.once.Do(func() {
		bookingQueueRepo := persistence.NewBookingQueueRepository(db.DatabaseClient.GetDB())
		sl.rabbitMQUsecase = messagequeue.NewRabbitMQUsecase(
			rabbitMQClient,
			bookingQueueRepo,
			*redisClient,
		)
	})
}

// GetRabbitMQUsecase returns the shared RabbitMQ UseCase instance
func (sl *ServiceLocator) GetRabbitMQUsecase() messagequeue.RabbitMQUsecase {
	return sl.rabbitMQUsecase
}
