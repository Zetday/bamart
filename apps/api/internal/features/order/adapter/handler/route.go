package handler

import (
	"project-bamart2/apps/api/internal/shared/middleware"

	"github.com/gofiber/fiber/v3"
)

func RegisterRoutes(router fiber.Router, h *OrderHandler, jwtMiddleware fiber.Handler) {
	orders := router.Group("/orders")

	// Protected endpoints (User facing)
	orders.Use(jwtMiddleware)

	orders.Get("/my-orders", h.GetMyOrders)
	orders.Get("/my-order-detail", h.GetUserOrderDetail)
	orders.Get("/summary", h.GetOrderSummary)
	orders.Post("/pay", h.PayOrder)

	// Generic CRUD - Staff only (ADMIN or SELLER)
	staffOnly := orders.Group("", middleware.RequireRole("ADMIN", "SELLER"))
	staffOnly.Get("/", h.GetAll)
	staffOnly.Get("/:id", h.GetByID)
	staffOnly.Put("/:id", h.Update)
	staffOnly.Delete("/:id", h.Delete)

	// Next.js API compatibility (singular order endpoint aliases)
	orderGroup := router.Group("/order")
	orderGroup.Use(jwtMiddleware)
	orderGroup.Get("/list", h.GetMyOrdersCompat)
	orderGroup.Get("/detail", h.GetUserOrderDetailCompat)
	orderGroup.Get("/summary", h.GetOrderSummaryCompat)
	orderGroup.Post("/pay", h.PayOrderCompat)

	router.Post("/checkout", jwtMiddleware, h.Checkout)
}
