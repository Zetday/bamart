package handler

import "github.com/gofiber/fiber/v3"

func RegisterRoutes(router fiber.Router, h *OrderHandler, jwtMiddleware fiber.Handler) {
	orders := router.Group("/orders")

	// Protected endpoints (User facing)
	orders.Use(jwtMiddleware)

	orders.Get("/my-orders", h.GetMyOrders)
	orders.Get("/my-order-detail", h.GetUserOrderDetail)
	orders.Get("/summary", h.GetOrderSummary)
	orders.Post("/pay", h.PayOrder)

	// Generic CRUD (Assuming some admin roles might be needed, add RequireRole if necessary)
	orders.Get("/", h.GetAll)
	orders.Get("/:id", h.GetByID)
	orders.Put("/:id", h.Update)
	orders.Delete("/:id", h.Delete)

	// Next.js API compatibility (singular order endpoint aliases)
	orderGroup := router.Group("/order")
	orderGroup.Use(jwtMiddleware)
	orderGroup.Get("/list", h.GetMyOrdersCompat)
	orderGroup.Get("/detail", h.GetUserOrderDetailCompat)
	orderGroup.Get("/summary", h.GetOrderSummaryCompat)
	orderGroup.Post("/pay", h.PayOrderCompat)

	router.Post("/checkout", jwtMiddleware, h.Checkout)
}
