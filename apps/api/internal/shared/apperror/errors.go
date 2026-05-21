package apperror

import "errors"

// Sentinel errors — always compare with errors.Is()
var (
	ErrNotFound           = errors.New("resource not found")
	ErrEmailAlreadyUsed   = errors.New("email already in use")
	ErrDuplicateName      = errors.New("name already exists")
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrInvalidRole        = errors.New("invalid role value")
	ErrMissingFields      = errors.New("required fields are missing")
	ErrPasswordTooShort   = errors.New("password must be at least 6 characters")
	ErrForbidden          = errors.New("forbidden")
	ErrInvalidQuantity    = errors.New("quantity must be greater than 0")
	ErrOrderAlreadyPaid   = errors.New("order is already paid")
)
