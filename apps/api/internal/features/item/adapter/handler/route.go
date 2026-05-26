package handler

import (
	"github.com/gofiber/fiber/v3"
	"project-bamart2/apps/api/internal/features/auth/domain"
	"project-bamart2/apps/api/internal/shared/middleware"
)

// RegisterRoutes sets up the item endpoints.
func RegisterRoutes(router fiber.Router, h *ItemHandler, jwtMiddleware fiber.Handler) {
	items := router.Group("/items")

	// Adjust middlewares based on requirements (e.g., Seller role needed for Create/Update/Delete)
	items.Get("/", h.GetAll)
	items.Get("/:id", h.GetByID)

	sellerOrAdmin := items.Group("", jwtMiddleware, middleware.RequireRole(string(domain.RoleSeller), string(domain.RoleAdmin)))
	sellerOrAdmin.Post("/upload", h.UploadImage)
	sellerOrAdmin.Post("/", h.Create)
	sellerOrAdmin.Put("/:id", h.Update)
	sellerOrAdmin.Delete("/:id", h.Delete)
}
