package patientrepository

import (
	dtopatient "backend/internal/domain/dto/dto_patient"
	"backend/internal/domain/patient"
	"backend/pkg/common/pagination"
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
)

type MockRepository struct {
	mock.Mock
}

type MockRepositoryInterface interface {
	CreatePatient(ctx context.Context, m *patient.Patient) error
	GetPatientById(ctx context.Context, id uuid.UUID) (*patient.Patient, error)
	GetPatients(ctx context.Context, pagination *pagination.Pagination) ([]*patient.Patient, error)
	UpdatePatient(ctx context.Context, id uuid.UUID, m *patient.Patient) error
	DeletePatientById(ctx context.Context, id uuid.UUID) error
	GetPatientByPhoneNumber(ctx context.Context, phoneNumber string) (*patient.Patient, error)
	BuildPatientModelForCreate(d *dtopatient.CreatePatientRequest, t time.Time, hashedPassword []byte, nextOfKinInfo []patient.NextOfKinInfo, drugAllergies, diseaseTreatmentHistory []string) (*patient.Patient, error)
	BuildPatientModelForUpdate(ud *dtopatient.UpdatePatientRequest, t time.Time, hashedPassword []byte, nextOfKinInfo []patient.NextOfKinInfo, drugAllergies, diseaseTreatmentHistory []string, existingPatient *patient.Patient) (*patient.Patient, error)
}

func (m *MockRepository) CreatePatient(ctx context.Context, patient *patient.Patient) error {
	args := m.Called(ctx, patient)
	return args.Error(0)
}

func (m *MockRepository) GetPatientById(ctx context.Context, id uuid.UUID) (*patient.Patient, error) {
	args := m.Called(ctx, id)
	if patient, ok := args.Get(0).(*patient.Patient); ok {
		return patient, nil
	}
	return nil, args.Error(1)
}

func (m *MockRepository) GetPatients(ctx context.Context, pagination *pagination.Pagination) ([]*patient.Patient, error) {
	args := m.Called(ctx, pagination)
	if patients, ok := args.Get(0).([]*patient.Patient); ok {
		return patients, nil
	}
	return nil, args.Error(1)
}

func (m *MockRepository) UpdatePatient(ctx context.Context, id uuid.UUID, patient *patient.Patient) error {
	args := m.Called(ctx, id, patient)
	return args.Error(0)
}

func (m *MockRepository) DeletePatientById(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockRepository) GetPatientByPhoneNumber(ctx context.Context, phoneNumber string) (*patient.Patient, error) {
	args := m.Called(ctx, phoneNumber)
	if patient, ok := args.Get(0).(*patient.Patient); ok {
		return patient, nil
	}
	return nil, args.Error(1)
}

func (m *MockRepository) BuildPatientModelForCreate(d *dtopatient.CreatePatientRequest, t time.Time, hashedPassword []byte, nextOfKinInfo []patient.NextOfKinInfo, drugAllergies, diseaseTreatmentHistory []string) (*patient.Patient, error) {
	args := m.Called(d, t, hashedPassword, nextOfKinInfo, drugAllergies, diseaseTreatmentHistory)
	if patient, ok := args.Get(0).(*patient.Patient); ok {
		return patient, nil
	}
	return nil, args.Error(1)
}

func (m *MockRepository) BuildPatientModelForUpdate(ud *dtopatient.UpdatePatientRequest, t time.Time, hashedPassword []byte, nextOfKinInfo []patient.NextOfKinInfo, drugAllergies, diseaseTreatmentHistory []string, existingPatient *patient.Patient) (*patient.Patient, error) {
	args := m.Called(ud, t, hashedPassword, nextOfKinInfo, drugAllergies, diseaseTreatmentHistory)
	if patient, ok := args.Get(0).(*patient.Patient); ok {
		return patient, nil
	}
	return nil, args.Error(1)
}

func TestMockRepository_CreatePatient(t *testing.T) {
	type args struct {
		ctx     context.Context
		patient *patient.Patient
	}
	tests := []struct {
		name    string
		m       *MockRepository
		args    args
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := tt.m.CreatePatient(tt.args.ctx, tt.args.patient); (err != nil) != tt.wantErr {
				t.Errorf("MockRepository.CreatePatient() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
