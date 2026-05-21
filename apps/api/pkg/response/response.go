package response

import "github.com/gofiber/fiber/v3"

func Success(c fiber.Ctx, data interface{}) error {
	return c.JSON(fiber.Map{
		"success": true,
		"data":    data,
	})
}
