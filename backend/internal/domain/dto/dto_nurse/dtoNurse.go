package dtonurse

import (
	"backend/internal/domain/nurse"
	"time"
)

type CreateNurseRequest struct {
	FullName    string    `json:"full_name"`
	DoB         string    `json:"dob"`
	Gender      string    `json:"gender"`
	PhoneNumber string    `json:"phone_number"`
	Password    string    `json:"password"`
	Faculty     string    `json:"faculty"`
	Position    string    `json:"position"`
	Email       string    `json:"email"`
	CreatedAt   time.Time `json:"-"`
}

type UpdateNurseRequest struct {
	FullName    string    `json:"full_name"`
	DoB         string    `json:"dob"`
	Gender      string    `json:"gender"`
	PhoneNumber string    `json:"phone_number"`
	Password    string    `json:"password"`
	Faculty     string    `json:"faculty"`
	Position    string    `json:"position"`
	Email       string    `json:"email"`
	UpdatedAt   time.Time `json:"-"`
}

type NurseResponse struct {
	FullName    string `json:"full_name"`
	DoB         string `json:"dob"`
	Gender      string `json:"gender"`
	PhoneNumber string `json:"phone_number"`
	Password    string `json:"-"`
	Faculty     string `json:"faculty"`
	Position    string `json:"position"`
	Email       string `json:"email"`
}

func ConvertNurseToNurseResponse(n *nurse.Nurse) *NurseResponse {
	resp := &NurseResponse{
		FullName:    n.FullName,
		DoB:         n.DoB.Format("02/01/2006"),
		Gender:      n.Gender,
		PhoneNumber: n.PhoneNumber,
		Faculty:     n.Faculty,
		Position:    n.Position,
		Email:       n.Email,
	}
	return resp
}

func ConvertNurseToNurseList(n []*nurse.Nurse) []*NurseResponse {
	resp := make([]*NurseResponse, len(n))
	for i, n := range n {
		resp[i] = ConvertNurseToNurseResponse(n)
	}
	return resp
}
