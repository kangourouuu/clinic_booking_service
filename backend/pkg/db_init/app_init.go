package dbinit

import (
	"backend/internal/infrastructure/db"
	"backend/internal/infrastructure/rabbitmq"
	"backend/internal/infrastructure/redis"
	"backend/pkg/config"
	"fmt"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

var RedisClient redis.RedisConnection
var RabbitMQClient *rabbitmq.RabbitMQClient

func InitDatabase() error {
	if !config.AppConfig.Main.DB { // false
		logrus.Errorf("Database is not enable")
	}

	databaseConfig := db.DatabaseConfig{
		Driver:       "postgresql",
		Host:         viper.GetString("db.host"),
		Port:         viper.GetInt("db.port"),
		Username:     viper.GetString("db.username"),
		Password:     viper.GetString("db.password"),
		DB:           viper.GetString("db.database"),
		PoolSize:     20,
		Timeout:      30 * time.Second,
		DialTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		ReadTimeout:  30 * time.Second,
		IdleTimeout:  30 * time.Second,
	}
	db.DatabaseClient = db.NewDatabaseClient(databaseConfig)

	return nil
}

func InitRedis() (*redis.RedisClient, error) {
	if !config.AppConfig.Main.Redis {
		logrus.Errorf("Redis is not enable")
	}

	redisCfg := redis.RedisConfig{
		Address:      viper.GetString("redis.addr"),
		Password:     viper.GetString("redis.password"),
		DB:           viper.GetInt("redis.db"),
		Poolsize:     10,
		MinIdleConn:  10,
		DialTimeout:  30 * time.Second,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	redisClient, err := redis.NewRedisClient(redisCfg)
	if err != nil {
		return nil, err
	}

	return redisClient, nil
}

func InitRabbitMQ() (*rabbitmq.RabbitMQClient, error) {
	if !config.AppConfig.Main.RabbitMQ {
		logrus.Errorf("RabbitMQ is not enabled")
		return nil, fmt.Errorf("RabbitMQ is disabled in config")
	}

	rabbitmqCfg := &rabbitmq.RabbitConfig{
		User:     viper.GetString("rabbitmq.username"),
		Password: viper.GetString("rabbitmq.password"),
		Host:     viper.GetString("rabbitmq.host"),
		Port:     viper.GetInt("rabbitmq.port"),
	}

	logrus.Infof("Connecting to RabbitMQ at %s: %d", rabbitmqCfg.Host, rabbitmqCfg.Port)

	rabbitmqClient := rabbitmq.NewRabbitMQ(*rabbitmqCfg)
	if rabbitmqClient == nil {
		return nil, fmt.Errorf("failed to create RabbitMQ connection")
	}

	RabbitMQClient = rabbitmqClient
	return RabbitMQClient, nil
}