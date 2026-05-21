package handler

import "github.com/gofiber/fiber/v3"

func RegisterRoutes(router fiber.Router, h *CartHandler, jwtMiddleware fiber.Handler) {
	cart := router.Group("/cart")

	// All cart endpoints should be protected by JWT
	cart.Use(jwtMiddleware)

	cart.Get("/", h.GetMyCart)
	cart.Post("/add", h.AddToCart)
	cart.Delete("/remove", h.RemoveItem)
	cart.Put("/update", h.UpdateQuantity)
	cart.Get("/summary", h.GetSubtotal)
}
