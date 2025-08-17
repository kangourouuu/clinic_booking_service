
package middleware

import (
	"net/http"



	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func CasbinMiddleware(e *casbin.Enforcer) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, exists := c.Get("claims")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "claims not found"})
			c.Abort()
			return
		}

		mapClaims, ok := claims.(*jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid claims format"})
			c.Abort()
			return
		}

		role, ok := (*mapClaims)["role"].(string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"error": "role not found in claims"})
			c.Abort()
			return
		}

		// casbin enforce
		ok, err := e.Enforce(role, c.Request.URL.Path, c.Request.Method)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error during authorization"})
			c.Abort()
			return
		}

		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"error": "you are not authorized"})
			c.Abort()
			return
		}
		c.Next()
	}
}
