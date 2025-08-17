package serviceusecase

import (
	dtoqueue "backend/internal/domain/dto/queue"
	persistence "backend/internal/infrastructure/persistence/service-repository"
	"backend/pkg/common/pagination"
	"context"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

type BookingQueueUseCase interface {
	GetBookingQueues(ctx context.Context, pagination *pagination.Pagination) ([]*dtoqueue.BookingQueueResponse, error)
	GetHistoryQueuesByPatientId(ctx context.Context, pagination *pagination.Pagination, patientId uuid.UUID) ([]*dtoqueue.BookingQueueResponse, error)
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
		return nil, err
	}

	bq := dtoqueue.ConvertToListResponse(resp)

	return bq, nil
}

func (s *bookingQueueUseCase) DeleteBookingById(ctx context.Context, queueId int) error {
	err := s.bqRepo.DeleteBookingById(ctx, queueId)
	if err != nil {
		return err
	}
	return nil
}

func (s *bookingQueueUseCase) GetHistoryQueuesByPatientId(ctx context.Context, pagination *pagination.Pagination, patientId uuid.UUID) ([]*dtoqueue.BookingQueueResponse, error) {
	resp, err := s.bqRepo.GetHistoryQueuesByPatientId(ctx, pagination, patientId)
	if err != nil {
		return nil, err
	}
	logrus.Infof("Usecase layer: %+v", resp)
	logrus.Info(patientId)
	bqList := dtoqueue.ConvertToListResponse(resp)

	return bqList, nil
}
