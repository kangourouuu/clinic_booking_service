package persistence

import (
	"backend/internal/domain/examination/service"
	"context"
	"database/sql"
	"errors"

	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

type ServiceSubCategory interface {
	SeedSubcategory(ctx context.Context) error
	GetSubCategoryById(ctx context.Context, subCategoryId uint16) (*service.ServiceSubCategories, error)
	GetAllSubCategoriesByCategoryId(ctx context.Context, categoryId uint16) ([]*service.ServiceSubCategories, error)
}

type serviceSubCategoryRepository struct {
	db *bun.DB
}

func NewServiceSubCategoryRepository(db *bun.DB) ServiceSubCategory {
	repo := &serviceSubCategoryRepository{db: db}
	_ = repo.migrate()
	return repo
}

func (r *serviceSubCategoryRepository) SeedSubcategory(ctx context.Context) error {
	sc := []*service.ServiceSubCategories{
		{
			ServiceSubCategoryId: 0,
			ServiceCategoryId:    1,
		},
		{
			ServiceSubCategoryId: 1,
			Name:                 "Nội khoa",
			ServiceCategoryId:    2,
		},
		{
			ServiceSubCategoryId: 2,
			Name:                 "Ngoại khoa",
			ServiceCategoryId:    2,
		},
		{
			ServiceSubCategoryId: 3,
			Name:                 "Sản - Phụ khoa",
			ServiceCategoryId:    2,
		},
		{
			ServiceSubCategoryId: 4,
			Name:                 "Nhi khoa",
			ServiceCategoryId:    2,
		},
		{
			ServiceSubCategoryId: 5,
			Name:                 "Tai - Mũi - Họng",
			ServiceCategoryId:    2,
		},
		{
			ServiceSubCategoryId: 6,
			Name:                 "Da liễu",
			ServiceCategoryId:    2,
		},
		{
			ServiceSubCategoryId: 7,
			Name:                 "Xét nghiệm",
			ServiceCategoryId:    3,
		},
		{
			ServiceSubCategoryId: 8,
			Name:                 "Chẩn đoán hình ảnh",
			ServiceCategoryId:    3,
		},
		{
			ServiceSubCategoryId: 9,
			Name:                 "Tiêm chủng",
			ServiceCategoryId:    4,
		},
	}

	count, err := r.db.NewSelect().Model((*service.ServiceSubCategories)(nil)).Count(ctx)
	if err != nil {
		return err
	}

	if count == 0 {
		_, err := r.db.NewInsert().Model(&sc).Exec(ctx)
		if err != nil {
			return err
		}
	}
	logrus.Info("Seed subcategory succeessfully")
	return nil
}

func (r *serviceSubCategoryRepository) GetSubCategoryById(ctx context.Context, subCategoryId uint16) (*service.ServiceSubCategories, error) {
	var sc service.ServiceSubCategories

	err := r.db.NewSelect().Model(&sc).Where("service_subcategory_id = ?", subCategoryId).Limit(1).Scan(ctx)
	if err != nil {
		return nil, err
	}
	return &sc, nil
}

func (r *serviceSubCategoryRepository) GetAllSubCategoriesByCategoryId(ctx context.Context, categoryId uint16) ([]*service.ServiceSubCategories, error) {
	var sc []*service.ServiceSubCategories

	err := r.db.NewSelect().Model(&sc).Where("service_category_id = ?", categoryId).Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, err
		}
		return nil, err
	}
	return sc, nil
}

func (r *serviceSubCategoryRepository) migrate() error {
	ctx := context.Background()
	_, err := r.db.NewCreateTable().
		Model(&service.ServiceSubCategories{}).
		IfNotExists().
		ForeignKey(`("service_category_id") REFERENCES "service_categories" ("service_category_id") ON DELETE CASCADE`).
		Exec(ctx)
	if err != nil {
		return err
	}
	return nil
}
