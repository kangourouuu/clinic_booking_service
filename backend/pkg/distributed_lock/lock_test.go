package distributed_lock

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestRedisLocker_NilClient(t *testing.T) {
	locker := NewRedisLocker(nil)
	ctx := context.Background()

	token, acquired, err := locker.Acquire(ctx, "test-resource", 5*time.Second)
	assert.NoError(t, err)
	assert.True(t, acquired)
	assert.NotEmpty(t, token)

	err = locker.Release(ctx, "test-resource", token)
	assert.NoError(t, err)
}
