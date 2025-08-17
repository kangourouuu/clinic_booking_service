package doctorvalidator

import (
	"backend/internal/domain/dto/dtodoctor"
	"backend/pkg/common/validator"
	"errors"
	"fmt"
)

func ValidatePatientFieldsForCreate(d *dtodoctor.CreateDoctorRequest) error {
	// validate input fields
	if ok := validator.IsValidNurseFields(d.FullName, d.PhoneNumber, d.Email); !ok {
		return errors.New("please fill out all necessary fields")
	}

	if ok := validator.IsValidGender(d.Gender); ok {
		return errors.New("invalid gender")
	}

	if ok := validator.IsValidEmail(d.Email); !ok {
		return errors.New("email must have @gmail.com")
	}

	if ok := validator.IsValidPassword(d.Password); !ok {
		return fmt.Errorf("password need at least 8 characters, include: 1 speacial characters 2 uppercase characters 3 lowercase characters 2 number characters")
	}
	return nil
}

func ValidatePatientFieldsForUpdate(ud *dtodoctor.UpdateDoctorRequest) error {
	// validate input fields
	if ok := validator.IsValidNurseFields(ud.FullName, ud.PhoneNumber, ud.Email); !ok {
		return errors.New("please fill out all necessary fields")
	}

	if ok := validator.IsValidGender(ud.Gender); ok {
		return errors.New("invalid gender")
	}

	if ok := validator.IsValidEmail(ud.Email); !ok {
		return errors.New("email must have @gmail.com")
	}

	if ok := validator.IsValidPassword(ud.Password); !ok {
		return fmt.Errorf("password need at least 8 characters, include: 1 speacial characters\n2 uppercase characters\n3 lowercase characters\n2 number characters")
	}
	return nil
}