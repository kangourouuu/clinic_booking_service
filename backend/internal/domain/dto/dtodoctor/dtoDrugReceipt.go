package dtodoctor

import (
	"github.com/google/uuid"
)

type CreateDrugReceiptRequest struct {
	DrugReceiptId     uuid.UUID `json:"drug_receipt_id"`
	DrugName          string    `json:"drug_name"`
	UsageInstructions string    `json:"usage_instructions"`
	Notes             string    `json:"notes"`
	QueueId           int       `json:"queue_id"`
}
