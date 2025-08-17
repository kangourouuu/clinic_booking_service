package nursevalidator

import (
	dtonurse "backend/internal/domain/dto/dto_nurse"
	"backend/pkg/common/validator"
	"errors"
	"fmt"
)

func ValidateNurseFieldsForCreate(d *dtonurse.CreateNurseRequest) error {
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
		return fmt.Errorf("password need at least 8 characters, include: 1 speacial characters\n2 uppercase characters\n3 lowercase characters\n2 number characters")
	}
	return nil
}

func ValidateNurseFieldsForUpdate(ud *dtonurse.UpdateNurseRequest) error {
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
