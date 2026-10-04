package dtopatient

import (
	"backend/internal/domain/patient"
)

type GeneralExaminationResponse struct {
	VitalSigns  string  `json:"vital_signs"`
	Temperature float64 `json:"temperature"`
	Weight      float64 `json:"weight"`
	Height      float64 `json:"height"`
	BMI         float64 `json:"bmi" bun:"bmi"` // must be calculated
}

func ConvertGEToGEResponse(p *patient.GeneralExamination) *GeneralExaminationResponse {
	resp := &GeneralExaminationResponse{
		VitalSigns: p.VitalSigns,
		Temperature: p.Temperature,
		Weight: p.Weight,
		Height: p.Height,
		BMI: p.BMI,
	}
	return resp
}

func ConvertGEToGeList(p []*patient.GeneralExamination) []*GeneralExaminationResponse {
	resp := make([]*GeneralExaminationResponse, len(p))
	for i, ge := range p {
		resp[i] = ConvertGEToGEResponse(ge)
	}
	return resp
}