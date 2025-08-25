package doctorrepository

import (
	"backend/internal/domain/dto/dtodoctor"
	"backend/internal/domain/patient"
	"context"

	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

type DrugReceiptRepository interface {
	CreateDrugReceipt(ctx context.Context, dr *patient.DrugReceipt) error
	BuildModelForRequest(dto *dtodoctor.CreateDrugReceiptRequest) *patient.DrugReceipt
}

type drugReceiptRepository struct {
	db *bun.DB
}

func NewDrugReceiptRepository(db *bun.DB) DrugReceiptRepository {
	return &drugReceiptRepository{db: db}
}

func (r *drugReceiptRepository) BuildModelForRequest(dto *dtodoctor.CreateDrugReceiptRequest) *patient.DrugReceipt {
	req := &patient.DrugReceipt{
		DrugReceiptId:     dto.DrugReceiptId,
		DrugName:          dto.DrugName,
		UsageInstructions: dto.UsageInstructions,
		Notes:             dto.Notes,
		QueueId:           dto.QueueId,
	}
	return req
}

func (r *drugReceiptRepository) CreateDrugReceipt(ctx context.Context, dr *patient.DrugReceipt) error {
	_, err := r.db.NewInsert().Model(dr).Exec(ctx)
	if err != nil {
		logrus.Errorf("Repository layer %+v", err)
		return err
	}
	return nil
}

// func (r *drugReceiptRepository) migrate() error {
// 	_, err := r.db.NewCreateTable().Model(&patient.DrugReceipt{}).Exec(context.Background())
// 	if err != nil {
// 		logrus.Errorf("Repository layer %+v", err)
// 		return err
// 	}
// 	return nil
// }
