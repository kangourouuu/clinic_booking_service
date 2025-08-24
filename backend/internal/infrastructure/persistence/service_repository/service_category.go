package persistence

import (
	"backend/internal/domain/examination/service"
	"context"
	"database/sql"
	"errors"

	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

type ServiceCategoryRepository interface {
	SeedCategory(ctx context.Context) error
	GetCategoryById(ctx context.Context, categoryId uint16) (*service.ServiceCategories, error)
	GetAllCategories(ctx context.Context) ([]*service.ServiceCategories, error)
}

type serviceCategoryRepository struct {
	db *bun.DB
}

func NewServiceCategoryRepository(db *bun.DB) ServiceCategoryRepository {
	repo := &serviceCategoryRepository{db: db}
	_ = repo.migrate()
	return repo
}

func (r *serviceCategoryRepository) SeedCategory(ctx context.Context) error {
	sc := []service.ServiceCategories{
		{
			ServiceCategoryId: 1,
			Name:              "Dịch vụ Khám cơ bản",
		},
		{
			ServiceCategoryId: 2,
			Name:              "Dịch vụ Khám chuyên khoa",
		},
		{
			ServiceCategoryId: 3,
			Name:              "Dịch vụ Cận lâm sàng",
		},
		{
			ServiceCategoryId: 4,
			Name:              "Dịch vụ Tiêm chủng",
		},
	}

	count, err := r.db.NewSelect().Model((*service.ServiceCategories)(nil)).Count(ctx)
	if err != nil {
		return err
	}

	if count == 0 {
		_, err := r.db.NewInsert().Model(&sc).Exec(ctx)
		if err != nil {
			return err
		}
	}
	logrus.Info("Seed category successfully")
	return nil
}

func (r *serviceCategoryRepository) GetCategoryById(ctx context.Context, categoryId uint16) (*service.ServiceCategories, error) {
	var sc service.ServiceCategories

	err := r.db.NewSelect().Model(&sc).Where("service_category_id = ?", categoryId).Limit(1).Scan(ctx)
	if err != nil {
		return nil, err
	}
	return &sc, nil
}

func (r *serviceCategoryRepository) GetAllCategories(ctx context.Context) ([]*service.ServiceCategories, error) {
	var sc []*service.ServiceCategories

	err := r.db.NewSelect().Model(&sc).Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, err
		}
		return nil, err
	}
	return sc, nil
}

func (r *serviceCategoryRepository) migrate() error {
	ctx := context.Background()
	_, err := r.db.NewCreateTable().
		Model(&service.ServiceCategories{}).
		IfNotExists().
		Exec(ctx)
	if err != nil {
		return err
	}
	return nil
}
