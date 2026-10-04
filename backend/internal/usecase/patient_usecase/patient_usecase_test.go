package patientusecase

import (
	"backend/internal/domain/dto"
	dtopatient "backend/internal/domain/dto/dto_patient"
	"backend/pkg/common/pagination"
	"context"
	"errors"
	"mime/multipart"
	"net/textproto"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockPatientRepository struct {
	mock.Mock
}

func (m *MockPatientRepository) CreatePatient(ctx context.Context, d *dtopatient.CreatePatientRequest, file *multipart.FileHeader) error {
	args := m.Called(ctx, d, file)
	return args.Error(0)
}

func (m *MockPatientRepository) GetPatientById(ctx context.Context, id string) (*dtopatient.PatientResponse, error) {
	args := m.Called(ctx, id)
	if patient, ok := args.Get(0).(*dtopatient.PatientResponse); ok {
		return patient, nil
	}
	return nil, args.Error(1)
}

func (m *MockPatientRepository) GetPatients(ctx context.Context, pagination *pagination.Pagination) ([]*dtopatient.PatientResponse, error) {
	args := m.Called(ctx, pagination)
	if patient, ok := args.Get(0).([]*dtopatient.PatientResponse); ok {
		return patient, nil
	}
	return nil, args.Error(1)
}

func (m *MockPatientRepository) UpdatePatient(ctx context.Context, patientId string, d *dtopatient.UpdatePatientRequest, file *multipart.FileHeader) error {
	args := m.Called(ctx, patientId, d, file)
	return args.Error(0)
}
func (m *MockPatientRepository) DeletePatientById(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}
func (m *MockPatientRepository) LoginPatient(ctx context.Context, req *dto.LoginRequest) (*dto.LoginResponse, error) {
	args := m.Called(ctx, req)
	if success, ok := args.Get(0).(*dto.LoginResponse); ok {
		return success, nil
	}
	return nil, args.Error(1)
}

func TestCreatePatient(t *testing.T) {
	ctx := context.Background()
	t.Run("registered", func(t *testing.T) {
		mockService := new(MockPatientRepository)
		req := &dtopatient.CreatePatientRequest{
			FullName:          "Nguyen Van A",
			DoB:               "20/08/2004",
			Gender:            "male",
			PhoneNumber:       "0901234567",
			Password:          "securePass123",
			Email:             "nguyenvana@example.com",
			Address:           "123 Le Loi, District 1, HCMC",
			PortraitPhotoURL:  "https://example.com/photos/patient123.jpg",
			HealthInsuranceID: "HI123456789",
			CitizenID:         "012345678901",
			NextOfKinInfo:     "Nguyen Thi B - 0987654321",

			Resereved1: "",
			Resereved2: "",
			Resereved3: "",

			DrugAllergies:           "Penicillin",
			DiseaseTreatmentHistory: "Hypertension, Diabetes",
			OtherHistory:            "No major surgery",

			VitalSigns:  "BP: 120/80 mmHg, Pulse: 75 bpm",
			Temperature: 36.8,
			Weight:      68.5,
			Height:      172.0,
			BMI:         68.5 / ((172.0 / 100) * (172.0 / 100)), // auto calculate

			PatientId: uuid.New(),
		}

		file := &multipart.FileHeader{
			Filename: "avatar.jpg",
			Header: textproto.MIMEHeader{
				"Content-Disposition": []string{`form-data; name="file"; filename="avatar.jpg"`},
				"Content-Type":        []string{"image/jpeg"},
			},
			Size: 1024, // giả sử file 1KB
		}

		mockService.On("CreatePatient", ctx, req, file).Return(nil)
		err := mockService.CreatePatient(ctx, req, file)

		assert.NoError(t, err)
		mockService.AssertExpectations(t)
	})

	t.Run("invalid email", func(t *testing.T) {
		mockService := new(MockPatientRepository)
		req := &dtopatient.CreatePatientRequest{
			FullName:          "Nguyen Van A",
			DoB:               "20/08/2004",
			Gender:            "male",
			PhoneNumber:       "0901234567",
			Password:          "securePass123",
			Email:             "nguyenvanaexample.com",
			Address:           "123 Le Loi, District 1, HCMC",
			PortraitPhotoURL:  "https://example.com/photos/patient123.jpg",
			HealthInsuranceID: "HI123456789",
			CitizenID:         "012345678901",
			NextOfKinInfo:     "Nguyen Thi B - 0987654321",

			Resereved1: "",
			Resereved2: "",
			Resereved3: "",

			DrugAllergies:           "Penicillin",
			DiseaseTreatmentHistory: "Hypertension, Diabetes",
			OtherHistory:            "No major surgery",

			VitalSigns:  "BP: 120/80 mmHg, Pulse: 75 bpm",
			Temperature: 36.8,
			Weight:      68.5,
			Height:      172.0,
			BMI:         68.5 / ((172.0 / 100) * (172.0 / 100)), // auto calculate

			PatientId: uuid.New(),
		}

		file := &multipart.FileHeader{
			Filename: "avatar.jpg",
			Header: textproto.MIMEHeader{
				"Content-Disposition": []string{`form-data; name="file"; filename="avatar.jpg"`},
				"Content-Type":        []string{"image/jpeg"},
			},
			Size: 1024, // giả sử file 1KB
		}

		expectedErr := errors.New("invalid email")
		mockService.On("CreatePatient", ctx, req, file).Return(expectedErr)
		err := mockService.CreatePatient(ctx, req, file)

		assert.Error(t, err)
		assert.EqualError(t, err, expectedErr.Error())
		mockService.AssertExpectations(t)
	})

	t.Run("invalid phone number", func(t *testing.T) {
		mockService := new(MockPatientRepository)
		req := &dtopatient.CreatePatientRequest{
			FullName:          "Nguyen Van A",
			DoB:               "20/08/2004",
			Gender:            "male",
			PhoneNumber:       "090123453",
			Password:          "securePass123",
			Email:             "nguyenvana@example.com",
			Address:           "123 Le Loi, District 1, HCMC",
			PortraitPhotoURL:  "https://example.com/photos/patient123.jpg",
			HealthInsuranceID: "HI123456789",
			CitizenID:         "012345678901",
			NextOfKinInfo:     "Nguyen Thi B - 0987654321",

			Resereved1: "",
			Resereved2: "",
			Resereved3: "",

			DrugAllergies:           "Penicillin",
			DiseaseTreatmentHistory: "Hypertension, Diabetes",
			OtherHistory:            "No major surgery",

			VitalSigns:  "BP: 120/80 mmHg, Pulse: 75 bpm",
			Temperature: 36.8,
			Weight:      68.5,
			Height:      172.0,
			BMI:         68.5 / ((172.0 / 100) * (172.0 / 100)), // auto calculate

			PatientId: uuid.New(),
		}

		file := &multipart.FileHeader{
			Filename: "avatar.jpg",
			Header: textproto.MIMEHeader{
				"Content-Disposition": []string{`form-data; name="file"; filename="avatar.jpg"`},
				"Content-Type":        []string{"image/jpeg"},
			},
			Size: 1024, // giả sử file 1KB
		}

		expectedErr := errors.New("invalid phone number")
		mockService.On("CreatePatient", ctx, req, file).Return(expectedErr)
		err := mockService.CreatePatient(ctx, req, file)

		assert.Error(t, err)
		assert.EqualError(t, err, expectedErr.Error())
		mockService.AssertExpectations(t)
	})

	t.Run("invalid file", func(t *testing.T) {
		mockService := new(MockPatientRepository)
		req := &dtopatient.CreatePatientRequest{
			FullName:          "Nguyen Van A",
			DoB:               "20/08/2004",
			Gender:            "male",
			PhoneNumber:       "0901234567",
			Password:          "securePass123",
			Email:             "nguyenvana@example.com",
			Address:           "123 Le Loi, District 1, HCMC",
			PortraitPhotoURL:  "https://example.com/photos/patient123.jpg",
			HealthInsuranceID: "HI123456789",
			CitizenID:         "012345678901",
			NextOfKinInfo:     "Nguyen Thi B - 0987654321",

			Resereved1: "",
			Resereved2: "",
			Resereved3: "",

			DrugAllergies:           "Penicillin",
			DiseaseTreatmentHistory: "Hypertension, Diabetes",
			OtherHistory:            "No major surgery",

			VitalSigns:  "BP: 120/80 mmHg, Pulse: 75 bpm",
			Temperature: 36.8,
			Weight:      68.5,
			Height:      172.0,
			BMI:         68.5 / ((172.0 / 100) * (172.0 / 100)), // auto calculate

			PatientId: uuid.New(),
		}

		file := &multipart.FileHeader{
			Filename: "avatar.xxx",
			Header: textproto.MIMEHeader{
				"Content-Disposition": []string{`form-data; name="file"; filename="avatar.jpg"`},
				"Content-Type":        []string{"image/jpeg"},
			},
			Size: 1024, // giả sử file 1KB
		}

		expectedErr := errors.New("invalid file")
		mockService.On("CreatePatient", ctx, req, file).Return(expectedErr)
		err := mockService.CreatePatient(ctx, req, file)

		assert.Error(t, err)
		assert.EqualError(t, err, expectedErr.Error())
		mockService.AssertExpectations(t)
	})
}

func TestGetPatientById(t *testing.T) {
	ctx := context.Background()
	patientId := uuid.New()

	t.Run("found", func(t *testing.T) {
		mockService := new(MockPatientRepository)
		expectedPatient := &dtopatient.PatientResponse{
			PatientId:   patientId,
			FullName:    "John Doe",
			Email:       "john.doe@example.com",
			PhoneNumber: "1234567890",
		}

		mockService.On("GetPatientById", ctx, patientId.String()).Return(expectedPatient, nil)

		patient, err := mockService.GetPatientById(ctx, patientId.String())

		assert.NoError(t, err)
		assert.NotNil(t, patient)
		assert.Equal(t, expectedPatient, patient)
		mockService.AssertExpectations(t)
	})

	t.Run("not found", func(t *testing.T) {
		mockService := new(MockPatientRepository)
		nonExistentId := uuid.New()
		expectedErr := errors.New("patient not found")

		mockService.On("GetPatientById", ctx, nonExistentId.String()).Return(nil, expectedErr)

		patient, err := mockService.GetPatientById(ctx, nonExistentId.String())

		assert.Error(t, err)
		assert.Nil(t, patient)
		assert.EqualError(t, err, expectedErr.Error())
		mockService.AssertExpectations(t)
	})
}

func TestGetPatients(t *testing.T) {
	ctx := context.Background()
	pagination := &pagination.Pagination{Page: 1, PageSize: 10}

	t.Run("success", func(t *testing.T) {
		mockService := new(MockPatientRepository)
		expectedPatients := []*dtopatient.PatientResponse{
			{PatientId: uuid.New(), FullName: "John Doe"},
			{PatientId: uuid.New(), FullName: "Jane Doe"},
		}

		mockService.On("GetPatients", ctx, pagination).Return(expectedPatients, nil)

		patients, err := mockService.GetPatients(ctx, pagination)

		assert.NoError(t, err)
		assert.NotNil(t, patients)
		assert.Len(t, patients, 2)
		mockService.AssertExpectations(t)
	})

	t.Run("error", func(t *testing.T) {
		mockService := new(MockPatientRepository)
		expectedErr := errors.New("internal server error")

		mockService.On("GetPatients", ctx, pagination).Return(nil, expectedErr)

		patients, err := mockService.GetPatients(ctx, pagination)

		assert.Error(t, err)
		assert.Nil(t, patients)
		assert.EqualError(t, err, expectedErr.Error())
		mockService.AssertExpectations(t)
	})
}

func TestUpdatePatient(t *testing.T) {
	ctx := context.Background()
	patientId := uuid.New().String()
	updateReq := &dtopatient.UpdatePatientRequest{
		FullName: "John Doe Updated",
	}
	file := &multipart.FileHeader{
		Filename: "new_avatar.jpg",
		Header:   textproto.MIMEHeader{},
		Size:     2048,
	}

	t.Run("success", func(t *testing.T) {
		mockService := new(MockPatientRepository)
		mockService.On("UpdatePatient", ctx, patientId, updateReq, file).Return(nil)

		err := mockService.UpdatePatient(ctx, patientId, updateReq, file)

		assert.NoError(t, err)
		mockService.AssertExpectations(t)
	})

	t.Run("error", func(t *testing.T) {
		mockService := new(MockPatientRepository)
		expectedErr := errors.New("update failed")
		mockService.On("UpdatePatient", ctx, patientId, updateReq, file).Return(expectedErr)

		err := mockService.UpdatePatient(ctx, patientId, updateReq, file)

		assert.Error(t, err)
		assert.EqualError(t, err, expectedErr.Error())
		mockService.AssertExpectations(t)
	})
}

func TestDeletePatientById(t *testing.T) {
	ctx := context.Background()
	patientId := uuid.New().String()

	t.Run("success", func(t *testing.T) {
		mockService := new(MockPatientRepository)
		mockService.On("DeletePatientById", ctx, patientId).Return(nil)

		err := mockService.DeletePatientById(ctx, patientId)

		assert.NoError(t, err)
		mockService.AssertExpectations(t)
	})

	t.Run("error", func(t *testing.T) {
		mockService := new(MockPatientRepository)
		expectedErr := errors.New("deletion failed")
		mockService.On("DeletePatientById", ctx, patientId).Return(expectedErr)

		err := mockService.DeletePatientById(ctx, patientId)

		assert.Error(t, err)
		assert.EqualError(t, err, expectedErr.Error())
		mockService.AssertExpectations(t)
	})
}

func TestLoginPatient(t *testing.T) {
	ctx := context.Background()
	loginReq := &dto.LoginRequest{
		PhoneNumber: "a@gmail.com",
		Password:    "QuocKhanh208@",
	}

	t.Run("success", func(t *testing.T) {
		mockService := new(MockPatientRepository)
		expectedResponse := &dto.LoginResponse{
			Token:   "some.jwt.token",
			Message: "Login successfully",
		}
		mockService.On("LoginPatient", ctx, loginReq).Return(expectedResponse, nil)

		resp, err := mockService.LoginPatient(ctx, loginReq)

		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, expectedResponse, resp)
		mockService.AssertExpectations(t)
	})

	t.Run("invalid credentials", func(t *testing.T) {
		mockService := new(MockPatientRepository)
		expectedErr := errors.New("invalid credentials")
		mockService.On("LoginPatient", ctx, loginReq).Return(nil, expectedErr)

		resp, err := mockService.LoginPatient(ctx, loginReq)

		assert.Error(t, err)
		assert.Nil(t, resp)
		assert.EqualError(t, err, expectedErr.Error())
		mockService.AssertExpectations(t)
	})
}
