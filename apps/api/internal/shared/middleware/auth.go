package middleware

import (
	"strings"

	"project-bamart2/apps/api/pkg/token"

	"github.com/gofiber/fiber/v3"
)

// JWTMiddleware validates the JWT from an HttpOnly cookie OR an Authorization header.
// On success it injects userID, userRole, and userEmail into fiber.Ctx Locals.
// It does NOT hit the database — that responsibility belongs to the use case.
func JWTMiddleware(ts *token.JWTService) fiber.Handler {
	return func(c fiber.Ctx) error {
		tokenStr := c.Cookies("token")
		if tokenStr == "" {
			tokenStr = strings.TrimPrefix(c.Get("Authorization"), "Bearer ")
		}
		if tokenStr == "" {
			return c.Status(401).JSON(fiber.Map{"success": false, "error": "Unauthorized"})
		}

		claims, err := ts.Verify(tokenStr)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"success": false, "error": "Invalid or expired token"})
		}

		c.Locals("userID", claims.UserID)
		c.Locals("userRole", claims.Role)
		c.Locals("userEmail", claims.Email)
		c.Locals("userName", claims.Name)

		return c.Next()
	}
}

// RequireRole is a middleware that enforces one of the given roles.
// Must be placed AFTER JWTMiddleware in the handler chain.
func RequireRole(roles ...string) fiber.Handler {
	return func(c fiber.Ctx) error {
		role, ok := c.Locals("userRole").(string)
		if !ok {
			return c.Status(401).JSON(fiber.Map{"success": false, "error": "Unauthorized"})
		}
		for _, r := range roles {
			if role == r {
				return c.Next()
			}
		}
		return c.Status(403).JSON(fiber.Map{"success": false, "error": "Forbidden"})
	}
}

// GetUserID is a convenience helper for handlers to extract the authenticated user's ID.
func GetUserID(c fiber.Ctx) uint {
	id, _ := c.Locals("userID").(uint)
	return id
}

// GetUserRole returns the authenticated user's role string.
func GetUserRole(c fiber.Ctx) string {
	role, _ := c.Locals("userRole").(string)
	return role
}
