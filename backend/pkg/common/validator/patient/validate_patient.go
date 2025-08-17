package patientvalidator

import (
	dtopatient "backend/internal/domain/dto/dto_patient"
	"backend/pkg/common/validator"
	"errors"
	"fmt"
)

func ValidatePatientFieldsForCreate(d *dtopatient.CreatePatientRequest) error {
	// validate input fields
	if ok := validator.IsValidPatientFields(d.FullName, d.PhoneNumber, d.CitizenID); !ok {
		return errors.New("please fill out all necessary fields")
	}

	if ok := validator.IsValidGender(d.Gender); ok {
		return errors.New("invalid gender")
	}

	if ok := validator.IsValidEmail(d.Email); !ok {
		return errors.New("email must have @gmail.com")
	}

	if ok := validator.IsValidPassword(d.Password); !ok {
		return fmt.Errorf("password need at least 8 characters, include: 1 speacial characters\n2 uppercase characters\n3 lowercase characters\n2 number characters")
	}
	return nil
}

func ValidatePatientFieldsForUpdate(ud *dtopatient.UpdatePatientRequest, patientId string) error {
	// validate input fields
	if patientId == "" {
		return errors.New("id must be not empty")
	}

	if ok := validator.IsValidPatientFields(ud.FullName, ud.PhoneNumber, ud.CitizenID); !ok {
		return errors.New("please fill out all necessary fields")
	}

	if ok := validator.IsValidGender(ud.Gender); ok {
		return errors.New("invalid gender")
	}

	if ok := validator.IsValidEmail(ud.Email); !ok {
		return errors.New("email must have @gmail.com")
	}

	if ud.Password != "" {
		if ok := validator.IsValidPassword(ud.Password); !ok {
			return fmt.Errorf("password need at least 8 characters, include: 1 speacial characters\n2 uppercase characters\n3 lowercase characters\n2 number characters")
		}
	}

	return nil
}
