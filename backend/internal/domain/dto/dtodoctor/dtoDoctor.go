package dtodoctor

import (
	"backend/internal/domain/doctor"
	"time"
)

type CreateDoctorRequest struct {
	FullName    string    `json:"full_name" bun:"full_name"`
	Gender      string    `json:"gender" bun:"gender"`
	DoB         string    `json:"dob" bun:"dob"`
	PhoneNumber string    `json:"phone_number" bun:"phone_number,unique"`
	Password    string    `json:"password" bun:"password"`
	Faculty     string    `json:"faculty" bun:"faculty"`
	Position    string    `json:"position"`
	Email       string    `json:"email" bun:"email,unique"`
	CreatedAt   time.Time `json:"created_at"`
}

type UpdateDoctorRequest struct {
	FullName    string    `json:"full_name" bun:"full_name"`
	Gender      string    `json:"gender" bun:"gender"`
	DoB         string    `json:"dob" bun:"dob"`
	PhoneNumber string    `json:"phone_number" bun:"phone_number,unique"`
	Password    string    `json:"password" bun:"password"`
	Faculty     string    `json:"faculty" bun:"faculty"`
	Position    string    `json:"position"`
	Email       string    `json:"email" bun:"email,unique"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type DoctorResponse struct {
	FullName    string `json:"full_name" bun:"full_name"`
	Gender      string `json:"gender" bun:"gender"`
	DoB         string `json:"dob" bun:"dob"`
	PhoneNumber string `json:"phone_number" bun:"phone_number,unique"`
	Passsword   string `json:"-"`
	Faculty     string `json:"faculty" bun:"faculty"`
	Position    string `json:"position"`
	Email       string `json:"email" bun:"email,unique"`
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
