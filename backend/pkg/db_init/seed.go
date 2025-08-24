package dbinit

import (
	persistence "backend/internal/infrastructure/persistence/service_repository"
	staffrepository "backend/internal/infrastructure/persistence/staff_repository/faculty_repository"
	"context"

	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func SeedDataBase(ctx context.Context, db *bun.DB) error {
	categoryRepo := persistence.NewServiceCategoryRepository(db)
	if err := categoryRepo.SeedCategory(ctx); err != nil {
		logrus.Error("Failed to seed categories", err)
	}

	subCategoryRepo := persistence.NewServiceSubCategoryRepository(db)
	if err := subCategoryRepo.SeedSubcategory(ctx); err != nil {
		logrus.Error("Failed to seed sub categories", err)
	}

	serviceRepo := persistence.NewServiceRepository(db)
	if err := serviceRepo.SeedService(context.Background()); err != nil {
		logrus.Error("Failed to seed service", err)
	}

	facultyRepo := staffrepository.NewFacultyRepository(db)
	if err := facultyRepo.SeedFaculty(ctx); err != nil {
		logrus.Error("Failed to seed faculty", err)
	}
	return nil
}
