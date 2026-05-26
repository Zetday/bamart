package handler

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"project-bamart2/apps/api/internal/features/item/usecase"
	"project-bamart2/apps/api/internal/shared/middleware"
	"project-bamart2/apps/api/internal/shared/response"

	"github.com/gofiber/fiber/v3"
)

type ItemHandler struct {
	uc usecase.ItemUseCase
}

func NewItemHandler(uc usecase.ItemUseCase) *ItemHandler {
	return &ItemHandler{uc: uc}
}

// GET /api/items
func (h *ItemHandler) GetAll(c fiber.Ctx) error {
	search := c.Query("search")

	items, err := h.uc.GetAll(search)
	if err != nil {
		return response.InternalError(c)
	}

	return response.OK(c, "", FromDomainList(items))
}

// GET /api/items/:id
func (h *ItemHandler) GetByID(c fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return response.BadRequest(c, "Invalid ID format")
	}

	item, err := h.uc.GetByID(uint(id))
	if err != nil {
		return response.FromAppError(c, err)
	}

	return response.OK(c, "", FromDomain(item))
}

// POST /api/items
func (h *ItemHandler) Create(c fiber.Ctx) error {
	var req CreateItemRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	// Always take userID from JWT context unless ADMIN override is active
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "Unauthorized")
	}

	userRole := middleware.GetUserRole(c)
	targetUserID := userID
	if userRole == "ADMIN" && req.UserID != 0 {
		targetUserID = req.UserID
	}

	item, err := h.uc.Create(usecase.CreateItemInput{
		UserID:      targetUserID,
		CategoryID:  req.CategoryID,
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Stock:       req.Stock,
		ImageUrl:    req.ImageUrl,
	})
	if err != nil {
		return response.FromAppError(c, err)
	}

	return response.Created(c, "Item created successfully", FromDomain(item))
}

// PUT /api/items/:id
func (h *ItemHandler) Update(c fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return response.BadRequest(c, "Invalid ID format")
	}

	var req UpdateItemRequest
	if err := c.Bind().Body(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "Unauthorized")
	}

	existingItem, err := h.uc.GetByID(uint(id))
	if err != nil {
		return response.FromAppError(c, err)
	}

	userRole := middleware.GetUserRole(c)
	if userRole != "ADMIN" && existingItem.UserID != userID {
		return response.Forbidden(c)
	}

	targetUserID := userID
	if userRole == "ADMIN" {
		if req.UserID != 0 {
			targetUserID = req.UserID
		} else {
			targetUserID = existingItem.UserID
		}
	}

	item, err := h.uc.Update(uint(id), usecase.UpdateItemInput{
		UserID:      targetUserID,
		CategoryID:  req.CategoryID,
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Stock:       req.Stock,
		ImageUrl:    req.ImageUrl,
	})
	if err != nil {
		return response.FromAppError(c, err)
	}

	return response.OK(c, "Item updated successfully", FromDomain(item))
}

// DELETE /api/items/:id
func (h *ItemHandler) Delete(c fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return response.BadRequest(c, "Invalid ID format")
	}

	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "Unauthorized")
	}

	existingItem, err := h.uc.GetByID(uint(id))
	if err != nil {
		return response.FromAppError(c, err)
	}

	userRole := middleware.GetUserRole(c)
	if userRole != "ADMIN" && existingItem.UserID != userID {
		return response.Forbidden(c)
	}

	if err := h.uc.Delete(uint(id)); err != nil {
		return response.FromAppError(c, err)
	}

	return response.OK(c, "Item deleted successfully", nil)
}

// POST /api/items/upload (multipart form logic)
func (h *ItemHandler) UploadImage(c fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return response.BadRequest(c, "No file uploaded")
	}

	oldImageUrl := c.FormValue("oldImageUrl")

	// Create new file name
	fileName := fmt.Sprintf("%d-%s", time.Now().UnixMilli(), strings.ReplaceAll(file.Filename, " ", "_"))

	// Fiber standard uses string for save path
	filePath := filepath.Join(".", "public", "items", fileName)

	// save new file
	if err := c.SaveFile(file, filePath); err != nil {
		return response.InternalError(c)
	}

	// Remove old image if exists
	if oldImageUrl != "" {
		fileNameFromOld := strings.Replace(oldImageUrl, "/api/public/items/", "", 1)
		fileNameFromOld = strings.Replace(fileNameFromOld, "/items/", "", 1)
		
		oldPath := filepath.Join(".", "public", "items", fileNameFromOld)
		_ = os.Remove(oldPath) // ignores error, just like Next.js `catch(() => {})`
	}

	// Because Next.js returns flat response, verify if it was flat
	return c.JSON(fiber.Map{
		"url": fmt.Sprintf("/items/%s", fileName),
	})
}
