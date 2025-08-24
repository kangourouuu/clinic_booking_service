package persistence

import (
	"backend/internal/domain/dto/dtoservice"
	"backend/internal/domain/examination/service"
	"context"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type ServiceRepository interface {
	GetServiceListBySubcategoryId(ctx context.Context, subcategoryId uint16) ([]*service.Services, error)
	GetServiceByServiceId(ctx context.Context, serviceId uuid.UUID) (*service.Services, error)
	SeedService(ctx context.Context) error

	// admin
	CreateService(ctx context.Context, serviceModel *service.Services) error
	UpdateService(ctx context.Context, serviceId uuid.UUID, serviceModel *service.Services) error
	DeleteService(ctx context.Context, serviceId uuid.UUID) error

	BuildServiceModelForCreate(d *dtoservice.CreateServiceRequest) *service.Services
	BuildServiceModelForUpdate(ud *dtoservice.UpdateServiceRequest) *service.Services
}

type serviceRepository struct {
	db *bun.DB
}

func NewServiceRepository(db *bun.DB) ServiceRepository {
	repo := &serviceRepository{db: db}
	_ = repo.migrate()
	return repo
}

func (r *serviceRepository) BuildServiceModelForCreate(d *dtoservice.CreateServiceRequest) *service.Services {
	service := &service.Services{
		ServiceId:   uuid.New(),
		ServiceName: d.ServiceName,
		Cost:        d.Cost,
	}
	return service
}

func (r *serviceRepository) BuildServiceModelForUpdate(ud *dtoservice.UpdateServiceRequest) *service.Services {
	service := &service.Services{
		ServiceId:   uuid.New(),
		ServiceName: ud.ServiceName,
		Cost:        ud.Cost,
	}
	return service
}

func (r *serviceRepository) CreateService(ctx context.Context, serviceModel *service.Services) error {

	_, err := r.db.NewInsert().Model(serviceModel).Exec(ctx)
	if err != nil {
		return err
	}

	return nil

}

func (r *serviceRepository) GetServiceListBySubcategoryId(ctx context.Context, subcategoryId uint16) ([]*service.Services, error) {
	var serviceList []*service.Services

	err := r.db.NewSelect().Model(&serviceList).Where("service_subcategory_id = ?", subcategoryId).Scan(ctx)
	if err != nil {
		return nil, err
	}

	return serviceList, nil
}

func (r *serviceRepository) GetServiceByServiceId(ctx context.Context, serviceId uuid.UUID) (*service.Services, error) {

	var service service.Services

	err := r.db.NewSelect().Model(&service).Where("service_id = ?", serviceId).Scan(ctx)
	if err != nil {
		return nil, err
	}

	return &service, nil
}

// admin
func (r *serviceRepository) UpdateService(ctx context.Context, serviceId uuid.UUID, serviceModel *service.Services) error {

	_, err := r.db.NewUpdate().Model((*service.Services)(nil)).Where("service_id = ?", serviceId).Exec(ctx)
	if err != nil {
		return err
	}

	return nil
}
func (r *serviceRepository) DeleteService(ctx context.Context, serviceId uuid.UUID) error {

	_, err := r.db.NewDelete().Model((*service.Services)(nil)).Where("service_id = ?", serviceId).Exec(ctx)
	if err != nil {
		return err
	}

	return nil
}

func (r *serviceRepository) SeedService(ctx context.Context) error {
	services := []*service.Services{
		// 1. Dịch vụ khám bệnh cơ bản
		{ServiceId: uuid.New(), ServiceCode: "DV001", ServiceName: "Khám sức khỏe tổng quát", Cost: 2500000, ServiceSubCategoryId: 0},
		{ServiceId: uuid.New(), ServiceCode: "DV002", ServiceName: "Khám định kỳ", Cost: 3000000, ServiceSubCategoryId: 0},

		// 2. Dịch vụ khám chuyên khoa
		// a. Nội khoa
		{ServiceId: uuid.New(), ServiceCode: "DV101", ServiceName: "Khám nội tổng quát", Cost: 500000, ServiceSubCategoryId: 1},
		{ServiceId: uuid.New(), ServiceCode: "DV102", ServiceName: "Khám tim mạch", Cost: 350000, ServiceSubCategoryId: 1},
		{ServiceId: uuid.New(), ServiceCode: "DV103", ServiceName: "Khám hô hấp", Cost: 400000, ServiceSubCategoryId: 1},
		{ServiceId: uuid.New(), ServiceCode: "DV104", ServiceName: "Khám tiêu hóa", Cost: 400000, ServiceSubCategoryId: 1},
		{ServiceId: uuid.New(), ServiceCode: "DV105", ServiceName: "Khám thần kinh", Cost: 700000, ServiceSubCategoryId: 1},

		// b. Ngoại khoa
		{ServiceId: uuid.New(), ServiceCode: "DV201", ServiceName: "Khám ngoại tổng quát", Cost: 420000, ServiceSubCategoryId: 2},
		{ServiceId: uuid.New(), ServiceCode: "DV202", ServiceName: "Khám chấn thương chỉnh hình", Cost: 800000, ServiceSubCategoryId: 2},
		{ServiceId: uuid.New(), ServiceCode: "DV203", ServiceName: "Khám ngoại thần kinh", Cost: 900000, ServiceSubCategoryId: 2},
		{ServiceId: uuid.New(), ServiceCode: "DV204", ServiceName: "Khám hậu môn - trực tràng", Cost: 300000, ServiceSubCategoryId: 2},

		// c. Sản - Phụ khoa
		{ServiceId: uuid.New(), ServiceCode: "DV301", ServiceName: "Khám phụ khoa", Cost: 500000, ServiceSubCategoryId: 3},
		{ServiceId: uuid.New(), ServiceCode: "DV302", ServiceName: "Khám thai", Cost: 1100000, ServiceSubCategoryId: 3},
		{ServiceId: uuid.New(), ServiceCode: "DV303", ServiceName: "Siêu âm thai", Cost: 1200000, ServiceSubCategoryId: 3},
		{ServiceId: uuid.New(), ServiceCode: "DV304", ServiceName: "Soi cổ tử cung", Cost: 1500000, ServiceSubCategoryId: 3},

		// d. Nhi khoa
		{ServiceId: uuid.New(), ServiceCode: "DV401", ServiceName: "Khám nhi tổng quát", Cost: 1500000, ServiceSubCategoryId: 4},
		{ServiceId: uuid.New(), ServiceCode: "DV402", ServiceName: "Khám dinh dưỡng trẻ em", Cost: 1700000, ServiceSubCategoryId: 4},
		{ServiceId: uuid.New(), ServiceCode: "DV403", ServiceName: "Khám phát triển tâm thần - vận động trẻ em", Cost: 700000, ServiceSubCategoryId: 4},

		// e. Tai - Mũi - Họng
		{ServiceId: uuid.New(), ServiceCode: "DV501", ServiceName: "Khám tai", Cost: 600000, ServiceSubCategoryId: 5},
		{ServiceId: uuid.New(), ServiceCode: "DV502", ServiceName: "Khám mũi", Cost: 600000, ServiceSubCategoryId: 5},
		{ServiceId: uuid.New(), ServiceCode: "DV503", ServiceName: "Khám họng", Cost: 600000, ServiceSubCategoryId: 5},
		{ServiceId: uuid.New(), ServiceCode: "DV504", ServiceName: "Nội soi tai mũi họng", Cost: 600000, ServiceSubCategoryId: 5},

		// f. Da liễu
		{ServiceId: uuid.New(), ServiceCode: "DV601", ServiceName: "Khám da liễu", Cost: 500000, ServiceSubCategoryId: 6},
		{ServiceId: uuid.New(), ServiceCode: "DV602", ServiceName: "Soi da", Cost: 700000, ServiceSubCategoryId: 6},
		{ServiceId: uuid.New(), ServiceCode: "DV603", ServiceName: "Điều trị mụn / nám", Cost: 2500000, ServiceSubCategoryId: 6},

		// 3. Cận lâm sàng
		// a. Xét nghiệm
		{ServiceId: uuid.New(), ServiceCode: "DV701", ServiceName: "Xét nghiệm máu", Cost: 300000, ServiceSubCategoryId: 7},
		{ServiceId: uuid.New(), ServiceCode: "DV702", ServiceName: "Xét nghiệm nước tiểu", Cost: 300000, ServiceSubCategoryId: 7},
		{ServiceId: uuid.New(), ServiceCode: "DV703", ServiceName: "Xét nghiệm sinh hóa", Cost: 300000, ServiceSubCategoryId: 7},
		{ServiceId: uuid.New(), ServiceCode: "DV704", ServiceName: "Xét nghiệm huyết học", Cost: 300000, ServiceSubCategoryId: 7},
		{ServiceId: uuid.New(), ServiceCode: "DV705", ServiceName: "Xét nghiệm tầm soát ung thư", Cost: 400000, ServiceSubCategoryId: 7},

		// b. Chẩn đoán hình ảnh
		{ServiceId: uuid.New(), ServiceCode: "DV801", ServiceName: "Siêu âm tổng quát", Cost: 900000, ServiceSubCategoryId: 8},
		{ServiceId: uuid.New(), ServiceCode: "DV802", ServiceName: "Siêu âm ổ bụng", Cost: 900000, ServiceSubCategoryId: 8},
		{ServiceId: uuid.New(), ServiceCode: "DV803", ServiceName: "Siêu âm tuyến giáp", Cost: 900000, ServiceSubCategoryId: 8},
		{ServiceId: uuid.New(), ServiceCode: "DV804", ServiceName: "Siêu âm tim", Cost: 900000, ServiceSubCategoryId: 8},
		{ServiceId: uuid.New(), ServiceCode: "DV805", ServiceName: "X-quang phổi", Cost: 400000, ServiceSubCategoryId: 8},
		{ServiceId: uuid.New(), ServiceCode: "DV806", ServiceName: "Chụp CT-scan", Cost: 300000, ServiceSubCategoryId: 8},
		{ServiceId: uuid.New(), ServiceCode: "DV807", ServiceName: "Chụp cộng hưởng từ (MRI)", Cost: 300000, ServiceSubCategoryId: 8},

		//  4. Dịch vụ tiêm chủng
		{ServiceId: uuid.New(), ServiceCode: "DV901", ServiceName: "Tiêm vaccine ngừa cúm", Cost: 800000, ServiceSubCategoryId: 9},
		{ServiceId: uuid.New(), ServiceCode: "DV902", ServiceName: "Tiêm vaccine viêm gan B", Cost: 800000, ServiceSubCategoryId: 9},
		{ServiceId: uuid.New(), ServiceCode: "DV903", ServiceName: "Tiêm vaccine HPV", Cost: 800000, ServiceSubCategoryId: 9},
		{ServiceId: uuid.New(), ServiceCode: "DV904", ServiceName: "Tiêm vaccine trẻ em định kỳ", Cost: 1200000, ServiceSubCategoryId: 9},
	}

	count, err := r.db.NewSelect().Model((*service.Services)(nil)).Count(ctx)
	if err != nil {
		return err
	}

	if count == 0 {
		_, err := r.db.NewInsert().Model(&services).Exec(ctx)
		if err != nil {
			return err
		}
	}
	return nil
}

func (r *serviceRepository) migrate() error {
	ctx := context.Background()
	_, err := r.db.NewCreateTable().Model(&service.Services{}).IfNotExists().ForeignKey(`("service_subcategory_id") REFERENCES "service_subcategories" ("service_subcategory_id") ON DELETE CASCADE`).Exec(ctx)
	if err != nil {
		return err
	}
	return nil
}
