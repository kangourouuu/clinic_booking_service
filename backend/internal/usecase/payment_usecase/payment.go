package paymentusecase

import (
	dtopatient "backend/internal/domain/dto/dto_patient"
	"backend/internal/domain/dto/dtoservice"
	dtoqueue "backend/internal/domain/dto/queue"
	"backend/pkg/common/utils"
	"encoding/json"
	"errors"
	"os"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/checkout/session"
)

type PaymentMethods interface {
	CreateCheckoutSession(patient *dtopatient.PatientResponse, service *dtoservice.ServiceResponse, appointment dtoservice.AppointmentRequest) (*stripe.CheckoutSession, error)
	WebhookCheckAndSolving(event stripe.Event) (*dtoqueue.BookingQueuePublish, error)
}

type paymentMethods struct{}

func NewPaymentMethods() PaymentMethods {
	return &paymentMethods{}
}

func (p *paymentMethods) CreateCheckoutSession(patient *dtopatient.PatientResponse, service *dtoservice.ServiceResponse, appointment dtoservice.AppointmentRequest) (*stripe.CheckoutSession, error) {

	req := dtoservice.PatientRegisterService{
		PatientId:          patient.PatientId,
		PatientName:        patient.FullName,
		PatientEmail:       patient.Email,
		PatientPhoneNumber: patient.PhoneNumber,

		ServiceId:       service.ServiceId,
		ServiceName:     service.ServiceName,
		ServiceCode:     service.ServiceCode,
		Cost:            service.Cost,
		AppointmentDate: appointment.AppointmentDate,
	}

	stripe.Key = os.Getenv("STRIPE_API")
	if stripe.Key == "" {
		logrus.Error("STRIPE_SECRET_KEY environment variable not set")
		return nil, errors.New("stripe_secret_key environment variable not set")
	}

	vndAmount := req.Cost
	if vndAmount < 999 {
		vndAmount = 1000
	}

	params := &stripe.CheckoutSessionParams{
		Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency: stripe.String(string(stripe.CurrencyVND)),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name:        stripe.String(req.ServiceName),
						Description: stripe.String("Dịch vụ y tế tại phòng khám"),
					},
					UnitAmount: stripe.Int64(int64(vndAmount)),
				},
				Quantity: stripe.Int64(1),
			},
		},
		SuccessURL: stripe.String("http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}"),
		CancelURL:  stripe.String("http://localhost:3000/payment/cancel"),
		Metadata: map[string]string{
			"patient_id":       req.PatientId.String(),
			"patient_name":     req.PatientName,
			"patient_email":    req.PatientEmail,
			"patient_phone":    req.PatientPhoneNumber,
			"service_id":       req.ServiceId.String(),
			"service_name":     req.ServiceName,
			"service_code":     req.ServiceCode,
			"service_cost":     strconv.FormatFloat(vndAmount, 'f', 2, 64),
			"appointment_date": req.AppointmentDate,
		},
		PaymentMethodTypes: []*string{
			stripe.String("card"),
		},
		CustomerCreation:         stripe.String("if_required"),
		BillingAddressCollection: stripe.String("auto"),
	}

	s, err := session.New(params)
	if err != nil {
		logrus.Errorf("Failed to create checkout session: %v", err)
		return nil, err
	}

	logrus.Infof("Checkout session created successfully!")
	return s, nil
}

func (p *paymentMethods) WebhookCheckAndSolving(event stripe.Event) (*dtoqueue.BookingQueuePublish, error) {
	var session stripe.CheckoutSession
	if err := json.Unmarshal(event.Data.Raw, &session); err != nil {
		logrus.Error("Failed on process unmarshal event data to session")
		return nil, err
	}

	metadata := session.Metadata
	serviceCost, err := strconv.ParseFloat(metadata["service_cost"], 64)
	if err != nil {
		logrus.Error("Failed to parse service_cost string to float")
		return nil, err
	}

	patientId, err := uuid.Parse(metadata["patient_id"])
	if err != nil {
		logrus.Error("Failed to parse patient_id to uuid")
		return nil, err
	}

	getAppointment := metadata["appointment"]
	appointmentDate, err := utils.ParseTime(getAppointment)
	if err != nil {
		logrus.Error("Failed to parse string to time")
		return nil, err
	}

	bookingQueuePublish := &dtoqueue.BookingQueuePublish{
		PatientId:          patientId,
		PatientName:        metadata["patient_name"],
		PatientEmail:       metadata["patient_email"],
		PatientPhoneNumber: metadata["patient_phone_number"],
		ServiceId:          metadata["service_id"],
		ServiceName:        metadata["service_name"],
		ServiceCode:        metadata["service_code"],
		Cost:               serviceCost,
		PaymentStatus:      "paid",
		BookingStatus:      "waiting",
		CreatedAt:          time.Now(),
		AppointmentDate:    appointmentDate,
	}
	
	return bookingQueuePublish, nil
}
