package dtodoctor

import (
	"backend/internal/domain/staff/doctor"
	staff "backend/internal/domain/staff/faculty"
	"time"
)

type CreateDoctorRequest struct {
	FullName    string        `json:"full_name"`
	Gender      string        `json:"gender"`
	DoB         string        `json:"dob"`
	PhoneNumber string        `json:"phone_number"`
	Password    string        `json:"password"`
	Faculty     staff.Faculty `json:"faculty"`
	Position    string        `json:"position"`
	Email       string        `json:"email"`
	CreatedAt   time.Time     `json:"created_at"`
}

type UpdateDoctorRequest struct {
	FullName    string        `json:"full_name"`
	Gender      string        `json:"gender"`
	DoB         string        `json:"dob"`
	PhoneNumber string        `json:"phone_number"`
	Password    string        `json:"password"`
	Faculty     staff.Faculty `json:"faculty"`
	Position    string        `json:"position"`
	Email       string        `json:"email"`
	UpdatedAt   time.Time     `json:"updated_at"`
}

type DoctorResponse struct {
	FullName    string        `json:"full_name"`
	Gender      string        `json:"gender"`
	DoB         string        `json:"dob"`
	PhoneNumber string        `json:"phone_number"`
	Passsword   string        `json:"-"`
	Faculty     staff.Faculty `json:"faculty"`
	Position    string        `json:"position"`
	Email       string        `json:"email"`
}

func ConvertDoctorToDoctorResponse(d *doctor.Doctor) *DoctorResponse {
	resp := &DoctorResponse{
		FullName:    d.FullName,
		DoB:         d.DoB.Format("02/01/2006"),
		Gender:      d.Gender,
		PhoneNumber: d.PhoneNumber,
		Faculty:     d.Faculty,
		Position:    d.Position,
		Email:       d.Email,
	}
	return resp
}

func ConvertDoctorToDoctorList(d []*doctor.Doctor) []*DoctorResponse {
	resp := make([]*DoctorResponse, len(d))
	for i, doctor := range d {
		resp[i] = ConvertDoctorToDoctorResponse(doctor)
	}
	return resp
}
