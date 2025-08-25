package staffrepository

import (
	staff "backend/internal/domain/staff/admin"
	"context"
	"os"

	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

type AdminRepository interface {
	GetByUsername(ctx context.Context, username string) (*staff.Admin, error)
}

type adminRepository struct {
	db *bun.DB
}

func NewAdminRepository(db *bun.DB) AdminRepository {
	repo := &adminRepository{db: db}
	_ = repo.migrate()
	return repo
}

func (r *adminRepository) GetByUsername(ctx context.Context, username string) (*staff.Admin, error) {
	admin := &staff.Admin{}
	err := r.db.NewSelect().Model(admin).Where("username = ?", username).Scan(ctx)
	if err != nil {
		logrus.Errorf("Repository layer: %+v", err)
		return nil ,err
	}
	return admin, nil
}

func (r *adminRepository) migrate() error {
	_, err := r.db.NewCreateTable().Model(&staff.Admin{}).Exec(context.Background())
	if err != nil {
		logrus.Error("Failed to migrate admin table: ", err)
		return err
	}

	password := os.Getenv("ADMIN_PASSWORD")
	logrus.Info(password)
	admin := &staff.Admin{
		Username: "admin",
		Password: password,
	}
	_, err = r.db.NewInsert().Model(admin).Exec(context.Background())
	if err != nil {
		logrus.Errorf("Repository layer: %+v: ",err)
		return err
	}
	return nil
}
