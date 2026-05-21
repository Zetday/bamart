package handler

import (
	"project-bamart2/apps/api/internal/features/summary/usecase"
	"project-bamart2/apps/api/internal/shared/middleware"
	"project-bamart2/apps/api/internal/shared/response"

	"github.com/gofiber/fiber/v3"
)

type SummaryHandler struct {
	uc usecase.SummaryUseCase
}

func NewSummaryHandler(uc usecase.SummaryUseCase) *SummaryHandler {
	return &SummaryHandler{uc: uc}
}

// GET /api/admin-summary
func (h *SummaryHandler) GetAdminSummary(c fiber.Ctx) error {
	// Optional: verify role is ADMIN
	// role := middleware.GetUserRole(c)
	// if role != "ADMIN" { return response.Forbidden(c) }

	data, err := h.uc.GetAdminSummary()
	if err != nil {
		return response.InternalError(c)
	}

	return c.JSON(data) // Keeping original behavior by returning raw JSON or wrap in OK()
}

// GET /api/seller-summary
func (h *SummaryHandler) GetSellerSummary(c fiber.Ctx) error {
	// Must be logged in
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "Unauthorized")
	}

	data, err := h.uc.GetSellerSummary(userID)
	if err != nil {
		return response.InternalError(c)
	}

	return c.JSON(data)
}

// GET /api/stats
func (h *SummaryHandler) GetPublicStats(c fiber.Ctx) error {
	data, err := h.uc.GetPublicStats()
	if err != nil {
		return response.InternalError(c)
	}

	return c.JSON(data)
}
