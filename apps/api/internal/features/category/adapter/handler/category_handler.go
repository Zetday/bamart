package handler

import (
	"strconv"

	"project-bamart2/apps/api/internal/features/category/usecase"
	"project-bamart2/apps/api/internal/shared/response"

	"github.com/gofiber/fiber/v3"
)

type CategoryHandler struct {
	uc usecase.CategoryUseCase
}

func NewCategoryHandler(uc usecase.CategoryUseCase) *CategoryHandler {
	return &CategoryHandler{uc: uc}
}

func (h *CategoryHandler) GetAll(c fiber.Ctx) error {
	cats, err := h.uc.GetAll()
	if err != nil {
		return response.InternalError(c)
	}
	return response.OK(c, "", FromDomainList(cats))
}

func (h *CategoryHandler) GetByID(c fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return response.BadRequest(c, "Invalid ID format")
	}

	cat, err := h.uc.GetByID(uint(id))
	if err != nil {
		return response.FromAppError(c, err)
	}
	return response.OK(c, "", FromDomain(cat))
}

func (h *CategoryHandler) Create(c fiber.Ctx) error {
	var req CreateCategoryRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}
	if req.Name == "" {
		return response.BadRequest(c, "name is required")
	}

	cat, err := h.uc.Create(usecase.CreateCategoryInput{
		Name:        req.Name,
		Description: req.Description,
	})
	if err != nil {
		return response.FromAppError(c, err)
	}
	return response.Created(c, "Category created", FromDomain(cat))
}

func (h *CategoryHandler) Update(c fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return response.BadRequest(c, "Invalid ID format")
	}

	var req UpdateCategoryRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	cat, err := h.uc.Update(uint(id), usecase.UpdateCategoryInput{
		Name:        req.Name,
		Description: req.Description,
	})
	if err != nil {
		return response.FromAppError(c, err)
	}
	return response.OK(c, "Category updated", FromDomain(cat))
}

func (h *CategoryHandler) Delete(c fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return response.BadRequest(c, "Invalid ID format")
	}

	if err := h.uc.Delete(uint(id)); err != nil {
		return response.FromAppError(c, err)
	}
	return response.OK(c, "Category deleted", nil)
}
