package handler

import (
	"strconv"

	"project-bamart2/apps/api/internal/features/order/usecase"
	"project-bamart2/apps/api/internal/shared/middleware"
	"project-bamart2/apps/api/internal/shared/response"

	"github.com/gofiber/fiber/v3"
)

type OrderHandler struct {
	uc usecase.OrderUseCase
}

func NewOrderHandler(uc usecase.OrderUseCase) *OrderHandler {
	return &OrderHandler{uc: uc}
}

func (h *OrderHandler) GetByID(c fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return response.BadRequest(c, "Invalid ID format")
	}

	order, err := h.uc.GetByID(uint(id))
	if err != nil {
		return response.FromAppError(c, err)
	}

	return response.OK(c, "", FromDomain(order))
}

func (h *OrderHandler) GetAll(c fiber.Ctx) error {
	orders, err := h.uc.GetAll()
	if err != nil {
		return response.InternalError(c)
	}
	return response.OK(c, "", FromDomainList(orders))
}

func (h *OrderHandler) Checkout(c fiber.Ctx) error {
	var req CheckoutRequest // Need to define this
	if err := c.Bind().Body(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "Unauthorized")
	}

	redirectURL, err := h.uc.Checkout(usecase.CheckoutInput{
		UserID:     userID,
		FullName:   req.FullName,
		Phone:      req.Phone,
		Address:    req.Address,
		City:       req.City,
		PostalCode: req.PostalCode,
		Notes:      req.Notes,
		Delivery:   req.Delivery,
	})

	if err != nil {
		return response.FromAppError(c, err)
	}

	return response.OK(c, "Checkout successful", fiber.Map{"redirect": redirectURL})
}

func (h *OrderHandler) Update(c fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return response.BadRequest(c, "Invalid ID format")
	}

	var req UpdateOrderRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.BadRequest(c, "Invalid body")
	}

	order, err := h.uc.Update(uint(id), usecase.UpdateOrderInput{
		TotalPrice: req.TotalPrice,
		Status:     req.Status,
		FullName:   req.FullName,
		Phone:      req.Phone,
		Address:    req.Address,
		City:       req.City,
		PostalCode: req.PostalCode,
		Notes:      req.Notes,
	})

	if err != nil {
		return response.FromAppError(c, err)
	}

	return response.OK(c, "Order updated", FromDomain(order))
}

func (h *OrderHandler) Delete(c fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return response.BadRequest(c, "Invalid ID format")
	}

	if err := h.uc.Delete(uint(id)); err != nil {
		return response.FromAppError(c, err)
	}

	return response.OK(c, "Order deleted", nil)
}

func (h *OrderHandler) GetUserOrderDetail(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "Unauthorized")
	}

	orderIDParam := c.Query("orderId")
	orderIDInt, err := strconv.ParseUint(orderIDParam, 10, 32)
	if err != nil || orderIDInt == 0 {
		return response.BadRequest(c, "Invalid orderId query parameter")
	}

	order, err := h.uc.GetUserOrderDetail(uint(orderIDInt), userID)
	if err != nil {
		return response.FromAppError(c, err)
	}

	return response.OK(c, "", FromDomain(order))
}

func (h *OrderHandler) GetMyOrders(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "Unauthorized")
	}

	orders, err := h.uc.GetUserOrders(userID)
	if err != nil {
		return response.InternalError(c)
	}

	return response.OK(c, "", FromDomainList(orders))
}

func (h *OrderHandler) PayOrder(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "Unauthorized")
	}

	var req PayOrderRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.BadRequest(c, "Invalid body")
	}

	if req.OrderID == 0 {
		return response.BadRequest(c, "Missing orderId in body")
	}

	redirect, err := h.uc.PayOrder(req.OrderID, userID)
	if err != nil {
		return response.FromAppError(c, err)
	}

	return response.OK(c, "", fiber.Map{"redirect": redirect})
}

func (h *OrderHandler) GetOrderSummary(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "Unauthorized")
	}

	orderIDParam := c.Query("orderId")
	orderIDInt, err := strconv.ParseUint(orderIDParam, 10, 32)
	if err != nil || orderIDInt == 0 {
		return response.BadRequest(c, "Invalid orderId query parameter")
	}

	total, err := h.uc.GetOrderSummary(uint(orderIDInt), userID)
	if err != nil {
		return response.FromAppError(c, err)
	}

	return response.OK(c, "", fiber.Map{"total": total})
}

func (h *OrderHandler) GetMyOrdersCompat(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "Unauthorized")
	}

	orders, err := h.uc.GetUserOrders(userID)
	if err != nil {
		return response.InternalError(c)
	}

	return c.JSON(fiber.Map{
		"orders": FromDomainList(orders),
	})
}

func (h *OrderHandler) GetUserOrderDetailCompat(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "Unauthorized")
	}

	orderIDParam := c.Query("orderId")
	orderIDInt, err := strconv.ParseUint(orderIDParam, 10, 32)
	if err != nil || orderIDInt == 0 {
		return response.BadRequest(c, "Invalid orderId query parameter")
	}

	order, err := h.uc.GetUserOrderDetail(uint(orderIDInt), userID)
	if err != nil {
		return response.FromAppError(c, err)
	}

	return c.JSON(fiber.Map{
		"order": FromDomain(order),
	})
}

func (h *OrderHandler) GetOrderSummaryCompat(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "Unauthorized")
	}

	orderIDParam := c.Query("orderId")
	orderIDInt, err := strconv.ParseUint(orderIDParam, 10, 32)
	if err != nil || orderIDInt == 0 {
		return response.BadRequest(c, "Invalid orderId query parameter")
	}

	total, err := h.uc.GetOrderSummary(uint(orderIDInt), userID)
	if err != nil {
		return response.FromAppError(c, err)
	}

	return c.JSON(fiber.Map{
		"total": total,
	})
}

func (h *OrderHandler) PayOrderCompat(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "Unauthorized")
	}

	var req PayOrderRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.BadRequest(c, "Invalid body")
	}

	if req.OrderID == 0 {
		return response.BadRequest(c, "Missing orderId in body")
	}

	redirect, err := h.uc.PayOrder(req.OrderID, userID)
	if err != nil {
		return response.FromAppError(c, err)
	}

	return c.JSON(fiber.Map{
		"redirect": redirect,
	})
}
