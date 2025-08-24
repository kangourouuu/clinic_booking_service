package doctorrepository

import (
	"backend/internal/domain/staff/doctor"
	"backend/internal/domain/dto/dtodoctor"
	"backend/pkg/common/pagination"
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

type DoctorRepository interface {
	CreateDoctor(ctx context.Context, n *doctor.Doctor) error
	GetDoctors(ctx context.Context, pagination *pagination.Pagination) ([]*doctor.Doctor, error)
	GetDoctorById(ctx context.Context, id string) (*doctor.Doctor, error)
	GetDoctorByPhoneNumber(ctx context.Context, phoneNumber string) (*doctor.Doctor, error)
	UpdateDoctorBydId(ctx context.Context, id string, n *doctor.Doctor) error
	DeleteDoctorById(ctx context.Context, id string) error
	BuildDoctorModelForCreate(req *dtodoctor.CreateDoctorRequest, t time.Time, hashedPassword []byte) *doctor.Doctor
	BuildDoctorModelForUpdate(req *dtodoctor.UpdateDoctorRequest, t time.Time, hashedPassword []byte) *doctor.Doctor
}

type doctorRepo struct {
	db *bun.DB
}

func NewDoctorRepo(db *bun.DB) DoctorRepository {
	repo := &doctorRepo{db: db}
	_ = repo.migrate()
	return repo
}

func (r *doctorRepo) migrate() error {
	_, err := r.db.NewCreateTable().Model(&doctor.Doctor{}).IfNotExists().Exec(context.Background())
	if err != nil {
		logrus.Errorf("Failed to migrate table: %v", err)
		return err
	}
	logrus.Info("Successfully migrated table Doctor")
	return nil
}

func (r *doctorRepo) BuildDoctorModelForCreate(req *dtodoctor.CreateDoctorRequest, t time.Time, hashedPassword []byte) *doctor.Doctor {
	doctorId := uuid.New()
	d := &doctor.Doctor{
		ID:          doctorId,
		FullName:    req.FullName,
		DoB:         t,
		Gender:      req.Gender,
		PhoneNumber: req.PhoneNumber,
		Password:    string(hashedPassword),
		Faculty:     req.Faculty,
		Email:       req.Email,
		CreatedAt:   time.Now(),
	}
	return d
}

func (r *doctorRepo) BuildDoctorModelForUpdate(req *dtodoctor.UpdateDoctorRequest, t time.Time, hashedPassword []byte) *doctor.Doctor {
	doctorId := uuid.New()
	d := &doctor.Doctor{
		ID:          doctorId,
		FullName:    req.FullName,
		DoB:         t,
		Gender:      req.Gender,
		PhoneNumber: req.PhoneNumber,
		Password:    string(hashedPassword),
		Faculty:     req.Faculty,
		Email:       req.Email,
		UpdatedAt:   time.Now(),
	}
	return d
}

func (r *doctorRepo) CreateDoctor(ctx context.Context, d *doctor.Doctor) error {
	_, err := r.db.NewInsert().Model(d).Exec(ctx)
	if err != nil {
		logrus.Errorf("Failed to insert Doctor data: %v", err)
		return err
	}
	return nil
}

func (r *doctorRepo) GetDoctorByPhoneNumber(ctx context.Context, phoneNumber string) (*doctor.Doctor, error) {
	d := &doctor.Doctor{}
	err := r.db.NewSelect().Model(d).Where("phone_number = ?", phoneNumber).Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("failed to get Doctor")
		}
		logrus.Errorf("Failed to get Doctor by ID %s: %v", phoneNumber, err)
		return nil, err
	}
	return d, nil
}

func (r *doctorRepo) GetDoctors(ctx context.Context, pagination *pagination.Pagination) ([]*doctor.Doctor, error) {
	var d []*doctor.Doctor
	limit := pagination.GetLimit()
	offset := pagination.GetOffSet()

	total, err := r.db.NewSelect().Model(&d).Count(ctx)
	if err != nil {
		return nil, err
	}
	pagination.Total = int64(total)

	err = r.db.NewSelect().Model(&d).Limit(limit).Offset(offset).Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("doctor not found")
		}
		logrus.Errorf("Failed to get Doctor")
	}
	return d, nil
}

func (r *doctorRepo) GetDoctorById(ctx context.Context, doctorId string) (*doctor.Doctor, error) {
	d := &doctor.Doctor{}
	err := r.db.NewSelect().Model(d).Where("doctor_id = ?", doctorId).Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("failed to get Doctor")
		}
		logrus.Errorf("Failed to get Doctor by ID %s: %v", doctorId, err)
		return nil, err
	}
	return d, nil
}

func (r *doctorRepo) UpdateDoctorBydId(ctx context.Context, doctorId string, d *doctor.Doctor) error {
	_, err := r.db.NewUpdate().Where("doctor_id = ?", doctorId).Model(d).Exec(ctx)
	if err != nil {
		return err
	}
	return nil
}

func (r *doctorRepo) DeleteDoctorById(ctx context.Context, doctorId string) error {
	_, err := r.db.NewDelete().Model(&doctor.Doctor{}).Where("doctor_id = ?", doctorId).Exec(ctx)
	if err != nil {
		logrus.Errorf("Failed to delete Doctor by ID %s: %v", doctorId, err)
		return err
	}
	return nil
}
