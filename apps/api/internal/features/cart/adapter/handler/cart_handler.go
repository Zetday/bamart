package handler

import (
	"project-bamart2/apps/api/internal/features/cart/usecase"
	"project-bamart2/apps/api/internal/shared/middleware"
	"project-bamart2/apps/api/internal/shared/response"

	"github.com/gofiber/fiber/v3"
)

type CartHandler struct {
	uc usecase.CartUseCase
}

func NewCartHandler(uc usecase.CartUseCase) *CartHandler {
	return &CartHandler{uc: uc}
}

func (h *CartHandler) GetMyCart(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "Unauthorized")
	}

	cart, err := h.uc.GetByUserID(userID)
	if err != nil {
		return response.InternalError(c)
	}

	if cart == nil {
		return c.JSON(fiber.Map{"items": []interface{}{}})
	}

	return c.JSON(FromDomain(cart))
}

func (h *CartHandler) AddToCart(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "Unauthorized")
	}

	var req AddToCartRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	qty := req.Quantity
	if qty == 0 {
		qty = 1
	}

	msg, err := h.uc.AddToCart(usecase.AddToCartInput{
		UserID: userID,
		ItemID: req.ItemID,
		Qty:    qty,
	})

	if err != nil {
		return response.FromAppError(c, err)
	}

	return c.JSON(fiber.Map{"message": msg})
}

func (h *CartHandler) RemoveItem(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "Unauthorized")
	}

	var req RemoveFromCartRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	if err := h.uc.RemoveItem(req.CartItemID, userID); err != nil {
		return response.InternalError(c)
	}

	return c.JSON(fiber.Map{"message": "Item removed"})
}

func (h *CartHandler) UpdateQuantity(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "Unauthorized")
	}

	var req UpdateCartQuantityRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	err := h.uc.UpdateQuantity(req.CartItemID, userID, req.Quantity)
	if err != nil {
		return response.FromAppError(c, err)
	}

	return c.JSON(fiber.Map{"message": "Quantity updated"})
}

func (h *CartHandler) GetSubtotal(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return c.JSON(fiber.Map{"subtotal": 0})
	}

	subtotal, err := h.uc.GetSubtotal(userID)
	if err != nil {
		return response.InternalError(c)
	}

	return c.JSON(fiber.Map{"subtotal": subtotal})
}
