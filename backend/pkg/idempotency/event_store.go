package idempotency

import (
	"context"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

type ProcessedEvent struct {
	bun.BaseModel `bun:"table:processed_webhook_events"`
	EventID       string    `bun:"event_id,pk" json:"event_id"`
	EventType     string    `bun:"event_type,notnull" json:"event_type"`
	CreatedAt     time.Time `bun:"created_at,default:current_timestamp" json:"created_at"`
}

type EventStore interface {
	InitSchema(ctx context.Context) error
	IsEventProcessed(ctx context.Context, eventID string) (bool, error)
	MarkEventProcessed(ctx context.Context, eventID, eventType string) error
}

type bunEventStore struct {
	db *bun.DB
}

func NewEventStore(db *bun.DB) EventStore {
	store := &bunEventStore{db: db}
	_ = store.InitSchema(context.Background())
	return store
}

func (s *bunEventStore) InitSchema(ctx context.Context) error {
	if s.db == nil {
		return nil
	}
	_, err := s.db.NewCreateTable().
		Model((*ProcessedEvent)(nil)).
		IfNotExists().
		Exec(ctx)
	if err != nil {
		logrus.Errorf("Failed to initialize processed_webhook_events table: %v", err)
		return err
	}
	return nil
}

func (s *bunEventStore) IsEventProcessed(ctx context.Context, eventID string) (bool, error) {
	if s.db == nil || eventID == "" {
		return false, nil
	}

	exists, err := s.db.NewSelect().
		Model((*ProcessedEvent)(nil)).
		Where("event_id = ?", eventID).
		Exists(ctx)
	if err != nil {
		logrus.Errorf("Failed to check if event %s was processed: %v", eventID, err)
		return false, err
	}

	return exists, nil
}

func (s *bunEventStore) MarkEventProcessed(ctx context.Context, eventID, eventType string) error {
	if s.db == nil || eventID == "" {
		return nil
	}

	event := &ProcessedEvent{
		EventID:   eventID,
		EventType: eventType,
		CreatedAt: time.Now(),
	}

	_, err := s.db.NewInsert().
		Model(event).
		Ignore(). // ON CONFLICT DO NOTHING
		Exec(ctx)
	if err != nil {
		logrus.Errorf("Failed to record processed event %s: %v", eventID, err)
		return err
	}

	return nil
}
