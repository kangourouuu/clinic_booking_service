package nurserepository

import (
	dtonurse "backend/internal/domain/dto/dto_nurse"
	"backend/internal/domain/staff/nurse"
	"backend/pkg/common/pagination"
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

type NurseRepository interface {
	CreateNurse(ctx context.Context, n *nurse.Nurse) error
	GetNurses(ctx context.Context, pagination *pagination.Pagination) ([]*nurse.Nurse, error)
	GetNurseById(ctx context.Context, id string) (*nurse.Nurse, error)
	GetNurseByPhoneNumber(ctx context.Context, phoneNumber string) (*nurse.Nurse, error)
	UpdateNurseBydId(ctx context.Context, id string, n *nurse.Nurse) error
	DeleteNurseById(ctx context.Context, id string) error
	BuildNurseModelForCreate(req *dtonurse.CreateNurseRequest, t time.Time, hashedPassword []byte) *nurse.Nurse
	BuildNurseModelForUpdate(req *dtonurse.UpdateNurseRequest, t time.Time, hashedPassword []byte) *nurse.Nurse
}

type nurseRepo struct {
	db *bun.DB
}

func NewNurseRepo(db *bun.DB) NurseRepository {
	repo := &nurseRepo{db: db}
	_ = repo.migrate()
	return repo
}

func (r *nurseRepo) migrate() error {
	_, err := r.db.NewCreateTable().Model(&nurse.Nurse{}).IfNotExists().Exec(context.Background())
	if err != nil {
		logrus.Errorf("Failed to migrate table: %v", err)
		return err
	}
	logrus.Info("Successfully migrated table nurse")
	return nil
}

func (r *nurseRepo) BuildNurseModelForCreate(req *dtonurse.CreateNurseRequest, t time.Time, hashedPassword []byte) *nurse.Nurse {
	nurseId := uuid.New()
	n := &nurse.Nurse{
		ID:          nurseId,
		FullName:    req.FullName,
		DoB:         t,
		Gender:      req.Gender,
		PhoneNumber: req.PhoneNumber,
		Password:    string(hashedPassword),
		Faculty:     req.Faculty,
		Email:       req.Email,
		CreatedAt:   time.Now(),
	}
	return n
}

func (r *nurseRepo) BuildNurseModelForUpdate(req *dtonurse.UpdateNurseRequest, t time.Time, hashedPassword []byte) *nurse.Nurse {
	nurseId := uuid.New()
	n := &nurse.Nurse{
		ID:          nurseId,
		FullName:    req.FullName,
		DoB:         t,
		Gender:      req.Gender,
		PhoneNumber: req.PhoneNumber,
		Password:    string(hashedPassword),
		Faculty:     req.Faculty,
		Email:       req.Email,
		UpdatedAt:   time.Now(),
	}
	return n
}

func (r *nurseRepo) CreateNurse(ctx context.Context, n *nurse.Nurse) error {
	_, err := r.db.NewInsert().Model(n).Exec(ctx)
	if err != nil {
		logrus.Errorf("Failed to insert nurse data: %v", err)
		return err
	}
	return nil
}

func (r *nurseRepo) GetNurseByPhoneNumber(ctx context.Context, phoneNumber string) (*nurse.Nurse, error) {
	n := &nurse.Nurse{}
	err := r.db.NewSelect().Model(n).Where("phone_number = ?", phoneNumber).Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("failed to get nurse")
		}
		logrus.Errorf("Failed to get nurse by ID %s: %v", phoneNumber, err)
		return nil, err
	}
	return n, nil
}

func (r *nurseRepo) GetNurses(ctx context.Context, pagination *pagination.Pagination) ([]*nurse.Nurse, error) {
	var n []*nurse.Nurse
	limit := pagination.GetLimit()
	offset := pagination.GetOffSet()

	total, err := r.db.NewSelect().Model(&n).Count(ctx)
	if err != nil {
		return nil, err
	}
	pagination.Total = int64(total)

	err = r.db.NewSelect().Model(&n).Limit(limit).Offset(offset).Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("nurse not found")
		}
		logrus.Errorf("Failed to get nurse")
	}
	return n, nil
}

func (r *nurseRepo) GetNurseById(ctx context.Context, nurseId string) (*nurse.Nurse, error) {
	n := &nurse.Nurse{}
	err := r.db.NewSelect().Model(n).Where("nurse_id = ?", nurseId).Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("failed to get nurse")
		}
		logrus.Errorf("Failed to get nurse by ID %s: %v", nurseId, err)
		return nil, err
	}
	return n, nil
}

func (r *nurseRepo) UpdateNurseBydId(ctx context.Context, nurseId string, n *nurse.Nurse) error {
	_, err := r.db.NewUpdate().Model(n).Where("nurse_id = ?", nurseId).Exec(ctx)
	if err != nil {
		return err
	}
	return nil
}

func (r *nurseRepo) DeleteNurseById(ctx context.Context, nurseId string) error {
	_, err := r.db.NewDelete().Model(&nurse.Nurse{}).Where("nurse_id = ?", nurseId).Exec(ctx)
	if err != nil {
		logrus.Errorf("Failed to delete nurse by ID %s: %v", nurseId, err)
		return err
	}
	return nil
}
