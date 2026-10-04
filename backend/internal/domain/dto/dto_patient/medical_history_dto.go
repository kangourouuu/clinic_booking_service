package dtopatient

import (
	"backend/internal/domain/patient"

	"github.com/google/uuid"
)

// MedicalHistoryResponse - DTO for medical history response
type MedicalHistoryResponse struct {
	DrugAllergies           []string                `json:"drug_allergies"`
	DiseaseTreatmentHistory []string                `json:"disease_treatment_history"`
	OtherHistory            string                  `json:"other_history"`
	PatientId               uuid.UUID               `json:"patient_id"`
	Patient                 *PatientSummaryResponse `json:"patient,omitempty"`
}

// ConvertToMedicalHistoryResponse - Convert domain model to response DTO
func ConvertToMedicalHistoryResponse(mh *patient.MedicalHistory) *MedicalHistoryResponse {
	if mh == nil {
		return nil
	}

	response := &MedicalHistoryResponse{
		DrugAllergies:           mh.DrugAllergies,
		DiseaseTreatmentHistory: mh.DiseaseTreatmentHistory,
		OtherHistory:            mh.OtherHistory,
		PatientId:               mh.PatientId,
	}

	// Check if Patient is not nil before accessing its fields
	if mh.Patient != nil {
		response.Patient = &PatientSummaryResponse{
			PatientId:   mh.Patient.PatientId,
			FullName:    mh.Patient.FullName,
			DoB:         mh.Patient.DoB.Format("02/01/2006"),
			Gender:      mh.Patient.Gender,
			PhoneNumber: mh.Patient.PhoneNumber,
			Email:       mh.Patient.Email,
			CitizenID:   mh.Patient.CitizenID,
		}
	}

	return response
}

// ConvertToMedicalHistoryResponseList - Convert list of domain models to response DTOs
func ConvertToMedicalHistoryResponseList(medicalHistories []*patient.MedicalHistory) []*MedicalHistoryResponse {
	responses := make([]*MedicalHistoryResponse, len(medicalHistories))
	for i, mh := range medicalHistories {
		responses[i] = ConvertToMedicalHistoryResponse(mh)
	}
	return responses
}
