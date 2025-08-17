package doctor

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Doctor struct {
	bun.BaseModel `bun:"table:doctor"`
	ID            uuid.UUID `json:"doctor_id" bun:"doctor_id,pk,type:uuid"`
	FullName      string    `json:"full_name" bun:"full_name"`
	Email         string    `json:"email" bun:"email,unique"`
	Gender        string    `json:"gender" bun:"gender"`
	DoB           time.Time `json:"dob" bun:"dob"`
	PhoneNumber   string    `json:"phone_number" bun:"phone_number,unique"`
	Password      string    `json:"-" bun:"password"`
	Position      string    `json:"position" bun:"position"`
	Faculty       string    `json:"faculty" bun:"faculty"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
