package constants

// Database
const (
	SUCCESS_CONNECT_DB = "CONNECTED TO DB"
)

// Redis
const (
	CHANNEL_REDIS = "queue:update"
)

// HTTP Headers for Identity Propagation & Tracing
const (
	HeaderUserID    = "X-User-ID"
	HeaderUserRole  = "X-User-Role"
	HeaderRequestID = "X-Request-ID"
)

// RabbitMQ Topology & Routing
const (
	ExchangeBooking           = "booking_exchange"
	QueueBooking              = "booking_queue"
	ExchangeBookingDLX        = "booking_dlx"
	QueueBookingDLQ           = "booking_dlq"
	RoutingKeyBookingRegister = "service.register"
	RoutingKeyBookingPaid     = "booking.paid"
	RoutingKeyBookingDLQ      = "booking.dlq"
)

// Roles
const (
	RolePatient = "patient"
	RoleDoctor  = "doctor"
	RoleNurse   = "nurse"
	RoleAdmin   = "admin"
)

// Standard Payment Statuses
const (
	PaymentStatusPending  = "waiting for payment"
	PaymentStatusPaid     = "paid"
	PaymentStatusFailed   = "failed"
	PaymentStatusRefunded = "refunded"
)

// Standard Booking Statuses
const (
	BookingStatusPendingPayment = "pending payment"
	BookingStatusWaiting        = "waiting"
	BookingStatusInProgress     = "in progress"
	BookingStatusCompleted      = "completed"
	BookingStatusCancelled      = "cancelled"
	BookingStatusReceipt        = "created drug receipt"
)