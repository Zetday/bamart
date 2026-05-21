package response

import (
	"errors"

	"project-bamart2/apps/api/internal/shared/apperror"

	"github.com/gofiber/fiber/v3"
)

type envelope struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Data    any    `json:"data,omitempty"`
	Error   string `json:"error,omitempty"`
}

func OK(c fiber.Ctx, msg string, data any) error {
	return c.Status(200).JSON(envelope{Success: true, Message: msg, Data: data})
}

func Created(c fiber.Ctx, msg string, data any) error {
	return c.Status(201).JSON(envelope{Success: true, Message: msg, Data: data})
}

func BadRequest(c fiber.Ctx, msg string) error {
	return c.Status(400).JSON(envelope{Success: false, Error: msg})
}

func ValidationError(c fiber.Ctx, err error) error {
	return c.Status(422).JSON(envelope{Success: false, Error: err.Error()})
}

func Unauthorized(c fiber.Ctx, msg string) error {
	return c.Status(401).JSON(envelope{Success: false, Error: msg})
}

func Forbidden(c fiber.Ctx) error {
	return c.Status(403).JSON(envelope{Success: false, Error: "Forbidden"})
}

func NotFound(c fiber.Ctx, msg string) error {
	return c.Status(404).JSON(envelope{Success: false, Error: msg})
}

func Conflict(c fiber.Ctx, msg string) error {
	return c.Status(409).JSON(envelope{Success: false, Error: msg})
}

func InternalError(c fiber.Ctx) error {
	return c.Status(500).JSON(envelope{Success: false, Error: "Internal server error"})
}

// FromAppError maps sentinel domain errors to the correct HTTP status.
func FromAppError(c fiber.Ctx, err error) error {
	switch {
	case errors.Is(err, apperror.ErrNotFound):
		return NotFound(c, err.Error())
	case errors.Is(err, apperror.ErrEmailAlreadyUsed),
		errors.Is(err, apperror.ErrDuplicateName):
		return Conflict(c, err.Error())
	case errors.Is(err, apperror.ErrInvalidCredentials):
		return Unauthorized(c, err.Error())
	case errors.Is(err, apperror.ErrForbidden):
		return Forbidden(c)
	case errors.Is(err, apperror.ErrOrderAlreadyPaid):
		return BadRequest(c, err.Error())
	case errors.Is(err, apperror.ErrMissingFields),
		errors.Is(err, apperror.ErrPasswordTooShort),
		errors.Is(err, apperror.ErrInvalidRole),
		errors.Is(err, apperror.ErrInvalidQuantity):
		return ValidationError(c, err)
	default:
		return InternalError(c)
	}
}
