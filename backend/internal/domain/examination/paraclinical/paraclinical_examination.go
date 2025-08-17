package paraclinical

import (
	"backend/internal/domain/examination"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type ParaclinicalExamination struct {
	bun.BaseModel      `bun:"table:paraclinical"`
	ParaclinicalExamID uuid.UUID `json:"paraclinical_exam_id" bun:"paraclinical_exam_id,pk,type:uuid"`
	Type               string    `json:"type" bun:"type"`
	Notes              string    `json:"notes" bun:"notes"`
	ImgURLS            []string  `json:"img_urls" bun:"img_urls"`

	ExaminationId uuid.UUID                `bun:"examination_id,notnull"`
	Examination   *examination.Examination `bun:"rel:belongs-to,join:examination_id=examination_id"`
}
