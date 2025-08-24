package nurse_usecase

import (
	"backend/internal/domain/dto"
	dtonurse "backend/internal/domain/dto/dto_nurse"
	nurserepository "backend/internal/infrastructure/persistence/staff_repository/nurse_repository"
	"backend/pkg/common/pagination"
	"backend/pkg/common/utils"
	"backend/pkg/common/validator"
	nursevalidator "backend/pkg/common/validator/nurse"
	"context"
	"errors"

	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
)

type NurseUsecase interface {
	CreateNurse(ctx context.Context, d *dtonurse.CreateNurseRequest) error
	GetNurses(ctx context.Context, pagination *pagination.Pagination) ([]*dtonurse.NurseResponse, error)
	GetNurseById(ctx context.Context, id string) (*dtonurse.NurseResponse, error)
	Login(ctx context.Context, req *dto.LoginRequest) (*dto.LoginResponse, error)
	UpdateNurseById(ctx context.Context, id string, ud *dtonurse.UpdateNurseRequest) error
	DeleteNurseById(ctx context.Context, id string) error
}

type nurseUsecase struct {
	repo nurserepository.NurseRepository
}

func NewNurseService(repo nurserepository.NurseRepository) NurseUsecase {
	return &nurseUsecase{repo: repo}
}

func (s *nurseUsecase) CreateNurse(ctx context.Context, d *dtonurse.CreateNurseRequest) error {

	t, err := utils.ParseTime(d.DoB)
	if err != nil {
		return err
	}

	if err := nursevalidator.ValidateNurseFieldsForCreate(d); err != nil {
		return err
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(d.Password), 10)
	if err != nil {
		return err
	}

	n := s.repo.BuildNurseModelForCreate(d, t, hashedPassword)

	err = s.repo.CreateNurse(ctx, n)
	if err != nil {
		return err
	}
	return nil
}

func (s *nurseUsecase) GetNurses(ctx context.Context, pagination *pagination.Pagination) ([]*dtonurse.NurseResponse, error) {
	nurses, err := s.repo.GetNurses(ctx, pagination)
	if err != nil {
		logrus.Errorf("failed to fetch data: %v", err)
		return nil, err
	}

	nurseList := dtonurse.ConvertNurseToNurseList(nurses)
	return nurseList, nil
}

func (s *nurseUsecase) GetNurseById(ctx context.Context, nurseId string) (*dtonurse.NurseResponse, error) {
	nurse, err := s.repo.GetNurseById(ctx, nurseId)
	if err != nil {
		logrus.Errorf("failed to fetch data: %v", err)
		return nil, err
	}

	n := dtonurse.ConvertNurseToNurseResponse(nurse)
	return n, nil
}

func (s *nurseUsecase) Login(ctx context.Context, req *dto.LoginRequest) (*dto.LoginResponse, error) {
	if ok := validator.IsValidLogin(req.PhoneNumber, req.Password); !ok {
		logrus.Error("Email and Password are required")
		return nil, errors.New("email and password are required")
	}

	n, err := s.repo.GetNurseByPhoneNumber(ctx, req.PhoneNumber)
	if err != nil {
		logrus.Errorf("Nurse not found with email %s: %v", req.PhoneNumber, err)
		return nil, errors.New("invalid credentials")
	}

	err = bcrypt.CompareHashAndPassword([]byte(n.Password), []byte(req.Password))
	if err != nil {
		logrus.Errorf("Invalid password for email: %s", req.PhoneNumber)
		return nil, errors.New("invalid credentials")
	}

	token := utils.GenerateToken(n.ID.String(), "nurse")

	resp := &dto.LoginResponse{
		Token:   token,
		User:    n, // Include nurse data
		Message: "Login successfully",
	}

	return resp, nil
}

func (s *nurseUsecase) UpdateNurseById(ctx context.Context, nurseId string, ud *dtonurse.UpdateNurseRequest) error {
	var updatedHashedPassword []byte

	// Validate nurse ID
	if ok := validator.IsValidId(nurseId); !ok {
		return errors.New("invalid nurse ID")
	}

	if err := nursevalidator.ValidateNurseFieldsForUpdate(ud); err != nil {
		return err
	}

	t, err := utils.ParseTime(ud.DoB)
	if err != nil {
		return err
	}

	nurse, err := s.GetNurseById(ctx, nurseId)
	if err != nil {
		return err
	}

	if ud.Password != "" {
		if err := bcrypt.CompareHashAndPassword([]byte(nurse.Password), []byte(ud.Password)); err != nil {
			var hashErr error
			updatedHashedPassword, hashErr = bcrypt.GenerateFromPassword([]byte(ud.Password), 10)
			if hashErr != nil {
				logrus.Errorf("failed to hash password: %v", hashErr)
				return hashErr
			}
		} else {
			updatedHashedPassword = []byte(nurse.Password)
		}
	} else {
		updatedHashedPassword = []byte(nurse.Password)
	}

	n := s.repo.BuildNurseModelForUpdate(ud, t, updatedHashedPassword)

	err = s.repo.UpdateNurseBydId(ctx, nurseId, n)
	if err != nil {
		logrus.Errorf("failed to update nurse: %v", err)
		return err
	}
	return nil
}

func (r *nurseUsecase) DeleteNurseById(ctx context.Context, nurseId string) error {
	err := r.repo.DeleteNurseById(ctx, nurseId)
	if err != nil {
		logrus.Errorf("failed to delete nurse by ID %s: %v", nurseId, err)
		return err
	}
	return nil
}
