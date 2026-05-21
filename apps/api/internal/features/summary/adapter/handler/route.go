package handler

import "github.com/gofiber/fiber/v3"

func RegisterRoutes(router fiber.Router, h *SummaryHandler, jwtMiddleware fiber.Handler) {
	// e.g. add middleware.RequireRole("ADMIN") alongside jwtMiddleware if needed
	router.Get("/admin/summary", jwtMiddleware, h.GetAdminSummary)

	// e.g. add middleware.RequireRole("SELLER") alongside jwtMiddleware if needed
	router.Get("/seller/summary", jwtMiddleware, h.GetSellerSummary)

	// Public
	router.Get("/stats", h.GetPublicStats)
}
