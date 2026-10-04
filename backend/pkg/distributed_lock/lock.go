package distributed_lock

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"github.com/sirupsen/logrus"
)

// releaseLockLuaScript ensures we only delete the lock if the value matches our unique token
const releaseLockLuaScript = `
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
`

// Locker interface for acquiring and releasing distributed locks
type Locker interface {
	Acquire(ctx context.Context, resourceKey string, ttl time.Duration) (string, bool, error)
	Release(ctx context.Context, resourceKey string, token string) error
}

type RedisLocker struct {
	client redis.Cmdable
}

func NewRedisLocker(client redis.Cmdable) *RedisLocker {
	return &RedisLocker{client: client}
}

// Acquire attempts to set a distributed lock with a unique token and TTL using SETNX
func (l *RedisLocker) Acquire(ctx context.Context, resourceKey string, ttl time.Duration) (string, bool, error) {
	if l.client == nil {
		logrus.Warn("Redis client is nil, bypassing distributed lock")
		return uuid.NewString(), true, nil
	}

	token := uuid.NewString()
	fullKey := fmt.Sprintf("lock:%s", resourceKey)

	success, err := l.client.SetNX(ctx, fullKey, token, ttl).Result()
	if err != nil {
		logrus.Errorf("Failed to acquire distributed lock for key %s: %v", fullKey, err)
		return "", false, err
	}

	return token, success, nil
}

// Release releases the lock atomically via Lua script only if the token matches
func (l *RedisLocker) Release(ctx context.Context, resourceKey string, token string) error {
	if l.client == nil || token == "" {
		return nil
	}

	fullKey := fmt.Sprintf("lock:%s", resourceKey)
	res, err := l.client.Eval(ctx, releaseLockLuaScript, []string{fullKey}, token).Result()
	if err != nil {
		logrus.Errorf("Failed to release distributed lock for key %s: %v", fullKey, err)
		return err
	}

	if val, ok := res.(int64); ok && val == 0 {
		logrus.Warnf("Lock for %s was already released or expired", fullKey)
	}

	return nil
}
