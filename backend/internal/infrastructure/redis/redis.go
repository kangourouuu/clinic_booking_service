package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/sirupsen/logrus"
)

type RedisConnection interface {
	Set(ctx context.Context, key string, value interface{}, exp time.Duration) error
	Get(ctx context.Context, key string) (string, error)
	Del(ctx context.Context, keys ...string) error
	Exists(ctx context.Context, keys ...string) (int64, error)

	HSet(ctx context.Context, key string, queueId int, value interface{}) (int64, error)
	HGetAll(ctx context.Context, key string) (map[string]string, error)
	HDel(ctx context.Context, key string, queueId int) error

	Publish(ctx context.Context, channel string, message interface{}) error
	SubChannel(ctx context.Context, channel string) *redis.PubSub

	GetClient(ctx context.Context) *redis.Client
	Ping(ctx context.Context) error
	HealthCheck(ctx context.Context) error
}

type RedisConfig struct {
	Address      string
	Password     string
	DB           int
	Poolsize     int
	MinIdleConn  int
	DialTimeout  time.Duration
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

type RedisClient struct {
	Client *redis.Client
	config RedisConfig
}

func NewRedisClient(config RedisConfig) (*RedisClient, error) {
	client := redis.NewClient(&redis.Options{
		Addr:         config.Address,
		Password:     config.Password,
		DB:           config.DB,
		PoolSize:     config.Poolsize,
		MinIdleConns: config.MinIdleConn,
		DialTimeout:  config.DialTimeout,
		ReadTimeout:  config.ReadTimeout,
		WriteTimeout: config.WriteTimeout,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to redis: %s", err)
	}
	logrus.Info("Connect to redis successfully")

	return &RedisClient{
		Client: client,
		config: config,
	}, nil
}

func (r *RedisClient) Set(ctx context.Context, key string, value interface{}, exp time.Duration) error {
	return r.Client.Set(ctx, key, value, exp).Err()
}

func (r *RedisClient) Get(ctx context.Context, key string) (string, error) {
	res, err := r.Client.Get(ctx, key).Result()
	if err == redis.Nil {
		return "", fmt.Errorf("key %s not found", key)
	}
	return res, nil
}

func (r *RedisClient) Del(ctx context.Context, keys ...string) error {
	return r.Client.Del(ctx, keys...).Err()
}

func (r *RedisClient) Exists(ctx context.Context, keys ...string) (int64, error) {
	return r.Client.Exists(ctx, keys...).Result()
}

func (r *RedisClient) Ping(ctx context.Context) error {
	return r.Client.Ping(ctx).Err()
}

func (r *RedisClient) HealthCheck(ctx context.Context) error {
	if err := r.Ping(ctx); err != nil {
		return fmt.Errorf("redis health check failed: %s", err)
	}
	return nil
}

func (r *RedisClient) GetClient(ctx context.Context) *redis.Client {
	return r.Client
}

func (r *RedisClient) HSet(ctx context.Context, key string, queueId int, value interface{}) (int64, error) {
	res, err := r.Client.HSet(ctx, key, queueId, value).Result()
	if err != nil {
		return 0, fmt.Errorf("failed to set on hash: %s", err)
	}
	return res, nil
}

func (r *RedisClient) HGetAll(ctx context.Context, key string) (map[string]string, error) {
	res, err := r.Client.HGetAll(ctx, key).Result()
	if err != nil {
		return nil, fmt.Errorf("not found in hash: %s", err)
	}
	return res, nil
}

func (r *RedisClient) HDel(ctx context.Context, key string, queueId string) error {
	err := r.Client.HDel(ctx, key, queueId).Err()
	if err != nil {
		return fmt.Errorf("not found key for delete")
	}
	return nil
}

func (r *RedisClient) Publish(ctx context.Context, channel string, message interface{}) error {
	err := r.Client.Publish(ctx, channel, message).Err()
	if err != nil {
		return fmt.Errorf("failed to publish to message channel")
	}
	return nil
}

func (r *RedisClient) SubChannel(ctx context.Context, channel string) *redis.PubSub {
	return r.Client.Subscribe(ctx, channel)
}
