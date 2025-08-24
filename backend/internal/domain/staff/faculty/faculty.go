package staff

import "github.com/uptrace/bun"

type Faculty struct {
	bun.BaseModel `bun:"table:faculty"`
	FacultyId     byte   `json:"faculty_id" bun:"faculty_id,pk"`
	FacultyCode   string `json:"faculty_code" bun:"faculty_code"`
	FacultyName   string `json:"faculty_name" bun:"faculty_name"`
}
