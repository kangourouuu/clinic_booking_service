package utils

import (
	dtopatient "backend/internal/domain/dto/dto_patient"
	"backend/internal/domain/patient"
	"encoding/json"
	"errors"
)

func DeserializeCreateRequest(d *dtopatient.CreatePatientRequest) ([]patient.NextOfKinInfo, []string, []string, error) {
	var nextOfKinInfo []patient.NextOfKinInfo
	var drugAllergies, diseaseTreatmentHistory []string
	if err := json.Unmarshal([]byte(d.NextOfKinInfo), &nextOfKinInfo); err != nil {
		return nil, nil, nil, errors.New("failed to unmarshal to NextOfKinInfo")
	}

	if err := json.Unmarshal([]byte(d.DrugAllergies), &drugAllergies); err != nil {
		return nil, nil, nil, errors.New("failed to unmarshal to DrugAllergies")
	}

	if err := json.Unmarshal([]byte(d.DiseaseTreatmentHistory), &diseaseTreatmentHistory); err != nil {
		return nil, nil, nil, errors.New("failed to unmarshal to DiseaseTreatmentHistory")
	}
	return nextOfKinInfo, drugAllergies, diseaseTreatmentHistory, nil
}

func DeserializeUpdateRequest(ud *dtopatient.UpdatePatientRequest) ([]patient.NextOfKinInfo, []string, []string, error) {
	var nextOfKinInfo []patient.NextOfKinInfo
	var drugAllergies, diseaseTreatmentHistory []string

	if ud.NextOfKinInfo != "" {
		if err := json.Unmarshal([]byte(ud.NextOfKinInfo), &nextOfKinInfo); err != nil {
			return nil, nil, nil, errors.New("failed to unmarshal to NextOfKinInfo")
		}
	}

	if err := json.Unmarshal([]byte(ud.DrugAllergies), &drugAllergies); err != nil {
		return nil, nil, nil, errors.New("failed to unmarshal to DrugAllergies")
	}

	if err := json.Unmarshal([]byte(ud.DiseaseTreatmentHistory), &diseaseTreatmentHistory); err != nil {
		return nil, nil, nil, errors.New("failed to unmarshal to DiseaseTreatmentHistory")
	}
	return nextOfKinInfo, drugAllergies, diseaseTreatmentHistory, nil
}
