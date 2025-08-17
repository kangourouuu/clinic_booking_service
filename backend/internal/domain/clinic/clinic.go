package clinic

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Clinic struct {
	bun.BaseModel `bun:"table:clinic"`
	ClinicId      uuid.UUID `json:"clinic_id" bun:"clinic_id,pk,type:uuid"`
	ClinicName    string    `json:"clinic_name" bun:"clinic_name"`
	Address       string    `json:"address" bun:"address"`
	Hotline       string    `json:"hotelin" bun:"hotline"`
	Schedule      string    `json:"schedule" bun:"schedule"`
}
