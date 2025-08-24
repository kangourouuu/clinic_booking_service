package nurse

import (
	staff "backend/internal/domain/staff/faculty"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Nurse struct {
	bun.BaseModel `bun:"table:nurse"`
	ID            uuid.UUID     `json:"nurse_id" bun:"nurse_id,pk,type:uuid"`
	FullName      string        `json:"full_name" bun:"full_name"`
	Email         string        `json:"email" bun:"email,unique"`
	DoB           time.Time     `json:"dob" bun:"dob"`
	Gender        string        `json:"gender" bun:"gender"`
	PhoneNumber   string        `json:"phone_number" bun:"phone_number,unique"`
	Password      string        `json:"-" bun:"password"`
	Position      string        `json:"position" bun:"position"`
	Faculty       staff.Faculty `json:"faculty" bun:"faculty"`
	CreatedAt     time.Time     `json:"created_at" bun:"created_at,default:current_timestamp"`
	UpdatedAt     time.Time     `json:"updated_at" bun:"updated_at,default:current_timestamp"`
}
