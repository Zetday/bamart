package handler

import (
	"project-bamart2/apps/api/internal/shared/middleware"

	"github.com/gofiber/fiber/v3"
)

// RegisterRoutes mounts all auth endpoints onto the given router group.
// jwtMiddleware is injected so this file has no import on pkg/token directly.
func RegisterRoutes(router fiber.Router, h *AuthHandler, jwtMiddleware fiber.Handler) {
	auth := router.Group("/auth")

	// Public
	auth.Post("/register", h.Register)
	auth.Post("/login", h.Login)
	auth.Post("/logout", h.Logout)

	// Protected
	auth.Get("/me", jwtMiddleware, h.Me)

	// Brands (public)
	router.Get("/brands", h.GetBrands)

	// Users (protected - for admin dashboards)
	router.Get("/users", jwtMiddleware, h.GetAllUsers)
	router.Post("/users", jwtMiddleware, middleware.RequireRole("ADMIN"), h.CreateUser)
	router.Put("/users/:id", jwtMiddleware, middleware.RequireRole("ADMIN"), h.UpdateUser)
	router.Delete("/users/:id", jwtMiddleware, middleware.RequireRole("ADMIN"), h.DeleteUser)
}
