package handler

import (
	"project-bamart2/apps/api/internal/shared/middleware"

	"github.com/gofiber/fiber/v3"
)

func RegisterRoutes(router fiber.Router, h *SummaryHandler, jwtMiddleware fiber.Handler) {
	router.Get("/admin/summary", jwtMiddleware, middleware.RequireRole("ADMIN"), h.GetAdminSummary)
	router.Get("/seller/summary", jwtMiddleware, middleware.RequireRole("SELLER"), h.GetSellerSummary)

	// Public
	router.Get("/stats", h.GetPublicStats)
}
