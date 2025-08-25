package usecase

import (
	"backend/internal/domain/dto"
	staffrepository "backend/internal/infrastructure/persistence/staff_repository"
	"backend/pkg/common/utils"
	"context"

	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
)

type AdminUsecase interface {
	AdminLogin(ctx context.Context, loginRequest *dto.LoginAdminRequest) (*dto.LoginResponse, error)
}

type adminUsecase struct {
	adminRepository staffrepository.AdminRepository
}

func NewAdminUsecase(adminRepository staffrepository.AdminRepository) AdminUsecase {
	return &adminUsecase{adminRepository: adminRepository}
}

func (s *adminUsecase) AdminLogin(ctx context.Context, loginRequest *dto.LoginAdminRequest) (*dto.LoginResponse, error) {
	admin, err := s.adminRepository.GetByUsername(ctx, loginRequest.Username)
	if err != nil {
		logrus.Errorf("Admin usecase layer %+v:", err)
		return nil, err
	}
	err = bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(loginRequest.Password))
	if err != nil {
		logrus.Errorf("Password is not matching: %+v", err)
		return nil, err
	}

	token := utils.GenerateToken(admin.AdminId.String(), "admin")

	resp := &dto.LoginResponse{
		Token:   token,
		User:    admin,
		Message: "Login Successfully",
	}
	return resp, nil
}
