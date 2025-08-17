package clinical

import (
	"backend/internal/domain/examination"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type ClinicalExamination struct {
	bun.BaseModel `bun:"table:clinical"`
	ClinialExamId uuid.UUID     `json:"clinical_exam_id" bun:"clinical_exam_id,pk,type:uuid"`
	Symptomps     []string      `json:"symptomps" bun:"symptomps"`
	Duration      time.Duration `json:"duration" bun:"duration"`
	Severity      string        `json:"severity" bun:"severity"`

	ExaminationId uuid.UUID                `bun:"examination_id,notnull"` // fk
	Examination   *examination.Examination `bun:"rel:belongs-to,join:examination_id=examination_id"`
}
