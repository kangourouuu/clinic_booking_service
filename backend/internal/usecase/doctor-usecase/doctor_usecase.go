package doctorusecase

import (
	"backend/internal/domain/dto"
	"backend/internal/domain/dto/dtodoctor"
	doctorrepository "backend/internal/infrastructure/persistence/doctor-repository"
	"backend/pkg/common/pagination"
	"backend/pkg/common/utils"
	"backend/pkg/common/validator"
	doctorvalidator "backend/pkg/common/validator/doctor"

	// doctor_validator "backend/pkg/common/validator/doctor"
	"context"
	"errors"

	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
)

type DoctorUsecase interface {
	CreateDoctor(ctx context.Context, req *dtodoctor.CreateDoctorRequest) error
	GetDoctors(ctx context.Context, pagination *pagination.Pagination) ([]*dtodoctor.DoctorResponse, error)
	GetDoctorById(ctx context.Context, id string) (*dtodoctor.DoctorResponse, error)
	Login(ctx context.Context, req *dto.LoginRequest) (*dto.LoginResponse, error)
	UpdateDoctorById(ctx context.Context, id string, ud *dtodoctor.UpdateDoctorRequest) error
	DeleteDoctorById(ctx context.Context, id string) error
}

type doctorUsecase struct {
	repo doctorrepository.DoctorRepository
}

func NewDoctorUsecase(repo doctorrepository.DoctorRepository) DoctorUsecase {
	return &doctorUsecase{repo: repo}
}

func (s *doctorUsecase) CreateDoctor(ctx context.Context, req *dtodoctor.CreateDoctorRequest) error {

	t, err := utils.ParseTime(req.DoB)
	if err != nil {
		return err
	}

	// validate input fields
	if err := doctorvalidator.ValidatePatientFieldsForCreate(req); err != nil {
		return err
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), 10)
	if err != nil {
		return err
	}

	d := s.repo.BuildDoctorModelForCreate(req, t, hashedPassword)

	err = s.repo.CreateDoctor(ctx, d)
	if err != nil {
		return err
	}
	return nil
}

func (s *doctorUsecase) GetDoctors(ctx context.Context, pagination *pagination.Pagination) ([]*dtodoctor.DoctorResponse, error) {
	doctors, err := s.repo.GetDoctors(ctx, pagination)
	if err != nil {
		logrus.Errorf("failed to fetch data: %v", err)
		return nil, err
	}

	doctorList := dtodoctor.ConvertDoctorToDoctorList(doctors)
	return doctorList, nil
}

func (s *doctorUsecase) GetDoctorById(ctx context.Context, doctorId string) (*dtodoctor.DoctorResponse, error) {
	doctor, err := s.repo.GetDoctorById(ctx, doctorId)
	if err != nil {
		logrus.Errorf("failed to fetch data: %v", err)
		return nil, err
	}

	d := dtodoctor.ConvertDoctorToDoctorResponse(doctor)

	return d, nil
}

func (s *doctorUsecase) Login(ctx context.Context, req *dto.LoginRequest) (*dto.LoginResponse, error) {
	if ok := validator.IsValidLogin(req.PhoneNumber, req.Password); !ok {
		logrus.Error("Email and Password are required")
		return nil, errors.New("email and password are required")
	}

	d, err := s.repo.GetDoctorByPhoneNumber(ctx, req.PhoneNumber)
	if err != nil {
		logrus.Errorf("Doctor not found with email %s: %v", req.PhoneNumber, err)
		return nil, errors.New("invalid credentials")
	}

	err = bcrypt.CompareHashAndPassword([]byte(d.Password), []byte(req.Password))
	if err != nil {
		logrus.Errorf("Invalid password for email: %s", req.PhoneNumber)
		return nil, errors.New("invalid credentials")
	}

	token := utils.GenerateToken(d.ID.String(), "doctor")

	// err = s.redis.Set(context.Background(), "doctorId", token, 20*time.Minute)
	// if err != nil {
	// 	logrus.Warnf("failed to cache patient information: %s", err)
	// }

	resp := &dto.LoginResponse{
		Token:   token,
		User:    d,
		Message: "Login successfully",
	}

	return resp, nil
}

func (s *doctorUsecase) UpdateDoctorById(ctx context.Context, doctorId string, ud *dtodoctor.UpdateDoctorRequest) error {
	var updatedHasedPassword []byte
	if err := doctorvalidator.ValidatePatientFieldsForUpdate(ud); err != nil {
		return err
	}

	if ok := validator.IsValidId(doctorId); !ok {
		return errors.New("ID must not be empty")
	}

	t, err := utils.ParseTime(ud.DoB)
	if err != nil {
		return err
	}

	doctor, err := s.repo.GetDoctorById(ctx, doctorId)
	if err != nil {
		return err
	}

	if ud.Password != "" {
		if err := bcrypt.CompareHashAndPassword([]byte(doctor.Password), []byte(ud.Password)); err != nil {
			var hashErr error
			updatedHasedPassword, hashErr = bcrypt.GenerateFromPassword([]byte(ud.Password), 10)
			if hashErr != nil {
				logrus.Errorf("faield to hash password: %v", hashErr)
				return hashErr
			}
		} else {
			updatedHasedPassword = []byte(doctor.Password)
		}
	} else {
		updatedHasedPassword = []byte(doctor.Password)
	}

	d := s.repo.BuildDoctorModelForUpdate(ud, t, updatedHasedPassword)

	err = s.repo.UpdateDoctorBydId(ctx, doctorId, d)
	if err != nil {
		logrus.Errorf("failed to update Doctor: %v", err)
		return err
	}
	return nil
}

func (r *doctorUsecase) DeleteDoctorById(ctx context.Context, doctorId string) error {
	err := r.repo.DeleteDoctorById(ctx, doctorId)
	if err != nil {
		logrus.Errorf("failed to delete Doctor by ID %s: %v", doctorId, err)
		return err
	}
	return nil
}
