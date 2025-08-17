package middleware

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/sirupsen/logrus"
)

// ValidateToken validates JWT token and extracts claims
func ValidateToken(tokenString string) (*jwt.MapClaims, error) {
	// get secret key from environment variable
	key := os.Getenv("SECRET_KEY")
	if key == "" {
		logrus.Error("SECRET_KEY environment variable is not set")
		return nil, jwt.ErrSignatureInvalid
	}

	// parse and validate token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(key), nil
	})

	if err != nil {
		return nil, err
	}

	// extract claims if token is valid
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// check the exp
		if float64(time.Now().Unix()) > claims["exp"].(float64) {
			return nil, jwt.ErrTokenInvalidClaims
		}

		return &claims, nil
	}

	return nil, jwt.ErrTokenNotValidYet
}

// AuthMiddleware validates JWT tokens in Authorization header
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader, err := c.Cookie("clinic_token")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get cookie"})
			c.Abort()
			return
		}

		// if authHeader == "" {
		// 	c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
		// 	c.Abort()
		// 	return
		// }

		// check Bearer token format
		// tokenParts := strings.Split(authHeader, " ")
		// if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
		// 	c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
		// 	c.Abort()
		// 	return
		// }

		// validate token
		claims, err := ValidateToken(authHeader)
		if err != nil {
			logrus.Errorf("Token validation failed: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		c.Set("patient", (*claims)["sub"])
		c.Set("doctor", (*claims)["sub"])
		c.Set("nurse", (*claims)["sub"])
		c.Set("claims", claims)

		// continue to next handler
		c.Next()
	}
}

func GetUserInfoFromContext(ctx *gin.Context) (string, string, error) {
	claims, exists := ctx.Get("claims")
	if !exists {
		logrus.Error("Claims not found in context")
		return "", "", fmt.Errorf("claims not found in context")
	}

	mapClaims, ok := claims.(*jwt.MapClaims)
	if !ok {
		logrus.Errorf("Invalid claims format, type: %T", claims)
		return "", "", fmt.Errorf("invalid claims format")
	}

	// Extract user ID and role
	userId, err := GetUserIDFromClaims(*mapClaims)
	if err != nil {
		return "", "", err
	}

	role, err := GetRoleFromClaims(*mapClaims)
	if err != nil {
		return "", "", err
	}

	return userId, role, nil
}

func GetRoleFromClaims(claims jwt.MapClaims) (string, error) {
	role, ok := claims["role"].(string)
	if !ok {
		logrus.Error("Role not found in token")
		return "", fmt.Errorf("role not found")
	}
	return role, nil
}

func GetUserIDFromClaims(claims jwt.MapClaims) (string, error) {
	userId, ok := claims["sub"].(string)
	if !ok {
		logrus.Error("User ID not found in token")
		return "", fmt.Errorf("user ID not found")
	}
	return userId, nil
}

func GetPatientIdFromToken(ctx *gin.Context) (string, string, error) {
	userId, role, err := GetUserInfoFromContext(ctx)
	if err != nil {
		return "", "", err
	}

	if role != "patient" {
		return "", "", fmt.Errorf("user is not a patient, role: %s", role)
	}

	return userId, role, nil
}

func AllowCORS() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		ctx.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		ctx.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, clinic_token, Authorization, Cookie")
		ctx.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
		ctx.Writer.Header().Set("Access-Control-Expose-Headers", "Set-Cookie")

		if ctx.Request.Method == "OPTIONS" {
			ctx.AbortWithStatus(204)
			return
		}
		ctx.Next()
	}
}
