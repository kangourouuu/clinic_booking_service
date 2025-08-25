package patient

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type DrugReceipt struct {
	bun.BaseModel     `bun:"table:drug_receipt"`
	DrugReceiptId     uuid.UUID `json:"drug_receipt_id" bun:"drug_receipt_id,pk,type:uuid"`
	DrugName          string    `json:"drug_name" bun:"drug_name"`
	UsageInstructions string    `json:"usage_instructions" bun:"usage_instructions"`
	Notes             string    `json:"notes" bun:"notes"`

	QueueId      int           `bun:"queue_id"`
	BookingQueue *BookingQueue `bun:"rel:belongs-to,join:queue_id=queue_id"`
}
