package validator

import (
	"regexp"
	"strings"

	"github.com/google/uuid"
)

func IsValidFields(fields map[string]string) bool {
	for fieldName, fieldValue := range fields {
		switch fieldName {
		case "name":
			if fieldValue == "" {
				return false
			}
		case "phoneNumber":
			if fieldValue == "" || len(fieldValue) < 10 {
				return false
			}
		case "citizenId":
			if fieldValue == "" {
				return false
			}
		case "email":
			if !IsValidEmail(fieldValue) {
				return false
			}
		case "password":
			if !IsValidPassword(fieldValue) {
				return false
			}
		default:
			continue
		}
	}
	return true
}

func IsValidLogin(phoneNumber, password string) bool {
	fields := map[string]string{
		"phoneNumber":    phoneNumber,
		"password": password,
	}
	return IsValidFields(fields)
}

func IsValidPatientFields(name, phoneNumber, citizenId string) bool {
	fields := map[string]string{
		"name":        name,
		"phoneNumber": phoneNumber,
		"citizenId":   citizenId,
	}
	return IsValidFields(fields)
}

func IsValidDoctorFields(name, phoneNumber, email string) bool {
	fields := map[string]string{
		"name":        name,
		"phoneNumber": phoneNumber,
		"email":       email,
	}
	return IsValidFields(fields)
}

func IsValidNurseFields(name, phoneNumber, email string) bool {
	fields := map[string]string{
		"name":        name,
		"phoneNumber": phoneNumber,
		"email":       email,
	}
	return IsValidFields(fields)
}

func IsValidEmail(email string) bool {
	if email == "" {
		return false
	}
	emailRegex := regexp.MustCompile("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")
	return emailRegex.MatchString(email)
}

func IsValidGender(gender string) bool {
	genderList := []string{"Male", "Female", "Other"}
	for _, g := range genderList {
		if strings.EqualFold(gender, g) {
			return false
		}
	}
	return true
}

func IsValidPassword(password string) bool {
	if password == "" {
		return false
	}

	// Check minimum length
	if len(password) < 8 {
		return false
	}

	// Check maximum length (optional, for security)
	if len(password) > 128 {
		return false
	}

	// Count character types
	var (
		hasUpper   = 0
		hasLower   = 0
		hasNumber  = 0
		hasSpecial = 0
	)

	// Define special characters
	specialChars := "!@#$&*"

	for _, char := range password {
		switch {
		case char >= 'A' && char <= 'Z':
			hasUpper++
		case char >= 'a' && char <= 'z':
			hasLower++
		case char >= '0' && char <= '9':
			hasNumber++
		case strings.ContainsRune(specialChars, char):
			hasSpecial++
		}
	}

	// Validate requirements:
	// - At least 2 uppercase letters
	// - At least 1 special character from !@#$&*
	// - At least 2 numbers
	// - At least 3 lowercase letters
	// - Minimum 8 characters total
	return hasUpper >= 2 && hasSpecial >= 1 && hasNumber >= 2 && hasLower >= 3
}

func IsValidId(id string) bool {
	_, err := uuid.Parse(id)
	return err == nil
}