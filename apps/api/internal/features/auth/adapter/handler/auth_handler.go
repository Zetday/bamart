package handler

import (
	"errors"

	"project-bamart2/apps/api/internal/features/auth/usecase"
	"project-bamart2/apps/api/internal/shared/apperror"
	"project-bamart2/apps/api/internal/shared/middleware"
	"project-bamart2/apps/api/internal/shared/response"

	"github.com/gofiber/fiber/v3"
)

type AuthHandler struct {
	uc usecase.AuthUseCase
}

func NewAuthHandler(uc usecase.AuthUseCase) *AuthHandler {
	return &AuthHandler{uc: uc}
}

// POST /api/auth/register
func (h *AuthHandler) Register(c fiber.Ctx) error {
	var req RegisterRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}
	if req.Name == "" || req.Email == "" || req.Password == "" {
		return response.ValidationError(c, apperror.ErrMissingFields)
	}

	if err := h.uc.Register(usecase.RegisterInput{
		Name:     req.Name,
		Email:    req.Email,
		Password: req.Password,
		Role:     req.Role,
	}); err != nil {
		return response.FromAppError(c, err)
	}

	return response.Created(c, "User registered successfully", nil)
}

// POST /api/auth/login
func (h *AuthHandler) Login(c fiber.Ctx) error {
	var req LoginRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}
	if req.Email == "" || req.Password == "" {
		return response.ValidationError(c, apperror.ErrMissingFields)
	}

	result, err := h.uc.Login(req.Email, req.Password)
	if err != nil {
		if errors.Is(err, apperror.ErrInvalidCredentials) {
			return response.Unauthorized(c, err.Error())
		}
		return response.InternalError(c)
	}

	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    result.Token,
		HTTPOnly: true,
		Secure:   false, // set true in production (HTTPS)
		Path:     "/",
		MaxAge:   60 * 60 * 24 * 7,
	})

	return response.OK(c, "Login successful", UserResponse{
		ID:    result.User.ID,
		Name:  result.User.Name,
		Email: result.User.Email,
		Role:  string(result.User.Role),
	})
}

// POST /api/auth/logout
func (h *AuthHandler) Logout(c fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    "",
		Path:     "/",
		HTTPOnly: true,
		MaxAge:   -1,
	})
	return response.OK(c, "Logged out", nil)
}

// GET /api/auth/me  (protected — requires JWTMiddleware)
func (h *AuthHandler) Me(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	user, err := h.uc.GetUserByID(userID)
	if err != nil {
		return response.FromAppError(c, err)
	}

	return response.OK(c, "", UserResponse{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
		Role:  string(user.Role),
	})
}

// GET /api/brands
func (h *AuthHandler) GetBrands(c fiber.Ctx) error {
	brands, err := h.uc.GetBrands()
	if err != nil {
		return response.InternalError(c)
	}

	type BrandResponse struct {
		ID   uint   `json:"id"`
		Name string `json:"name"`
	}

	var res []BrandResponse
	for _, b := range brands {
		res = append(res, BrandResponse{ID: b.ID, Name: b.Name})
	}

	return c.Status(200).JSON(res) // Match NextJS raw JSON array response
}

// GET /api/users
func (h *AuthHandler) GetAllUsers(c fiber.Ctx) error {
	role := c.Query("role")
	users, err := h.uc.GetAllUsers(role)
	if err != nil {
		return response.InternalError(c)
	}

	res := make([]UserResponse, 0, len(users))
	for _, u := range users {
		res = append(res, UserResponse{
			ID:    u.ID,
			Name:  u.Name,
			Email: u.Email,
			Role:  string(u.Role),
		})
	}

	return response.OK(c, "", res)
}

