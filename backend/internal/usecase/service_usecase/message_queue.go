package serviceusecase

import (
	dtoqueue "backend/internal/domain/dto/queue"
	persistence "backend/internal/infrastructure/persistence/service_repository"
	"backend/pkg/common/pagination"
	"context"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

type BookingQueueUseCase interface {
	GetBookingQueues(ctx context.Context, pagination *pagination.Pagination) ([]*dtoqueue.BookingQueueResponse, error)
	GetHistoryQueuesByPatientId(ctx context.Context, pagination *pagination.Pagination, patientId uuid.UUID) ([]*dtoqueue.BookingQueueResponse, error)
	UpdateBookingStatus(ctx context.Context, queueId int) error
	DeleteBookingById(ctx context.Context, queueId int) error
}

type bookingQueueUseCase struct {
	bqRepo persistence.BookingQueuueRepository
}

func NewBookingQueueUsecase(bqRepo persistence.BookingQueuueRepository) BookingQueueUseCase {
	return &bookingQueueUseCase{bqRepo: bqRepo}
}

func (s *bookingQueueUseCase) GetBookingQueues(ctx context.Context, pagination *pagination.Pagination) ([]*dtoqueue.BookingQueueResponse, error) {

	resp, err := s.bqRepo.GetAllBookingQueues(ctx, pagination)
	if err != nil {
		logrus.Errorf("Usecase layer: %v", err)
		return nil, err
	}

	bq := dtoqueue.ConvertToListResponse(resp)

	return bq, nil
}

func (s *bookingQueueUseCase) GetHistoryQueuesByPatientId(ctx context.Context, pagination *pagination.Pagination, patientId uuid.UUID) ([]*dtoqueue.BookingQueueResponse, error) {
	resp, err := s.bqRepo.GetHistoryQueuesByPatientId(ctx, pagination, patientId)
	if err != nil {
		logrus.Errorf("Usecase layer: %v", err)
		return nil, err
	}
	bqList := dtoqueue.ConvertToListResponse(resp)

	return bqList, nil
}

func (s *bookingQueueUseCase) UpdateBookingStatus(ctx context.Context, queueId int) error {
	err := s.bqRepo.UpdateBookingStatus(ctx, queueId, "completed")
	if err != nil {
		logrus.Errorf("Usecase layer: %v", err)
		return err
	}
	return nil
}

func (s *bookingQueueUseCase) DeleteBookingById(ctx context.Context, queueId int) error {
	err := s.bqRepo.DeleteBookingById(ctx, queueId)
	if err != nil {
		logrus.Errorf("Usecase layer: %v", err)
		return err
	}
	return nil
}
