package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/sirupsen/logrus"
)

func GenerateToken(id, role string) string {
	// get secret key from environment variable
	key := os.Getenv("SECRET_KEY")
	if key == "" {
		logrus.Error("SECRET_KEY environment variable is not set")
		return ""
	}

	// create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  id, // subject (phone number)
		"role": role,
		"iat":  time.Now().Unix(),                          // issued at
		"exp":  time.Now().Add(time.Hour * 24 * 30).Unix(), // expires in 30 days
	})

	// sign token with secret key
	tokenStr, err := token.SignedString([]byte(key))
	if err != nil {
		logrus.Errorf("Failed to generate token: %v", err)
		return ""
	}

	return tokenStr
}
