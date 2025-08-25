package staff

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Admin struct {
	bun.BaseModel `bun:"table:admin"`
	AdminId       uuid.UUID `json:"admin_id" bun:"admin_id,pk,type:uuid"`
	Username      string    `json:"username" bun:"username"`
	Password      string    `json:"password" bun:"password"`
}
