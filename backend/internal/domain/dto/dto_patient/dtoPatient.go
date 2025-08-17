package dtopatient

import (
	"backend/internal/domain/patient"

	"github.com/google/uuid"
)

type CreatePatientRequest struct {
	FullName          string `json:"full_name" form:"full_name"`
	DoB               string `json:"dob" form:"dob"`
	Gender            string `json:"gender" form:"gender"`
	PhoneNumber       string `json:"phone_number" form:"phone_number"`
	Password          string `json:"password" form:"password"`
	Email             string `json:"email" form:"email"`
	Address           string `json:"address" form:"address"`
	PortraitPhotoURL  string `json:"photo"`
	HealthInsuranceID string `json:"health_insurance_id" form:"health_insurance_id"`
	CitizenID         string `json:"citizen_id" form:"citizen_id"`
	NextOfKinInfo     string `json:"next_of_kin_info" form:"next_of_kin_info"` // can be null
	Resereved1        string
	Resereved2        string
	Resereved3        string

	DrugAllergies           string `json:"drug_allergies" form:"drug_allergies"`
	DiseaseTreatmentHistory string `json:"disease_treatment_history" form:"disease_treatment_history"`
	OtherHistory            string `json:"other_history" form:"other_history"`

	VitalSigns  string  `json:"vital_signs" form:"vital_signs"`
	Temperature float64 `json:"temperature" form:"temperature"`
	Weight      float64 `json:"weight" form:"weight"`
	Height      float64 `json:"height" form:"height"`
	BMI         float64 `json:"bmi" form:"bmi"` // must be calculated

	PatientId uuid.UUID `json:"-"`
}

type UpdatePatientRequest struct {
	FullName          string `json:"full_name" form:"full_name"`
	DoB               string `json:"dob" form:"dob"`
	Gender            string `json:"gender" form:"gender"`
	PhoneNumber       string `json:"phone_number" form:"phone_number"`
	Password          string `json:"password" form:"password"`
	Email             string `json:"email" form:"email"`
	Address           string `json:"address" form:"address"`
	PortraitPhotoURL  string `json:"photo"`
	HealthInsuranceID string `json:"health_insurance_id" form:"health_insurance_id"`
	CitizenID         string `json:"citizen_id" form:"citizen_id"`
	NextOfKinInfo     string `json:"next_of_kin_info" form:"next_of_kin_info"` // can be null
	Resereved1        string
	Resereved2        string
	Resereved3        string

	DrugAllergies           string `json:"drug_allergies" form:"drug_allergies"`
	DiseaseTreatmentHistory string `json:"disease_treatment_history" form:"disease_treatment_history"`
	OtherHistory            string `json:"other_history" form:"other_history"`

	GeneralExaminationId uuid.UUID `json:"general_examination_id" form:"general_examination_id"`
	VitalSigns           string    `json:"vital_signs" form:"vital_signs"`
	Temperature          float64   `json:"temperature" form:"temperature"`
	Weight               float64   `json:"weight" form:"weight"`
	Height               float64   `json:"height" form:"height"`
	BMI                  float64   `json:"bmi" form:"bmi"` // must be calculated

	PatientId uuid.UUID `json:"-"`
}

type PatientResponse struct {
	PatientId          uuid.UUID                   `json:"patient_id"`
	FullName           string                      `json:"full_name"`
	DoB                string                      `json:"dob"`
	Gender             string                      `json:"gender"`
	PhoneNumber        string                      `json:"phone_number"`
	Password           string                      `json:"-"`
	Email              string                      `json:"email"`
	Address            string                      `json:"address"`
	PortraitPhotoURL   string                      `json:"photo"`
	HealthInsuranceID  string                      `json:"health_insurance_id"`
	CitizenID          string                      `json:"citizen_id"`
	NextOfKinInfo      []patient.NextOfKinInfo     `json:"next_of_kin_info"` // can be null
	Resereved1         string                      `json:"-"`
	Resereved2         string                      `json:"-"`
	Resereved3         string                      `json:"-"`
	MedicalHistory     *MedicalHistoryResponse     `json:"medical_history,omitempty"`
	GeneralExamination *GeneralExaminationResponse `json:"general_examination,omitempty"`
}

type PatientSummaryResponse struct {
	PatientId   uuid.UUID `json:"patient_id"`
	FullName    string    `json:"full_name"`
	DoB         string    `json:"dob"`
	Gender      string    `json:"gender"`
	PhoneNumber string    `json:"phone_number"`
	Email       string    `json:"email"`
	CitizenID   string    `json:"citizen_id"`
	Address     string    `json:"address"`
}

func ConvertToPatientResponse(p *patient.Patient) *PatientResponse {
	resp := &PatientResponse{
		PatientId:         p.PatientId,
		FullName:          p.FullName,
		DoB:               p.DoB.Format("02/01/2006"),
		Gender:            p.Gender,
		PhoneNumber:       p.PhoneNumber,
		Email:             p.Email,
		Address:           p.Address,
		PortraitPhotoURL:  p.PortraitPhotoURL,
		HealthInsuranceID: p.HealthInsuranceID,
		CitizenID:         p.CitizenID,
		NextOfKinInfo:     p.NextOfKinInfo,
	}
	if p.MedicalHistory != nil && p.GeneralExamination != nil {
		resp.MedicalHistory = ConvertToMedicalHistoryResponse(p.MedicalHistory)
		resp.GeneralExamination = ConvertGEToGEResponse(p.GeneralExamination)
	}
	return resp
}

func ConvertToPatientList(patients []*patient.Patient) []*PatientResponse {
	resp := make([]*PatientResponse, len(patients))
	for i, patient := range patients {
		resp[i] = ConvertToPatientResponse(patient)
	}
	return resp
}
