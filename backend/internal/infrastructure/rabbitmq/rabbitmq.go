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
)

type MessageHandler func([]byte) error

type RabbitMQConnection interface {
	Connect() (*amqp.Connection, error)
	GetConnection() (*amqp.Connection, error)

	GetChannel(conn *amqp.Connection) (*amqp.Channel, error)
	CloseChannel(ch *amqp.Channel) error

	QueueDeclare(ch *amqp.Channel, queueName string) (amqp.Queue, error)
	QueueBind(ch *amqp.Channel, queueName, exchangeName, routingKey string) error

	ExchangeDeclare(ch *amqp.Channel, exchangeName, exchangeType string, durable bool) error

	PublishWithContext(ctx context.Context, ch *amqp.Channel, data *dtoqueue.BookingQueuePublish, queueName string) error
	Consume(ctx context.Context, ch *amqp.Channel, queueName string, msgHandler MessageHandler) error
}

type RabbitConfig struct {
	User     string `json:"user,omitempty"`
	Password string `json:"password,omitempty"`
	Host     string `json:"host,omitempty"`
	Port     int    `json:"port,omitempty"`
}

type RabbitMQClient struct {
	RabbitConfig
	Connection *amqp.Connection
}

func NewRabbitMQ(rbcfg RabbitConfig) *RabbitMQClient {
	return &RabbitMQClient{RabbitConfig: rbcfg}
}

func (rbmq *RabbitMQClient) Connect() (*amqp.Connection, error) {
	address := fmt.Sprintf("amqp://%s:%s@%s:%d/", rbmq.User, rbmq.Password, rbmq.Host, rbmq.Port)

	conn, err := amqp.Dial(address)
	if err != nil {
		logrus.Errorf("Failed to connect to RabbitMQ at %s:%d - %v", rbmq.Host, rbmq.Port, err)
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}

	logrus.Infof("Successfully connected to RabbitMQ at %s:%d", rbmq.Host, rbmq.Port)

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
	q, err := ch.QueueDeclare(
		queueName, // name
		true,      // durable
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
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
	// Marshal data to JSON
	body, err := json.Marshal(data)
	if err != nil {
		logrus.Errorf("Failed to marshal booking data: %v", err)
		return fmt.Errorf("failed to marshal data: %w", err)
	}

	// Publish message
	err = ch.PublishWithContext(
		ctx,
		"",        // exchange (empty for default)
		queueName, // routing key
		false,     // mandatory
		false,     // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)
	if err != nil {
		logrus.Errorf("Failed to publish message to queue %s: %v", queueName, err)
		return fmt.Errorf("failed to publish message to queue %s: %w", queueName, err)
	}

	logrus.Infof("Successfully published message to queue %s", queueName)
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

	// Start consuming messages in a goroutine
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
