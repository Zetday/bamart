package handler

import "github.com/gofiber/fiber/v3"

func RegisterRoutes(router fiber.Router, h *CategoryHandler) {
	cats := router.Group("/categories")

	cats.Get("/", h.GetAll)
	cats.Get("/:id", h.GetByID)
	cats.Post("/", h.Create) // Might want to restrict to Admin
	cats.Put("/:id", h.Update)
	cats.Delete("/:id", h.Delete)
}
