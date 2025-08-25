package persistence

import (
	"backend/internal/domain/patient"
	"backend/pkg/common/pagination"
	"context"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

type BookingQueuueRepository interface {
	Create(ctx context.Context, bq *patient.BookingQueue) error
	GetAllBookingQueues(ctx context.Context, pagination *pagination.Pagination) ([]*patient.BookingQueue, error)
	GetHistoryQueuesByPatientId(ctx context.Context, pagination *pagination.Pagination, patientId uuid.UUID) ([]*patient.BookingQueue, error)
	GetDetailsBookingByQueueId(ctx context.Context, queueId int) (*patient.BookingQueue, error)
	UpdateBookingStatus(ctx context.Context, queueId int, status string) error
	DeleteBookingById(ctx context.Context, queueId int) error
}

type bookingQueueRepository struct {
	db *bun.DB
}

func NewBookingQueueRepository(db *bun.DB) BookingQueuueRepository {
	return &bookingQueueRepository{db: db}
}

func (r *bookingQueueRepository) Create(ctx context.Context, bq *patient.BookingQueue) error {
	_, err := r.db.NewInsert().Model(bq).Exec(ctx)
	if err != nil {
		logrus.Errorf("Repository layer: %v", err)
		return err
	}
	return nil
}
func (r *bookingQueueRepository) GetAllBookingQueues(ctx context.Context, pagination *pagination.Pagination) ([]*patient.BookingQueue, error) {
	var bq []*patient.BookingQueue
	offset := pagination.GetOffSet()
	limit := pagination.GetLimit()
	total, err := r.db.NewSelect().Model(&bq).Count(ctx)
	if err != nil {
		logrus.Errorf("Repository layer: %v", err)
		return nil, err
	}
	pagination.Total = int64(total)

	err = r.db.NewSelect().Model(&bq).Limit(limit).Offset(offset).Scan(ctx)
	if err != nil {
		logrus.Errorf("Repository layer: %v", err)
		return nil, err
	}

	return bq, nil
}

func (r *bookingQueueRepository) GetHistoryQueuesByPatientId(ctx context.Context, pagination *pagination.Pagination, patientId uuid.UUID) ([]*patient.BookingQueue, error) {
	var bq []*patient.BookingQueue
	offset := pagination.GetOffSet()
	limit := pagination.GetLimit()
	total, err := r.db.NewSelect().Model(&bq).Count(ctx)
	if err != nil {
		logrus.Errorf("Repository layer: %v", err)
		return nil, err
	}
	pagination.Total = int64(total)

	logrus.Info(patientId)
	err = r.db.NewSelect().Model(&bq).Limit(limit).Offset(offset).Where("patient_id = ?", patientId).Scan(ctx)
	if err != nil {
		logrus.Errorf("Repository layer: %v", err)
		return nil, err
	}

	return bq, nil
}

func (r *bookingQueueRepository) GetDetailsBookingByQueueId(ctx context.Context, queueId int) (*patient.BookingQueue, error) {
	bq := &patient.BookingQueue{}
	err := r.db.NewSelect().Model(bq).Where("drug_receipt.queue_id = ?", queueId).Relation("DrugReceipt").Scan(ctx)
	if err != nil {
		logrus.Errorf("Repository layer %+v", err)
		return nil, err
	}
	return bq, nil
}

func (r *bookingQueueRepository) UpdateBookingStatus(ctx context.Context, queueId int, status string) error {
	_, err := r.db.NewUpdate().Model((*patient.BookingQueue)(nil)).Set("booking_status = ?", status).Where("queue_id = ?", queueId).Exec(ctx)
	if err != nil {
		logrus.Errorf("Repository layer: %v", err)
		return err
	}
	return nil
}

func (r *bookingQueueRepository) DeleteBookingById(ctx context.Context, queueId int) error {
	_, err := r.db.NewDelete().Model((*patient.BookingQueue)(nil)).Where("queue_id = ?", queueId).Exec(ctx)
	if err != nil {
		logrus.Errorf("Repository layer: %v", err)
		return err
	}
	return nil
}

// func (r *bookingQueueRepository) migrate() error {
// 	ctx := context.Background()
// 	_, err := r.db.NewCreateTable().
// 	Model(&patient.DrugReceipt{}).
// 	IfNotExists().
// 	Exec(ctx)
// 	if err != nil {
// 		logrus.Errorf("Repository layer: %v", err)
// 		return err
// 	}

// 	_, err = r.db.NewCreateTable().
// 	Model(&patient.BookingQueue{}).
// 	WithForeignKeys().
// 	IfNotExists().
// 	Exec(ctx)
// 	if err != nil {
// 		logrus.Errorf("Repository layer: %v", err)
// 		return err
// 	}
// 	return nil
// }
