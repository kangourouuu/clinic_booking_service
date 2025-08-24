package messagequeue

import (
	dtoqueue "backend/internal/domain/dto/queue"
	"backend/internal/domain/patient"
	persistence "backend/internal/infrastructure/persistence/service_repository"
	"backend/internal/infrastructure/rabbitmq"
	"backend/internal/infrastructure/redis"
	"backend/pkg/constants"
	"context"
	"encoding/json"
	"fmt"

	"github.com/rabbitmq/amqp091-go"
	"github.com/sirupsen/logrus"
)

type RabbitMQUsecase interface {
	PublishBooking(ctx context.Context, data *dtoqueue.BookingQueuePublish) error
	StartBookingConsumer(ctx context.Context) error
	SetupInfrastructure(ctx context.Context) error
}

type rabbitMQUsecase struct {
	uc     rabbitmq.RabbitMQConnection
	bqrepo persistence.BookingQueuueRepository
	redis  redis.RedisClient
}

func NewRabbitMQUsecase(rabbitConn rabbitmq.RabbitMQConnection, bqrepo persistence.BookingQueuueRepository, redis redis.RedisClient) RabbitMQUsecase {
	return &rabbitMQUsecase{
		uc:     rabbitConn,
		bqrepo: bqrepo,
		redis:  redis,
	}
}

func (rbmq *rabbitMQUsecase) setupInfrastructure() (*amqp091.Channel, error) {
	conn, err := rbmq.uc.Connect()
	if err != nil {
		return nil, fmt.Errorf("failed to connect: %w", err)
	}

	ch, err := rbmq.uc.GetChannel(conn)
	if err != nil {
		return nil, err
	}

	// register an exchange
	err = rbmq.uc.ExchangeDeclare(ch, rabbitmq.ExchangeName, "direct", true)
	if err != nil {
		return nil, err
	}

	// register a queue
	_, err = rbmq.uc.QueueDeclare(ch, rabbitmq.QueueName)
	if err != nil {
		return nil, err
	}

	// bind queue to exchange
	err = rbmq.uc.QueueBind(ch, rabbitmq.QueueName, rabbitmq.ExchangeName, rabbitmq.ServiceRegisterEvent)
	if err != nil {
		return nil, err
	}
	return ch, nil
}

func (rbmq *rabbitMQUsecase) SetupInfrastructure(ctx context.Context) error {
	_, err := rbmq.setupInfrastructure()
	if err != nil {
		logrus.Errorf("Failed to setup RabbitMQ infrastructure: %v", err)
		return fmt.Errorf("failed to setup RabbitMQ infrastructure: %w", err)
	}
	return nil
}

func (rbmq *rabbitMQUsecase) PublishBooking(ctx context.Context, data *dtoqueue.BookingQueuePublish) error {
	ch, err := rbmq.setupInfrastructure()
	if err != nil {
		return fmt.Errorf("failed to setup infrastructure: %w", err)
	}
	defer rbmq.uc.CloseChannel(ch)

	err = rbmq.uc.PublishWithContext(ctx, ch, data, rabbitmq.QueueName)
	if err != nil {
		logrus.Errorf("Failed to publish booking: %v", err)
		return fmt.Errorf("failed to publish booking: %w", err)
	}

	return nil
}

func (rbmq *rabbitMQUsecase) StartBookingConsumer(ctx context.Context) error {
	ch, err := rbmq.setupInfrastructure()
	if err != nil {
		return fmt.Errorf("failed to setup infrastructure for consumer: %w", err)
	}

	// Start consuming with message handler
	err = rbmq.uc.Consume(ctx, ch, rabbitmq.QueueName, rbmq.processBookingMessage)
	if err != nil {
		logrus.Errorf("Failed to start booking consumer: %v", err)
		return fmt.Errorf("failed to start booking consumer: %w", err)
	}

	return nil
}

// Business logic for processing booking messages
func (rbmq *rabbitMQUsecase) processBookingMessage(messageBody []byte) error {

	// Parse message
	var bookingData dtoqueue.BookingQueuePublish
	if err := json.Unmarshal(messageBody, &bookingData); err != nil {
		logrus.Errorf("Failed to unmarshal booking message: %v", err)
		return fmt.Errorf("failed to unmarshal booking message: %w", err)
	}

	// Business logic processing
	if err := rbmq.processBookingBusinessLogic(&bookingData); err != nil {
		logrus.Errorf("Failed to process booking business logic: %v", err)
		return fmt.Errorf("failed to process booking business logic: %w", err)
	}

	logrus.Infof("Booking processed successfully for patient: %s", bookingData.PatientName)
	return nil
}

// Business logic implementation
func (rbmq *rabbitMQUsecase) processBookingBusinessLogic(data *dtoqueue.BookingQueuePublish) error {
	ctx := context.Background()

	bq := &patient.BookingQueue{
		PatientId:          data.PatientId,
		PatientName:        data.PatientName,
		PatientEmail:       data.PatientEmail,
		PatientPhoneNumber: data.PatientPhoneNumber,
		ServiceId:          data.ServiceId,
		ServiceCode:        data.ServiceCode,
		ServiceName:        data.ServiceName,
		ServiceCost:        data.Cost,
		PaymentStatus:      patient.PaymentStatus(data.PaymentStatus),
		BookingStatus:      patient.BookingStatus(data.BookingStatus),
		AppointmentDate:    data.AppointmentDate,
		CreatedAt:          data.CreatedAt,
	}

	err := rbmq.bqrepo.Create(ctx, bq)
	if err != nil {
		logrus.Error("Failed to create booking_queue in database")
		return err
	}

	bqMarshaled, err := json.Marshal(bq)
	if err != nil {
		logrus.Error("Failed when marshalling")
		return err
	}

	_, err = rbmq.redis.HSet(ctx, "queue", bq.QueueId, bqMarshaled)
	if err != nil {
		logrus.Error("failed to set data on cache has")
		return err
	}

	err = rbmq.redis.Publish(ctx, constants.CHANNEL_REDIS, "updated")
	if err != nil {
		logrus.Errorf("Publish to %s channel failed", constants.CHANNEL_REDIS)
		return err
	}

	return nil
}
