package patientusecase

import (
	"backend/internal/domain/dto"
	dtopatient "backend/internal/domain/dto/dto_patient"
	patientrepository "backend/internal/infrastructure/persistence/patient_repository"
	"backend/internal/infrastructure/redis"
	"backend/pkg/common/pagination"
	"backend/pkg/common/utils"
	cloudinaryutils "backend/pkg/common/utils/cloudinary_utils"
	"backend/pkg/common/validator"
	patientvalidator "backend/pkg/common/validator/patient"
	"context"
	"errors"
	"mime/multipart"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
)

type PatientUsecase interface {
	CreatePatient(ctx context.Context, d *dtopatient.CreatePatientRequest, file *multipart.FileHeader) error
	GetPatientById(ctx context.Context, id string) (*dtopatient.PatientResponse, error)
	GetPatients(ctx context.Context, pagination *pagination.Pagination) ([]*dtopatient.PatientResponse, error)
	UpdatePatient(ctx context.Context, patientId string, d *dtopatient.UpdatePatientRequest, file *multipart.FileHeader) error
	DeletePatientById(ctx context.Context, id string) error
	LoginPatient(ctx context.Context, req *dto.LoginRequest) (*dto.LoginResponse, error)
}

type patientUsecase struct {
	repo           patientrepository.PatientRepository
	avatarUploader cloudinaryutils.AvatarUploader
	redis          redis.RedisClient
}

func NewPatientService(repo patientrepository.PatientRepository, redisConn redis.RedisClient, avatarUploader cloudinaryutils.AvatarUploader) PatientUsecase {
	return &patientUsecase{
		repo:           repo,
		redis:          redisConn,
		avatarUploader: avatarUploader,
	}
}

func (s *patientUsecase) CreatePatient(ctx context.Context, d *dtopatient.CreatePatientRequest, file *multipart.FileHeader) error {
	// hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(d.Password), 10)
	if err != nil {
		logrus.Errorf("Failed to hash password: %v", err)
		return err
	}

	// convert string to time
	t, err := utils.ParseTime(d.DoB) // time format : DD/MM/yyyy
	if err != nil {
		return err
	}

	// validate input
	err = patientvalidator.ValidatePatientFieldsForCreate(d)
	if err != nil {
		return err
	}

	// calculate bmi
	d.BMI = d.Weight / (d.Height * d.Height)
	d.PatientId = uuid.New()

	var avatarUrl string
	if file != nil {
		avatarUrl, err = s.avatarUploader.UploadAvatar(file, d.PatientId)
		if err != nil {
			return err
		}
	}
	d.PortraitPhotoURL = avatarUrl

	// unmarshal from string (input) to jsonb to store at database
	nextOfKinInfo, drugAllergies, diseaseTreatmentHistory, err := utils.DeserializeCreateRequest(d)
	if err != nil {
		return err
	}

	// build model
	p, err := s.repo.BuildPatientModelForCreate(d, t, hashedPassword, nextOfKinInfo, drugAllergies, diseaseTreatmentHistory)
	if err != nil {
		logrus.Errorf("Failed to build patient model: %v", err)
		return err
	}
	// main logic
	return s.repo.CreatePatient(ctx, p)
}

func (s *patientUsecase) LoginPatient(ctx context.Context, req *dto.LoginRequest) (*dto.LoginResponse, error) {
	// validate input
	if ok := validator.IsValidLogin(req.PhoneNumber, req.Password); !ok {
		logrus.Error("Email and Password are required")
		return nil, errors.New("email and password are required")
	}

	// get patient by email
	p, err := s.repo.GetPatientByPhoneNumber(ctx, req.PhoneNumber)
	if err != nil {
		logrus.Errorf("Patient not found with email %s: %v", req.PhoneNumber, err)
		return nil, errors.New("invalid credentials")
	}

	// compare with the password in DB
	err = bcrypt.CompareHashAndPassword([]byte(p.Password), []byte(req.Password))
	if err != nil {
		logrus.Errorf("Invalid password for email %s", req.PhoneNumber)
		return nil, errors.New("invalid credentials")
	}

	// generate new token and sign it to key
	token := utils.GenerateToken(p.PatientId.String(), "patient")

	// Cache token in Redis if redis connection is available
	// if s.redis != nil {
	err = s.redis.Set(context.Background(), "patientId", token, 20*time.Minute)
	if err != nil {
		logrus.Warnf("failed to cache patient information: %s", err)
	}
	// } else {
	// 	logrus.Warn("Redis connection not available, skipping token caching")
	// }

	// return response
	resp := &dto.LoginResponse{
		Token:   token,
		User:    p, // Include patient data
		Message: "Login successfully",
	}

	logrus.Infof("User %s logged in successfully", req.PhoneNumber)
	return resp, nil
}

func (s *patientUsecase) GetPatientById(ctx context.Context, patientId string) (*dtopatient.PatientResponse, error) {
	// validate input
	if ok := validator.IsValidId(patientId); !ok {
		return nil, errors.New("invalid id")
	}

	patientID := uuid.MustParse(patientId)
	// Get patient from repository
	p, err := s.repo.GetPatientById(ctx, patientID)
	if err != nil {
		logrus.Errorf("Failed to get patient by ID %s: %v", patientId, err)
		return nil, err
	}

	// convert domain model to DTO
	resp := dtopatient.ConvertToPatientResponse(p)

	return resp, nil
}
func (s *patientUsecase) GetPatients(ctx context.Context, pagination *pagination.Pagination) ([]*dtopatient.PatientResponse, error) {
	// get all patients from repository
	patients, err := s.repo.GetPatients(ctx, pagination)
	if err != nil {
		logrus.Errorf("Failed to get patients: %v", err)
		return nil, err
	}

	// convert domain models to DTOs
	responses := dtopatient.ConvertToPatientList(patients)
	return responses, nil
}

func (s *patientUsecase) UpdatePatient(ctx context.Context, patientId string, ud *dtopatient.UpdatePatientRequest, file *multipart.FileHeader) error {
	var hashedPassword []byte
	var err error

	// validate input
	err = patientvalidator.ValidatePatientFieldsForUpdate(ud, patientId)
	if err != nil {
		logrus.Error(err)
		return err
	}

	patientID := uuid.MustParse(patientId)
	// get current patient for updating
	patient, err := s.repo.GetPatientById(ctx, patientID)
	if err != nil {
		return err
	}

	// if password field not blank -> change password -> hash new password and store to database
	if ud.Password != "" {
		if err = bcrypt.CompareHashAndPassword([]byte(patient.Password), []byte(ud.Password)); err != nil {
			var hashErr error
			hashedPassword, hashErr = bcrypt.GenerateFromPassword([]byte(ud.Password), 10)
			if hashErr != nil {
				return hashErr
			}
		} else {
			hashedPassword = []byte(patient.Password)
		}
	} else {
		hashedPassword = []byte(patient.Password)
	}

	// update BMI
	ud.BMI = ud.Weight / (ud.Height * ud.Height)

	var avatarUrl string
	if file != nil {
		avatarUrl, err = s.avatarUploader.UploadAvatar(file, ud.PatientId)
		if err != nil {
			return err
		}
		ud.PortraitPhotoURL = avatarUrl
	} else {
		// Keep existing avatar URL when no file is provided
		ud.PortraitPhotoURL = patient.PortraitPhotoURL
	}

	// parse string to time follow format : DD/mm/yyyy
	t, err := utils.ParseTime(ud.DoB)
	if err != nil {
		return err
	}

	// unmarshal string input to jsonb to store in database
	nextOfKinInfo, drugAllergies, diseaseTreatmentHistory, err := utils.DeserializeUpdateRequest(ud)
	if err != nil {
		return err
	}

	// build model
	p, _ := s.repo.BuildPatientModelForUpdate(ud, t, hashedPassword, nextOfKinInfo, drugAllergies, diseaseTreatmentHistory, patient)

	// main logic
	return s.repo.UpdatePatient(ctx, patientID, p)
}
func (s *patientUsecase) DeletePatientById(ctx context.Context, patientId string) error {
	// validate input
	if ok := validator.IsValidId(patientId); !ok {
		return errors.New("patientId must not be empty")
	}
	patientID := uuid.MustParse(patientId)
	return s.repo.DeletePatientById(ctx, patientID)
}
