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
	"strings"

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

	// 1. Declare Dead Letter Exchange (DLX) & Dead Letter Queue (DLQ)
	err = rbmq.uc.ExchangeDeclare(ch, rabbitmq.DLXExchangeName, "direct", true)
	if err != nil {
		return nil, fmt.Errorf("failed to declare DLX: %w", err)
	}

	_, err = rbmq.uc.QueueDeclare(ch, rabbitmq.DLQQueueName)
	if err != nil {
		return nil, fmt.Errorf("failed to declare DLQ: %w", err)
	}

	err = rbmq.uc.QueueBind(ch, rabbitmq.DLQQueueName, rabbitmq.DLXExchangeName, rabbitmq.DLQRoutingKey)
	if err != nil {
		return nil, fmt.Errorf("failed to bind DLQ to DLX: %w", err)
	}

	// 2. Declare Main Exchange
	err = rbmq.uc.ExchangeDeclare(ch, rabbitmq.ExchangeName, "direct", true)
	if err != nil {
		return nil, fmt.Errorf("failed to declare main exchange: %w", err)
	}

	// 3. Declare Main Queue configured with DLX
	dlxArgs := amqp091.Table{
		"x-dead-letter-exchange":    rabbitmq.DLXExchangeName,
		"x-dead-letter-routing-key": rabbitmq.DLQRoutingKey,
	}
	_, err = rbmq.uc.QueueDeclareWithArgs(ch, rabbitmq.QueueName, dlxArgs)
	if err != nil {
		// If existing queue has mismatched args in dev, fallback to standard queue declare
		logrus.Warnf("QueueDeclareWithArgs failed (likely existing queue without DLX): %v. Retrying standard declare", err)
		_, err = rbmq.uc.QueueDeclare(ch, rabbitmq.QueueName)
		if err != nil {
			return nil, err
		}
	}

	// 4. Bind Main Queue to Main Exchange
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

	// Start reliable consuming with manual Ack and DLQ routing
	err = rbmq.uc.ConsumeManualAck(ctx, ch, rabbitmq.QueueName, func(msg amqp091.Delivery) error {
		return rbmq.processBookingMessage(msg.Body)
	})
	if err != nil {
		logrus.Errorf("Failed to start booking consumer: %v", err)
		return fmt.Errorf("failed to start booking consumer: %w", err)
	}

	return nil
}

// Business logic for processing booking messages with validation
func (rbmq *rabbitMQUsecase) processBookingMessage(messageBody []byte) error {
	var bookingData dtoqueue.BookingQueuePublish
	if err := json.Unmarshal(messageBody, &bookingData); err != nil {
		logrus.Errorf("Invalid JSON in booking message. Moving to DLQ: %v", err)
		return fmt.Errorf("unmarshal error: %w", err)
	}

	// Strict status & payload validation
	if err := rbmq.validateBookingPayload(&bookingData); err != nil {
		logrus.Errorf("Booking message validation failed. Rejecting to DLQ: %v", err)
		return fmt.Errorf("validation error: %w", err)
	}

	if err := rbmq.processBookingBusinessLogic(&bookingData); err != nil {
		logrus.Errorf("Failed to process booking business logic: %v", err)
		return fmt.Errorf("business logic error: %w", err)
	}

	logrus.Infof("Booking processed successfully for patient: %s (Service: %s)", bookingData.PatientName, bookingData.ServiceName)
	return nil
}

func (rbmq *rabbitMQUsecase) validateBookingPayload(data *dtoqueue.BookingQueuePublish) error {
	if data.PatientId.String() == "" || data.PatientName == "" {
		return fmt.Errorf("missing patient information")
	}
	if data.ServiceId == "" {
		return fmt.Errorf("missing service ID")
	}

	// Validate status against known valid statuses
	validPaymentStatuses := map[string]bool{
		string(patient.PaymentStatusInProgess): true,
		string(patient.PaymentStatusPaid):      true,
		constants.PaymentStatusFailed:          true,
		constants.PaymentStatusRefunded:        true,
	}

	validBookingStatuses := map[string]bool{
		string(patient.BookingStatusInProgress): true,
		string(patient.BookingStatusWaiting):    true,
		string(patient.BookingStatusReceipt):    true,
		string(patient.BookingStatusCompleted):  true,
		constants.BookingStatusPendingPayment:  true,
		constants.BookingStatusCancelled:       true,
	}

	pStatus := strings.ToLower(strings.TrimSpace(data.PaymentStatus))
	if pStatus != "" && !validPaymentStatuses[pStatus] {
		return fmt.Errorf("unrecognized payment status: '%s'", data.PaymentStatus)
	}

	bStatus := strings.ToLower(strings.TrimSpace(data.BookingStatus))
	if bStatus != "" && !validBookingStatuses[bStatus] {
		return fmt.Errorf("unrecognized booking status: '%s'", data.BookingStatus)
	}

	return nil
}

// Business logic implementation
func (rbmq *rabbitMQUsecase) processBookingBusinessLogic(data *dtoqueue.BookingQueuePublish) error {
	ctx := context.Background()

	// Default fallback statuses if empty
	paymentStatus := patient.PaymentStatus(data.PaymentStatus)
	if paymentStatus == "" {
		paymentStatus = patient.PaymentStatusPaid
	}

	bookingStatus := patient.BookingStatus(data.BookingStatus)
	if bookingStatus == "" {
		bookingStatus = patient.BookingStatusWaiting
	}

	bq := &patient.BookingQueue{
		PatientId:          data.PatientId,
		PatientName:        data.PatientName,
		PatientEmail:       data.PatientEmail,
		PatientPhoneNumber: data.PatientPhoneNumber,
		ServiceId:          data.ServiceId,
		ServiceCode:        data.ServiceCode,
		ServiceName:        data.ServiceName,
		ServiceCost:        data.Cost,
		PaymentStatus:      paymentStatus,
		BookingStatus:      bookingStatus,
		AppointmentDate:    data.AppointmentDate,
		CreatedAt:          data.CreatedAt,
		DoctorId:           data.DoctorId,
		DoctorName:         data.DoctorName,
		TimeSlot:           data.TimeSlot,
		RoomNumber:         data.RoomNumber,
		QueueNumber:        data.QueueNumber,
		PaymentIntentId:    data.PaymentIntentId,
		Notes:              data.Notes,
	}

	err := rbmq.bqrepo.Create(ctx, bq)
	if err != nil {
		logrus.Errorf("Failed to persist booking_queue in database: %v", err)
		return err
	}

	bqMarshaled, err := json.Marshal(bq)
	if err != nil {
		logrus.Errorf("Failed when marshalling booking: %v", err)
		return err
	}

	if rbmq.redis.Client != nil {
		_, err = rbmq.redis.HSet(ctx, "queue", bq.QueueId, bqMarshaled)
		if err != nil {
			logrus.Warnf("Failed to update queue cache in Redis: %v", err)
		}

		err = rbmq.redis.Publish(ctx, constants.CHANNEL_REDIS, "updated")
		if err != nil {
			logrus.Warnf("Publish to %s channel failed: %v", constants.CHANNEL_REDIS, err)
		}
	}

	return nil
}
