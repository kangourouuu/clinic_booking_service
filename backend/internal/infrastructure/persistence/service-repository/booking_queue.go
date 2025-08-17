package persistence

import (
	"backend/internal/domain/queue"
	"backend/pkg/common/pagination"
	"context"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

type BookingQueuueRepository interface {
	Create(ctx context.Context, bq *queue.BookingQueue) error
	GetAllBookingQueues(ctx context.Context, pagination *pagination.Pagination) ([]*queue.BookingQueue, error)
	GetHistoryQueuesByPatientId(ctx context.Context, pagination *pagination.Pagination, patientId uuid.UUID) ([]*queue.BookingQueue, error)
	DeleteBookingById(ctx context.Context, queueId int) error
}

type bookingQueueRepository struct {
	db *bun.DB
}

func NewBookingQueueRepository(db *bun.DB) BookingQueuueRepository {
	repo := &bookingQueueRepository{db: db}
	_ = repo.migrate()
	return repo
}

func (r *bookingQueueRepository) Create(ctx context.Context, bq *queue.BookingQueue) error {
	_, err := r.db.NewInsert().Model(bq).Exec(ctx)
	if err != nil {
		return err
	}
	return nil
}
func (r *bookingQueueRepository) GetAllBookingQueues(ctx context.Context, pagination *pagination.Pagination) ([]*queue.BookingQueue, error) {
	var bq []*queue.BookingQueue
	offset := pagination.GetOffSet()
	limit := pagination.GetLimit()
	total, err := r.db.NewSelect().Model(&bq).Count(ctx)
	if err != nil {
		return nil, err
	}
	pagination.Total = int64(total)

	err = r.db.NewSelect().Model(&bq).Limit(limit).Offset(offset).Scan(ctx)
	if err != nil {
		return nil, err
	}

	return bq, nil
}

func (r *bookingQueueRepository) DeleteBookingById(ctx context.Context, queueId int) error {
	_, err := r.db.NewDelete().Model((*queue.BookingQueue)(nil)).Where("queue_id = ?", queueId).Exec(ctx)
	if err != nil {
		return err
	}
	return nil
}

func (r *bookingQueueRepository) migrate() error {
	ctx := context.Background()
	_, err := r.db.NewCreateTable().Model((*queue.BookingQueue)(nil)).IfNotExists().Exec(ctx)
	if err != nil {
		return err
	}
	return nil
}

func (r *bookingQueueRepository) GetHistoryQueuesByPatientId(ctx context.Context, pagination *pagination.Pagination, patientId uuid.UUID) ([]*queue.BookingQueue, error) {
	var bq []*queue.BookingQueue
	offset := pagination.GetOffSet()
	limit := pagination.GetLimit()
	total, err := r.db.NewSelect().Model(&bq).Count(ctx)
	if err != nil {
		return nil, err
	}
	pagination.Total = int64(total)

	logrus.Info(patientId)
	err = r.db.NewSelect().Model(&bq).Limit(limit).Offset(offset).Where("patient_id = ?", patientId).Scan(ctx)
	if err != nil {
		return nil, err
	}
	logrus.Infof("Repository layer: %+v", bq)

	return bq, nil
}
