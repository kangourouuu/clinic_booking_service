package idempotency

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestEventStore_NilDB(t *testing.T) {
	store := NewEventStore(nil)
	ctx := context.Background()

	processed, err := store.IsEventProcessed(ctx, "evt_123")
	assert.NoError(t, err)
	assert.False(t, processed)

	err = store.MarkEventProcessed(ctx, "evt_123", "payment.succeeded")
	assert.NoError(t, err)
}
