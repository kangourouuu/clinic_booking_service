package rabbitmq

import (
	dtoqueue "backend/internal/domain/dto/queue"
	"context"
	"encoding/json"
	"fmt"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/sirupsen/logrus"
)

const (
	ServiceRegisterEvent = "service.register"
	QueueName            = "booking_queue"
	ExchangeName         = "booking_exchange"
	DLXExchangeName      = "booking_dlx"
	DLQQueueName         = "booking_dlq"
	DLQRoutingKey        = "booking.dlq"
)

type MessageHandler func([]byte) error
type ManualAckHandler func(amqp.Delivery) error

type RabbitMQConnection interface {
	Connect() (*amqp.Connection, error)
	GetConnection() (*amqp.Connection, error)

	GetChannel(conn *amqp.Connection) (*amqp.Channel, error)
	CloseChannel(ch *amqp.Channel) error

	QueueDeclare(ch *amqp.Channel, queueName string) (amqp.Queue, error)
	QueueDeclareWithArgs(ch *amqp.Channel, queueName string, args amqp.Table) (amqp.Queue, error)
	QueueBind(ch *amqp.Channel, queueName, exchangeName, routingKey string) error

	ExchangeDeclare(ch *amqp.Channel, exchangeName, exchangeType string, durable bool) error

	PublishWithContext(ctx context.Context, ch *amqp.Channel, data *dtoqueue.BookingQueuePublish, queueName string) error
	PublishToExchange(ctx context.Context, ch *amqp.Channel, exchangeName, routingKey string, data interface{}) error
	Consume(ctx context.Context, ch *amqp.Channel, queueName string, msgHandler MessageHandler) error
	ConsumeManualAck(ctx context.Context, ch *amqp.Channel, queueName string, msgHandler ManualAckHandler) error
}

type RabbitConfig struct {
	User     string `json:"user,omitempty"`
	Password string `json:"password,omitempty"`
	Host     string `json:"host,omitempty"`
	Port     int    `json:"port,omitempty"`
	URL      string `json:"url,omitempty"` // Full AMQP URL (e.g., amqps://user:pass@host:port/vhost)
}

type RabbitMQClient struct {
	RabbitConfig
	Connection *amqp.Connection
}

func NewRabbitMQ(rbcfg RabbitConfig) *RabbitMQClient {
	return &RabbitMQClient{RabbitConfig: rbcfg}
}

func (rbmq *RabbitMQClient) Connect() (*amqp.Connection, error) {
	var address string

	// If URL is provided, use it directly; otherwise build from components
	if rbmq.URL != "" {
		address = rbmq.URL
		logrus.Infof("Connecting to RabbitMQ using provided URL")
	} else {
		address = fmt.Sprintf("amqp://%s:%s@%s:%d/", rbmq.User, rbmq.Password, rbmq.Host, rbmq.Port)
		logrus.Infof("Connecting to RabbitMQ at %s:%d", rbmq.Host, rbmq.Port)
	}

	conn, err := amqp.Dial(address)
	if err != nil {
		logrus.Errorf("Failed to connect to RabbitMQ - %v", err)
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}

	logrus.Info("Successfully connected to RabbitMQ")

	rbmq.Connection = conn
	return conn, nil
}

func (rbmq *RabbitMQClient) GetConnection() (*amqp.Connection, error) {
	conn, err := rbmq.Connect()
	if err != nil {
		return nil, err
	}
	if rbmq.Connection == nil || rbmq.Connection.IsClosed() {
		return rbmq.Connect()
	}
	return conn, err
}

func (rbmq *RabbitMQClient) GetChannel(conn *amqp.Connection) (*amqp.Channel, error) {
	ch, err := conn.Channel()
	if err != nil {
		logrus.Error("Failed to open channel")
		return nil, fmt.Errorf("failed to open channel: %w", err)
	}
	return ch, nil
}

func (rbmq *RabbitMQClient) CloseChannel(ch *amqp.Channel) error {
	return ch.Close()
}

func (rbmq *RabbitMQClient) QueueDeclare(ch *amqp.Channel, queueName string) (amqp.Queue, error) {
	return rbmq.QueueDeclareWithArgs(ch, queueName, nil)
}

func (rbmq *RabbitMQClient) QueueDeclareWithArgs(ch *amqp.Channel, queueName string, args amqp.Table) (amqp.Queue, error) {
	q, err := ch.QueueDeclare(
		queueName, // name
		true,      // durable
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		args,      // arguments
	)
	if err != nil {
		logrus.Errorf("Failed to declare queue %s: %v", queueName, err)
		return amqp.Queue{}, fmt.Errorf("failed to declare queue %s: %w", queueName, err)
	}
	logrus.Infof("Successfully declared queue: %s", queueName)
	return q, nil
}

func (rbmq *RabbitMQClient) QueueBind(ch *amqp.Channel, queueName, exchangeName, routingKey string) error {
	err := ch.QueueBind(
		queueName,    // queue name
		routingKey,   // routing key
		exchangeName, // exchange
		false,
		nil,
	)
	if err != nil {
		logrus.Errorf("Failed to bind queue %s to exchange %s with routing key %s: %v", queueName, exchangeName, routingKey, err)
		return fmt.Errorf("failed to bind queue %s to exchange %s: %w", queueName, exchangeName, err)
	}
	logrus.Infof("Successfully bound queue %s to exchange %s with routing key %s", queueName, exchangeName, routingKey)
	return nil
}

func (rbmq *RabbitMQClient) ExchangeDeclare(ch *amqp.Channel, exchangeName, exchangeType string, durable bool) error {
	err := ch.ExchangeDeclare(
		exchangeName, // name
		exchangeType, // type
		durable,      // durable
		false,        // auto-deleted
		false,        // internal
		false,        // no-wait
		nil,          // arguments
	)
	if err != nil {
		logrus.Errorf("Failed to declare exchange %s: %v", exchangeName, err)
		return fmt.Errorf("failed to declare exchange %s: %w", exchangeName, err)
	}
	logrus.Infof("Successfully declared exchange %s of type %s", exchangeName, exchangeType)
	return nil
}

func (rbmq *RabbitMQClient) PublishWithContext(ctx context.Context, ch *amqp.Channel, data *dtoqueue.BookingQueuePublish, queueName string) error {
	body, err := json.Marshal(data)
	if err != nil {
		logrus.Errorf("Failed to marshal booking data: %v", err)
		return fmt.Errorf("failed to marshal data: %w", err)
	}

	err = ch.PublishWithContext(
		ctx,
		"",        // exchange (default)
		queueName, // routing key
		false,     // mandatory
		false,     // immediate
		amqp.Publishing{
			ContentType:  "application/json",
			DeliveryMode: amqp.Persistent,
			Body:         body,
		},
	)
	if err != nil {
		logrus.Errorf("Failed to publish message to queue %s: %v", queueName, err)
		return fmt.Errorf("failed to publish message to queue %s: %w", queueName, err)
	}

	logrus.Infof("Successfully published message to queue %s", queueName)
	return nil
}

func (rbmq *RabbitMQClient) PublishToExchange(ctx context.Context, ch *amqp.Channel, exchangeName, routingKey string, data interface{}) error {
	body, err := json.Marshal(data)
	if err != nil {
		logrus.Errorf("Failed to marshal data for exchange %s: %v", exchangeName, err)
		return fmt.Errorf("failed to marshal data: %w", err)
	}

	err = ch.PublishWithContext(
		ctx,
		exchangeName,
		routingKey,
		false,
		false,
		amqp.Publishing{
			ContentType:  "application/json",
			DeliveryMode: amqp.Persistent,
			Body:         body,
		},
	)
	if err != nil {
		logrus.Errorf("Failed to publish message to exchange %s: %v", exchangeName, err)
		return fmt.Errorf("failed to publish message to exchange %s: %w", exchangeName, err)
	}

	logrus.Infof("Successfully published message to exchange %s (%s)", exchangeName, routingKey)
	return nil
}

func (rbmq *RabbitMQClient) Consume(ctx context.Context, ch *amqp.Channel, queueName string, msgHandler MessageHandler) error {
	msgs, err := ch.Consume(
		queueName, // queue
		"",        // consumer
		true,      // auto-ack
		false,     // exclusive
		false,     // no-local
		false,     // no-wait
		nil,       // args
	)
	if err != nil {
		logrus.Errorf("Failed to register consumer for queue %s: %v", queueName, err)
		return fmt.Errorf("failed to register consumer for queue %s: %w", queueName, err)
	}

	logrus.Infof("Started consuming messages from queue %s", queueName)

	go func() {
		for {
			select {
			case <-ctx.Done():
				logrus.Infof("Context cancelled, stopping consumer for queue %s", queueName)
				return
			case msg, ok := <-msgs:
				if !ok {
					logrus.Warnf("Message channel closed for queue %s", queueName)
					return
				}

				logrus.Infof("Received message from queue %s", queueName)
				if err := msgHandler(msg.Body); err != nil {
					logrus.Errorf("Failed to process message from queue %s: %v", queueName, err)
				} else {
					logrus.Infof("Successfully processed message from queue %s", queueName)
				}
			}
		}
	}()

	return nil
}

// ConsumeManualAck provides reliable consuming with auto-ack: false, manual Ack on success, and Nack (DLQ) on error
func (rbmq *RabbitMQClient) ConsumeManualAck(ctx context.Context, ch *amqp.Channel, queueName string, msgHandler ManualAckHandler) error {
	// Set prefetch QoS to avoid overwhelming the consumer
	if err := ch.Qos(10, 0, false); err != nil {
		logrus.Warnf("Failed to set QoS prefetch: %v", err)
	}

	msgs, err := ch.Consume(
		queueName,
		"",
		false, // auto-ack: FALSE for reliability!
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		logrus.Errorf("Failed to register manual-ack consumer for queue %s: %v", queueName, err)
		return fmt.Errorf("failed to register consumer for queue %s: %w", queueName, err)
	}

	logrus.Infof("Started manual-ack consumer for queue %s", queueName)

	go func() {
		for {
			select {
			case <-ctx.Done():
				logrus.Infof("Context cancelled, stopping manual-ack consumer for queue %s", queueName)
				return
			case msg, ok := <-msgs:
				if !ok {
					logrus.Warnf("Message channel closed for queue %s", queueName)
					return
				}

				if err := msgHandler(msg); err != nil {
					logrus.Errorf("Error processing message from %s: %v. Rejecting to DLQ", queueName, err)
					// Nack with requeue=false moves the message to Dead Letter Queue (DLQ) via DLX
					if nackErr := msg.Nack(false, false); nackErr != nil {
						logrus.Errorf("Failed to Nack message: %v", nackErr)
					}
				} else {
					if ackErr := msg.Ack(false); ackErr != nil {
						logrus.Errorf("Failed to Ack message: %v", ackErr)
					} else {
						logrus.Infof("Message acknowledged successfully from queue %s", queueName)
					}
				}
			}
		}
	}()

	return nil
}
