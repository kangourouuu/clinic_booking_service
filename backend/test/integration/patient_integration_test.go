package patientrepository

import (
	patienthandler "backend/internal/api/patient-handler"
	"backend/internal/domain/dto"
	dtopatient "backend/internal/domain/dto/dto_patient"
	"backend/internal/domain/patient"
	"backend/internal/infrastructure/db"
	patientrepository "backend/internal/infrastructure/persistence/patient_repository"
	persistence "backend/internal/infrastructure/persistence/service_repository"
	"backend/internal/infrastructure/redis"
	patientusecase "backend/internal/usecase/patient-usecase"
	paymentusecase "backend/internal/usecase/payment_usecase"
	serviceusecase "backend/internal/usecase/service_usecase"
	errorsresponse "backend/pkg/app_response/errors_response"
	"backend/pkg/app_response/response"
	"bytes"
	"context"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"runtime/debug"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	_ "github.com/lib/pq"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/uptrace/bun"
)

type MockAvatarUploader struct{}

func (m *MockAvatarUploader) UploadAvatar(file *multipart.FileHeader, patientId uuid.UUID) (string, error) {
	return `C:\Users\adam_\Downloads\Khanh.png`, nil
}

func setUpTestDB(t *testing.T) *bun.DB {
	cfg := db.DatabaseConfig{
		Driver:       "postgresql",
		Host:         "postgres",
		Port:         5432,
		Username:     "postgres",
		Password:     "Quockhanh208@",
		DB:           "clinic_test",
		PoolSize:     20,
		DialTimeout:  30 * time.Second,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  30 * time.Second,
	}

	db := db.NewDatabaseClient(cfg)
	if err := db.Ping(); err != nil {
		t.Fatalf("Faield to ping to database: %v", err)
	}
	return db.GetDB()
}

func setUpRedisTest(t *testing.T) *redis.RedisClient {
	cfg := redis.RedisConfig{
		Address:      "redis-host:6379",
		Password:     "",
		DB:           1,
		Poolsize:     10,
		MinIdleConn:  2,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
	}

	client, err := redis.NewRedisClient(cfg)
	if err != nil {
		t.Fatalf("Failed to open redis: %v", err)
	}
	return client
}

func TestCreatePatient(t *testing.T) {
	db := setUpTestDB(t)
	mockRepo := patientrepository.NewPatientRepo(db)
	mockRedis := setUpRedisTest(t)

	mockBookingQueueRepository := persistence.NewBookingQueueRepository(db)
	mockServiceRepository := persistence.NewServiceRepository(db)
	mockServiceUsecase := serviceusecase.NewServicesUsecase(mockServiceRepository)
	mockBookingQueueUsecase := serviceusecase.NewBookingQueueUsecase(mockBookingQueueRepository)

	mockPaymentUsecase := paymentusecase.NewPaymentMethods()

	mockAvatarUploader := &MockAvatarUploader{}
	mockPatientUsecase := patientusecase.NewPatientService(mockRepo, *mockRedis, mockAvatarUploader)
	mockHandler := patienthandler.NewPatientHandler(mockPatientUsecase, mockServiceUsecase, mockBookingQueueUsecase, mockPaymentUsecase)

	// Define test cases
	testCases := []struct {
		name          string
		formData      map[string]string
		setup         func(db *bun.DB)
		expectedCode  int
		checkResponse func(t *testing.T, bodyBytes []byte)
	}{
		{
			name: "Success",
			formData: map[string]string{
				"full_name":                 "John Doe",
				"dob":                       "20/08/2004",
				"gender":                    "Male",
				"phone_number":              "0123456789",
				"password":                  "QuocKhanh208@",
				"email":                     "john.doe@example.com",
				"address":                   "123 Main Street, Springfield",
				"photo":                     "https://example.com/photos/john_doe.png",
				"health_insurance_id":       "H123456789",
				"citizen_id":                "C987654321",
				"next_of_kin_info":          `[{"full_name":"Jane Doe","relationship":"Sister","phone_number":"0987654321"}]`,
				"drug_allergies":            `["Penicillin", "Aspirin"]`,
				"disease_treatment_history": `["Diabetes - 2015", "Hypertension - 2018"]`,
				"other_history":             "No major surgeries.",
				"vital_signs":               "BP 120/80, Pulse 72",
				"temperature":               "36.6",
				"weight":                    "70.5",
				"height":                    "1.75",
			},
			expectedCode: http.StatusCreated,
			checkResponse: func(t *testing.T, bodyBytes []byte) {
				var resp response.SuccessResponse
				err := json.Unmarshal(bodyBytes, &resp)
				assert.NoError(t, err)
				assert.Equal(t, "New patient has created", resp.Message)

				// Check nested data
				data, ok := resp.Data.(map[string]interface{})
				assert.True(t, ok)
				assert.Equal(t, "John Doe", data["full_name"])
				assert.Equal(t, "john.doe@example.com", data["email"])
			},
		},
		{
			name: "Validation Error - Missing Full Name",
			formData: map[string]string{
				"dob":          "20/08/2004",
				"gender":       "Male",
				"phone_number": "0123456788",
				"password":     "QuocKhanh208@",
				"email":        "john.doe2@example.com",
				"citizen_id":   "C987654322",
				"weight":       "70.5",
				"height":       "1.75",
			},
			expectedCode: http.StatusBadRequest,
			checkResponse: func(t *testing.T, bodyBytes []byte) {
				var errResp errorsresponse.ErrResponse
				err := json.Unmarshal(bodyBytes, &errResp)
				assert.NoError(t, err)
				assert.Contains(t, errResp.Message, "please fill out all necessary fields")
			},
		},
		{
			name: "Invalid Date Format",
			formData: map[string]string{
				"full_name":                 "John Doe",
				"dob":                       "2004-08-20", // expected: DD/mm/yyyy
				"gender":                    "Male",
				"phone_number":              "0898504459",
				"password":                  "QuocKhanh208@",
				"email":                     "bmkhanh436@gmail.com",
				"address":                   "123 Main Street, Springfield",
				"photo":                     "https://example.com/photos/john_doe.png",
				"health_insurance_id":       "H133456789",
				"citizen_id":                "C187654331",
				"next_of_kin_info":          `[{"full_name":"Jane Doe","relationship":"Sister","phone_number":"0987654321"}]`,
				"drug_allergies":            `["Penicillin", "Aspirin"]`,
				"disease_treatment_history": `["Diabetes - 2015", "Hypertension - 2018"]`,
				"other_history":             "No major surgeries.",
				"vital_signs":               "BP 120/80, Pulse 72",
				"temperature":               "36.6",
				"weight":                    "70.5",
				"height":                    "1.75",
			},
			expectedCode: http.StatusBadRequest,
			checkResponse: func(t *testing.T, bodyBytes []byte) {
				var errResp errorsresponse.ErrResponse
				err := json.Unmarshal(bodyBytes, &errResp)
				assert.NoError(t, err)
				assert.Contains(t, errResp.Message, "parsing time \"2004-08-20\" as \"02/01/2006\": cannot parse \"04-08-20\" as \"/\"")
			},
		},
		{
			name: "Duplicate Phone Number",
			formData: map[string]string{
				"full_name":                 "John Doe",
				"dob":                       "20/08/2004",
				"gender":                    "Male",
				"phone_number":              "0123456789",
				"password":                  "QuocKhanh208@",
				"email":                     "john.doe@example.com",
				"address":                   "123 Main Street, Springfield",
				"photo":                     "https://example.com/photos/john_doe.png",
				"health_insurance_id":       "H123456789",
				"citizen_id":                "C987654321",
				"next_of_kin_info":          `[{"full_name":"Jane Doe","relationship":"Sister","phone_number":"0987654321"}]`,
				"drug_allergies":            `["Penicillin", "Aspirin"]`,
				"disease_treatment_history": `["Diabetes - 2015", "Hypertension - 2018"]`,
				"other_history":             "No major surgeries.",
				"vital_signs":               "BP 120/80, Pulse 72",
				"temperature":               "36.6",
				"weight":                    "70.5",
				"height":                    "1.75",
			},
			setup: func(db *bun.DB) {
				// Pre-insert a patient with the same phone number
				p := &patient.Patient{
					PatientId:   uuid.New(),
					FullName:    "Existing User",
					PhoneNumber: "0123456789",
					Email:       "existing@example.com",
					CitizenID:   "C_EXISTING",
					Password:    "hashedpassword",
					DoB:         time.Now(),
				}
				_, err := db.NewInsert().Model(p).Exec(context.Background())
				assert.NoError(t, err)
			},
			expectedCode: http.StatusBadRequest,
			checkResponse: func(t *testing.T, bodyBytes []byte) {
				var errResp errorsresponse.ErrResponse
				err := json.Unmarshal(bodyBytes, &errResp)
				assert.NoError(t, err)
				assert.Contains(t, errResp.Message, "duplicate key value violates unique constraint")
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			db.ExecContext(context.Background(), "TRUNCATE TABLE patient CASCADE")
			if tc.setup != nil {
				tc.setup(db)
			}

			// Create multipart body
			body := &bytes.Buffer{}
			writer := multipart.NewWriter(body)
			for key, val := range tc.formData {
				_ = writer.WriteField(key, val)
			}
			writer.Close()

			// Create request
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			req, _ := http.NewRequest("POST", "/api/patient/register", body)
			req.Header.Set("Content-Type", writer.FormDataContentType())
			c.Request = req

			// Execute
			mockHandler.CreatePatient(c)

			// Assert
			assert.Equal(t, tc.expectedCode, w.Code)
			if tc.checkResponse != nil {
				tc.checkResponse(t, w.Body.Bytes())
			}
		})
	}
}

func TestGetPatientById(t *testing.T) {
	db := setUpTestDB(t)
	mockRepo := patientrepository.NewPatientRepo(db)
	mockRedis := setUpRedisTest(t)

	mockBookingQueueRepository := persistence.NewBookingQueueRepository(db)
	mockServiceRepository := persistence.NewServiceRepository(db)
	mockServiceUsecase := serviceusecase.NewServicesUsecase(mockServiceRepository)
	mockBookingQueueUsecase := serviceusecase.NewBookingQueueUsecase(mockBookingQueueRepository)

	mockPaymentUsecase := paymentusecase.NewPaymentMethods()

	mockUploader := &MockAvatarUploader{}
	mockPatientUsecase := patientusecase.NewPatientService(mockRepo, *mockRedis, mockUploader)
	mockHandler := patienthandler.NewPatientHandler(mockPatientUsecase, mockServiceUsecase, mockBookingQueueUsecase, mockPaymentUsecase)
	db.ExecContext(context.Background(), "TRUNCATE TABLE patient CASCADE")

	patientId := uuid.New()

	p := &patient.Patient{
		PatientId:         patientId,
		FullName:          "John",
		DoB:               time.Date(2004, time.August, 20, 0, 0, 0, 0, time.UTC),
		Gender:            "Male",
		PhoneNumber:       "0898504459",
		Password:          "QuocKhanh208@",
		Email:             "bbgkhanh@gmail.com",
		Address:           "153/38 Lê Hoàng Phái, phường Gò Vấp",
		PortraitPhotoURL:  "",
		HealthInsuranceID: "",
		CitizenID:         "079204022765",
		NextOfKinInfo: []patient.NextOfKinInfo{
			{
				FullName:     "Joe",
				Relationship: "Mom",
				PhoneNumber:  "0123456789",
			},
		},
		Resereved1: "",
		Resereved2: "",
		Resereved3: "",
		// MedicalHistory:     &mh,
		// GeneralExamination: &ge,
	}

	testCases := []struct {
		name    string
		profile *patient.Patient
		wantErr error
	}{
		{"no data", &patient.Patient{}, nil},
		{"success", p, nil},
		{"invalid id", &patient.Patient{
			PatientId: uuid.MustParse("38b27eb9-3500-42d7-9e5f-495c2b540b5e"),
		}, nil},
	}

	_, err := db.NewInsert().Model(p).Exec(context.Background())
	if err != nil {
		t.Errorf("Failed to insert patient")
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			c.Params = gin.Params{{Key: "id", Value: patientId.String()}}
			mockHandler.GetPatientById(c)
			if w.Code != http.StatusOK {
				t.Errorf("expected 200, got %d", w.Code)
			}

			var patientResponse struct {
				Status  int                         `json:"status_code"`
				Data    *dtopatient.PatientResponse `json:"data"`
				Message string                      `json:"message"`
			}

			err := json.Unmarshal(w.Body.Bytes(), &patientResponse)
			if err != nil {
				t.Errorf("error when Unmarshalling")
			}
			assert.NoError(t, err)

			assert.Equal(t, p.FullName, patientResponse.Data.FullName)
			assert.Equal(t, p.PhoneNumber, patientResponse.Data.PhoneNumber)
			assert.Equal(t, p.Email, patientResponse.Data.Email)
			assert.Equal(t, "Data fetched", patientResponse.Message)
		})
	}
}

func TestGetPatients(t *testing.T) {
	db := setUpTestDB(t)
	mockRepo := patientrepository.NewPatientRepo(db)
	mockRedis := setUpRedisTest(t)

	mockBookingQueueRepository := persistence.NewBookingQueueRepository(db)
	mockServiceRepository := persistence.NewServiceRepository(db)
	mockServiceUsecase := serviceusecase.NewServicesUsecase(mockServiceRepository)
	mockBookingQueueUsecase := serviceusecase.NewBookingQueueUsecase(mockBookingQueueRepository)

	mockPaymentUsecase := paymentusecase.NewPaymentMethods()

	mockAvatarUploader := &MockAvatarUploader{}
	mockPatientUsecase := patientusecase.NewPatientService(mockRepo, *mockRedis, mockAvatarUploader)
	mockHandler := patienthandler.NewPatientHandler(mockPatientUsecase, mockServiceUsecase, mockBookingQueueUsecase, mockPaymentUsecase)
	db.ExecContext(context.Background(), "TRUNCATE TABLE patient CASCADE")

	patientId := uuid.New()

	p := []*patient.Patient{
		{
			PatientId:         patientId,
			FullName:          "John Doe",
			DoB:               time.Date(2004, time.August, 20, 0, 0, 0, 0, time.UTC),
			Gender:            "Male",
			PhoneNumber:       "0123456789",
			Password:          "QuocKhanh208@",
			Email:             "john.doe@example.com",
			Address:           "123 Main Street, Springfield",
			PortraitPhotoURL:  "https://example.com/photos/john_doe.png",
			HealthInsuranceID: "H123456789",
			CitizenID:         "C987654321",
			NextOfKinInfo: []patient.NextOfKinInfo{
				{
					FullName:     "Jane Doe",
					Relationship: "Sister",
					PhoneNumber:  "0987654321",
				},
			},
			Resereved1: "",
			Resereved2: "",
			Resereved3: "",
		},
	}

	testCases := []struct {
		name          string
		slicePatients []*patient.Patient
		wantErr       error
	}{
		{"success", p, nil},
		{"no data", []*patient.Patient{}, nil},
	}

	_, err := db.NewInsert().Model(p[0]).Exec(context.Background())
	assert.NoError(t, err)

	expectedResponse := []*dtopatient.PatientResponse{
		{
			PatientId:         p[0].PatientId,
			FullName:          p[0].FullName,
			DoB:               p[0].DoB.Format("02/01/2006"),
			Gender:            p[0].Gender,
			PhoneNumber:       p[0].PhoneNumber,
			Email:             p[0].Email,
			Address:           p[0].Address,
			PortraitPhotoURL:  p[0].PortraitPhotoURL,
			HealthInsuranceID: p[0].HealthInsuranceID,
			CitizenID:         p[0].CitizenID,
			NextOfKinInfo:     p[0].NextOfKinInfo,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			req, _ := http.NewRequest("GET", "/api/patients?page=1&page_size=8", nil)
			c.Request = req
			mockHandler.GetPatients(c)
			if w.Code != http.StatusOK {
				t.Errorf("expected 200, got %d", w.Code)
			}

			var patientsResponse struct {
				StatusCode int
				Data       *dto.PaginationResponse[dtopatient.PatientResponse]
				Message    string
			}

			err := json.Unmarshal(w.Body.Bytes(), &patientsResponse)
			require.NoError(t, err)

			assert.Equal(t, http.StatusOK, w.Code)
			assert.Equal(t, expectedResponse, patientsResponse.Data.Data)
			assert.Equal(t, int64(1), patientsResponse.Data.Pagination.Total)
		})
	}
}

func TestUpdatePatient(t *testing.T) {
	db := setUpTestDB(t)
	mockRepo := patientrepository.NewPatientRepo(db)
	mockRedis := setUpRedisTest(t)

	mockBookingQueueRepository := persistence.NewBookingQueueRepository(db)
	mockServiceRepository := persistence.NewServiceRepository(db)
	mockServiceUsecase := serviceusecase.NewServicesUsecase(mockServiceRepository)
	mockBookingQueueUsecase := serviceusecase.NewBookingQueueUsecase(mockBookingQueueRepository)

	mockPaymentUsecase := paymentusecase.NewPaymentMethods()

	mockAvatarUploader := &MockAvatarUploader{}
	mockPatientUsecase := patientusecase.NewPatientService(mockRepo, *mockRedis, mockAvatarUploader)
	mockHandler := patienthandler.NewPatientHandler(mockPatientUsecase, mockServiceUsecase, mockBookingQueueUsecase, mockPaymentUsecase)
	patientId := uuid.New()

	testCases := []struct {
		name          string
		formData      map[string]string
		setup         func(db *bun.DB)
		expectedCode  int
		checkResponse func(t *testing.T, bodyBytes []byte)
	}{
		{
			name: "Success",
			formData: map[string]string{
				"full_name":    "John Doe",
				"dob":          "20/08/2004",
				"gender":       "Male",
				"phone_number": "0898504459",
				"password":     "QuocKhanh208@",
				"email":        "john.doe@example.com",
				"address":      "123 Main Street, Springfield",
				// "avatar":                    "test_avatar.jpg",
				"photo":                     "https://example.com/photos/john_doe.png",
				"health_insurance_id":       "H123456789",
				"citizen_id":                "C97654321",
				"next_of_kin_info":          `[{"full_name":"Jane Doe","relationship":"Sister","phone_number":"0987654321"}]`,
				"drug_allergies":            `["Penicillin", "Aspirin"]`,
				"disease_treatment_history": `["Diabetes - 2015", "Hypertension - 2018"]`,
				"other_history":             "No major surgeries.",
				"vital_signs":               "BP 120/80, Pulse 72",
				"temperature":               "36.6",
				"weight":                    "70.5",
				"height":                    "1.75",
			},
			setup: func(db *bun.DB) {
				patient := &patient.Patient{
					PatientId:   patientId,
					FullName:    "John Doe",
					DoB:         time.Date(2004, 8, 20, 0, 0, 0, 0, time.UTC),
					Gender:      "Male",
					PhoneNumber: "0123456789",
					Email:       "john.doe@example.com",
					Password:    "hashed-pass",
					CitizenID:   "C987654321",
				}
				_, err := db.NewInsert().Model(patient).Exec(context.Background())
				require.NoError(t, err)
			},
			expectedCode: http.StatusOK,
			checkResponse: func(t *testing.T, bodyBytes []byte) {
				var resp response.SuccessResponse
				err := json.Unmarshal(bodyBytes, &resp)
				assert.NoError(t, err)
				assert.Equal(t, "Data updated", resp.Message)

				// Check nested data
				data, ok := resp.Data.(map[string]interface{})
				assert.True(t, ok)
				assert.Equal(t, "John Doe", data["full_name"])
				assert.Equal(t, "john.doe@example.com", data["email"])
			},
		},
		{
			name: "Validation Error - Missing Full Name",
			formData: map[string]string{
				"dob":          "20/08/2004",
				"gender":       "Male",
				"phone_number": "0123456788",
				"password":     "QuocKhanh208@",
				"email":        "john.doe2@example.com",
				"citizen_id":   "C987654322",
				"weight":       "70.5",
				"height":       "1.75",
			},
			setup: func(db *bun.DB) {
				patient := &patient.Patient{
					PatientId:   patientId,
					FullName:    "John Doe",
					DoB:         time.Date(2004, 8, 20, 0, 0, 0, 0, time.UTC),
					Gender:      "Male",
					PhoneNumber: "0123456789",
					Email:       "john.doe@example.com",
					Password:    "hashed-pass",
					CitizenID:   "C987654321",
				}
				_, err := db.NewInsert().Model(patient).Exec(context.Background())
				require.NoError(t, err)
			},
			expectedCode: http.StatusBadRequest,
			checkResponse: func(t *testing.T, bodyBytes []byte) {
				var errResp errorsresponse.ErrResponse
				err := json.Unmarshal(bodyBytes, &errResp)
				assert.NoError(t, err)
				assert.Contains(t, errResp.Message, "please fill out all necessary fields")
			},
		},
		{
			name: "Invalid Date Format",
			formData: map[string]string{
				"full_name":                 "John Doe",
				"dob":                       "2004-08-20", // expected: DD/mm/yyyy
				"gender":                    "Male",
				"phone_number":              "0898504459",
				"password":                  "QuocKhanh208@",
				"email":                     "bmkhanh436@gmail.com",
				"address":                   "123 Main Street, Springfield",
				"photo":                     "https://example.com/photos/john_doe.png",
				"health_insurance_id":       "H133456789",
				"citizen_id":                "C187654331",
				"next_of_kin_info":          `[{"full_name":"Jane Doe","relationship":"Sister","phone_number":"0987654321"}]`,
				"drug_allergies":            `["Penicillin", "Aspirin"]`,
				"disease_treatment_history": `["Diabetes - 2015", "Hypertension - 2018"]`,
				"other_history":             "No major surgeries.",
				"vital_signs":               "BP 120/80, Pulse 72",
				"temperature":               "36.6",
				"weight":                    "70.5",
				"height":                    "1.75",
			},
			setup: func(db *bun.DB) {
				patient := &patient.Patient{
					PatientId:   patientId,
					FullName:    "John Doe",
					DoB:         time.Date(2004, 8, 20, 0, 0, 0, 0, time.UTC),
					Gender:      "Male",
					PhoneNumber: "0123456789",
					Email:       "john.doe@example.com",
					Password:    "hashed-pass",
					CitizenID:   "C987654321",
				}
				_, err := db.NewInsert().Model(patient).Exec(context.Background())
				require.NoError(t, err)
			},
			expectedCode: http.StatusBadRequest,
			checkResponse: func(t *testing.T, bodyBytes []byte) {
				var errResp errorsresponse.ErrResponse
				err := json.Unmarshal(bodyBytes, &errResp)
				assert.NoError(t, err)
				assert.Contains(t, errResp.Message, "parsing time \"2004-08-20\" as \"02/01/2006\": cannot parse \"04-08-20\" as \"/\"")
			},
		},
		{
			name: "Invalid ID",
			formData: map[string]string{
				"patient_id":                "11111",
				"full_name":                 "John Doe",
				"dob":                       "2004-08-20", // expected: DD/mm/yyyy
				"gender":                    "Male",
				"phone_number":              "0898504459",
				"password":                  "QuocKhanh208@",
				"email":                     "bmkhanh436@gmail.com",
				"address":                   "123 Main Street, Springfield",
				"photo":                     "https://example.com/photos/john_doe.png",
				"health_insurance_id":       "H133456789",
				"citizen_id":                "C187654331",
				"next_of_kin_info":          `[{"full_name":"Jane Doe","relationship":"Sister","phone_number":"0987654321"}]`,
				"drug_allergies":            `["Penicillin", "Aspirin"]`,
				"disease_treatment_history": `["Diabetes - 2015", "Hypertension - 2018"]`,
				"other_history":             "No major surgeries.",
				"vital_signs":               "BP 120/80, Pulse 72",
				"temperature":               "36.6",
				"weight":                    "70.5",
				"height":                    "1.75",
			},
			setup: func(db *bun.DB) {
				patient := &patient.Patient{
					PatientId:   patientId,
					FullName:    "John Doe",
					DoB:         time.Date(2004, 8, 20, 0, 0, 0, 0, time.UTC),
					Gender:      "Male",
					PhoneNumber: "0123456789",
					Email:       "john.doe@example.com",
					Password:    "hashed-pass",
					CitizenID:   "C987654321",
				}
				_, err := db.NewInsert().Model(patient).Exec(context.Background())
				require.NoError(t, err)
			},
			expectedCode: http.StatusBadRequest,
			checkResponse: func(t *testing.T, bodyBytes []byte) {
				var errResp errorsresponse.ErrResponse
				err := json.Unmarshal(bodyBytes, &errResp)
				assert.NoError(t, err)
				assert.Contains(t, errResp.Message, "parsing time \"2004-08-20\" as \"02/01/2006\": cannot parse \"04-08-20\" as \"/\"")
			},
		},
	}

	for _, tc := range testCases {
		db.ExecContext(context.Background(), "TRUNCATE TABLE patient CASCADE")
		t.Run(tc.name, func(t *testing.T) {
			defer func() {
				if r := recover(); r != nil {
					t.Errorf("panic occurred: %v\n%s", r, debug.Stack())
				}
			}()
			if tc.setup != nil {
				tc.setup(db)
			}

			// Create multipart body
			body := &bytes.Buffer{}
			writer := multipart.NewWriter(body)
			for key, val := range tc.formData {
				_ = writer.WriteField(key, val)
			}

			// Ghi thêm file giả (avatar)
			fileWriter, err := writer.CreateFormFile("avatar", `C:\Users\adam_\Downloads\Khanh.png`)
			require.NoError(t, err)

			_, err = io.Copy(fileWriter, bytes.NewReader([]byte("fake image")))
			require.NoError(t, err)
			writer.Close()

			// Create request
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			c.Params = gin.Params{{Key: "id", Value: patientId.String()}}
			req, _ := http.NewRequest("PUT", "/api/admin/patient", body)
			req.Header.Set("Content-Type", writer.FormDataContentType())
			c.Request = req

			mockHandler.UpdatePatient(c)

			// Assert
			assert.Equal(t, tc.expectedCode, w.Code)
			if tc.checkResponse != nil {
				tc.checkResponse(t, w.Body.Bytes())
			}
		})
	}
}

func TestDeletePatient(t *testing.T) {
	db := setUpTestDB(t)
	mockRepo := patientrepository.NewPatientRepo(db)
	mockRedis := setUpRedisTest(t)

	mockBookingQueueRepository := persistence.NewBookingQueueRepository(db)
	mockServiceRepository := persistence.NewServiceRepository(db)
	mockServiceUsecase := serviceusecase.NewServicesUsecase(mockServiceRepository)
	mockBookingQueueUsecase := serviceusecase.NewBookingQueueUsecase(mockBookingQueueRepository)

	mockPaymentUsecase := paymentusecase.NewPaymentMethods()

	mockAvatarUploader := &MockAvatarUploader{}
	mockPatientUsecase := patientusecase.NewPatientService(mockRepo, *mockRedis, mockAvatarUploader)
	mockHandler := patienthandler.NewPatientHandler(mockPatientUsecase, mockServiceUsecase, mockBookingQueueUsecase, mockPaymentUsecase)
	patientID := uuid.New()
	invalidPatientId := uuid.MustParse("da2012db-f4fc-420c-8490-eb2de00de6b1")
	// Define test cases
	testCases := []struct {
		name         string
		patientId    uuid.UUID
		expectedCode int
	}{
		{"success", patientID, 200},
		{"invalid id", invalidPatientId, 500},
	}

	p := &patient.Patient{
		PatientId: patientID,
	}

	_, err := db.NewInsert().Model(p).Exec(context.Background())
	if err != nil {
		t.Errorf("Failed to insert")
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			c.Params = gin.Params{{Key: "id", Value: patientID.String()}}
			mockHandler.DeletePatient(c)

			var deleteResponse struct {
				StatusCode int         `json:"status_code"`
				Data       interface{} `json:"data"`
				Message    string      `json:"message"`
			}

			err := json.Unmarshal(w.Body.Bytes(), &deleteResponse)
			if err != nil {
				t.Errorf("Unmarshalling error: %+v", err)
			}

			assert.Equal(t, tc.expectedCode, deleteResponse.StatusCode)
		})
	}
}
