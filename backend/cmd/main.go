package main

import (
	"backend/cmd/server"
	"backend/internal/api"
	"backend/internal/infrastructure/db"
	persistence "backend/internal/infrastructure/persistence/service_repository"
	"backend/internal/infrastructure/rabbitmq"
	"backend/internal/infrastructure/redis"
	messagequeue "backend/internal/usecase/message_queue"
	casbinusage "backend/pkg/casbin"
	"backend/pkg/config"
	dbinit "backend/pkg/db_init"
	"context"

	"github.com/casbin/casbin/v2"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

var (
	enforcer       *casbin.Enforcer
	rabbitMQClient *rabbitmq.RabbitMQClient
	redisClient    *redis.RedisClient
)

func init() {
	if err := godotenv.Load(); err != nil {
		logrus.Warn("No .env file found, using system environment variables")
	}

	if err := config.InitConfig(); err != nil {
		logrus.Fatal("Failed to init config", err)
	}

	if err := dbinit.InitDatabase(); err != nil {
		logrus.Fatal("Failed to init database", err)
	} else {
		if err := dbinit.SeedDataBase(context.Background(), db.DatabaseClient.GetDB()); err != nil {
			logrus.Error(err)
		}
	}

	rc, err := dbinit.InitRedis()
	if err != nil {
		logrus.Warnf("Redis connection not available, skipping token caching. Error: %v", err)
		redisClient = nil
	} else {
		redisClient = rc
		logrus.Info("Redis connected successfully")
	}

	client, err := dbinit.InitRabbitMQ()
	if err != nil {
		logrus.Fatal(err)
	}
	rabbitMQClient = client

	e, err := casbinusage.InitCasbin()
	if err != nil {
		logrus.Fatal("Failed to init casbin", err)
	}
	enforcer = e
}

func main() {

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	msgUsecase := messagequeue.NewRabbitMQUsecase(rabbitMQClient, persistence.NewBookingQueueRepository(db.DatabaseClient.GetDB()), *redisClient)
	go func() {
		err := msgUsecase.StartBookingConsumer(ctx)
		if err != nil {
			logrus.Error("Failed to start consumer:", err)
			cancel() // Cancel context on error
		}
	}()

	engine := server.NewEngine()

	apiRoutes := engine.Group("/api")
	api.SetupRoutes(apiRoutes, enforcer, msgUsecase, redisClient)

	server := server.New(config.AppConfig.Main.Port, engine)

	if err := server.Run(); err != nil {
		logrus.Info("Can not connect to service")
	}

}
