package staffrepository

import (
	staff "backend/internal/domain/staff/faculty"
	"context"

	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

type FacultyRepository interface {
	SeedFaculty(ctx context.Context) error
}

type facultyRepository struct {
	db *bun.DB
}

func NewFacultyRepository(db *bun.DB) FacultyRepository {
	repo := &facultyRepository{db: db}
	_ = repo.migrate()
	return repo
}

func (r *facultyRepository) SeedFaculty(ctx context.Context) error {
	faculty := []*staff.Faculty{
		{
			FacultyId:   1,
			FacultyCode: "IM",
			FacultyName: "Internal Medicine",
		},
		{
			FacultyId:   2,
			FacultyCode: "SUR",
			FacultyName: "Surgery",
		},
		{
			FacultyId:   3,
			FacultyCode: "OBGYN",
			FacultyName: "Obstetrics & Gynecology",
		},
		{
			FacultyId:   4,
			FacultyCode: "PED",
			FacultyName: "Pediatrics",
		},
		{
			FacultyId:   5,
			FacultyCode: "ENT",
			FacultyName: "Ear, Nose & Throat",
		},
		{
			FacultyId:   6,
			FacultyCode: "DERM",
			FacultyName: "Dermatology",
		},
		{
			FacultyId:   7,
			FacultyCode: "PARA",
			FacultyName: "Paraclinical",
		},
		{
			FacultyId:   8,
			FacultyCode: "PREV",
			FacultyName: "Preventive Medicine / Vaccination",
		},
	}

	count, err := r.db.NewSelect().Model(&faculty).Count(ctx)
	if err != nil {
		logrus.Errorf("Faculty repository layer: %s", err)
		return err
	}

	if count == 0 {
		_, err := r.db.NewInsert().Model(&faculty).Exec(ctx)
		if err != nil {
			logrus.Errorf("Faculty repository layer: %s", err)
			return err
		}
	}

	return nil
}

func (r *facultyRepository) migrate() error {
	ctx := context.Background()
	_, err := r.db.NewCreateTable().Model(&staff.Faculty{}).IfNotExists().Exec(ctx)
	if err != nil {
		logrus.Errorf("Failed to migrate faculty table: %s", err)
		return err
	}
	return nil
}
