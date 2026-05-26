package usecase

import (
	"project-bamart2/apps/api/internal/features/item/domain"
	"project-bamart2/apps/api/internal/features/item/port"
	"project-bamart2/apps/api/internal/shared/apperror"
	"time"
)

// ── Input/Output Types ────────────────────────────────────────────────────────

type CreateItemInput struct {
	UserID      uint
	CategoryID  *uint
	Name        string
	Description *string
	Price       int
	Stock       int
	ImageUrl    *string
}

type UpdateItemInput struct {
	UserID      uint
	CategoryID  *uint
	Name        string
	Description *string
	Price       int
	Stock       int
	ImageUrl    *string
}

// ── Interface ─────────────────────────────────────────────────────────────────

type ItemUseCase interface {
	GetAll(search string) ([]domain.Item, error)
	GetByID(id uint) (*domain.Item, error)
	Create(input CreateItemInput) (*domain.Item, error)
	Update(id uint, input UpdateItemInput) (*domain.Item, error)
	Delete(id uint) error
}

// ── Implementation ────────────────────────────────────────────────────────────

type itemUseCase struct {
	repo port.ItemRepository
}

func New(repo port.ItemRepository) ItemUseCase {
	return &itemUseCase{repo: repo}
}

func (uc *itemUseCase) GetAll(search string) ([]domain.Item, error) {
	return uc.repo.FindAll(search)
}

func (uc *itemUseCase) GetByID(id uint) (*domain.Item, error) {
	item, err := uc.repo.FindByID(id)
	if err != nil {
		return nil, err // Repo should map to apperror.ErrNotFound if record not found
	}
	return item, nil
}

func (uc *itemUseCase) Create(input CreateItemInput) (*domain.Item, error) {
	item := &domain.Item{
		UserID:      input.UserID,
		CategoryID:  input.CategoryID,
		Name:        input.Name,
		Description: input.Description,
		Price:       input.Price,
		Stock:       input.Stock,
		ImageUrl:    input.ImageUrl,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := uc.repo.Create(item); err != nil {
		return nil, err
	}

	// Fetch again to get relations if needed, or simply return constructed
	return uc.GetByID(item.ID)
}

func (uc *itemUseCase) Update(id uint, input UpdateItemInput) (*domain.Item, error) {
	item, err := uc.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// Important: Check ownership via handler/middleware or here if needed.
	// Assuming handler passes the correct UserID to input if authorized.

	if input.Name != "" {
		item.Name = input.Name
	}
	item.Description = input.Description
	item.Price = input.Price
	item.Stock = input.Stock
	item.ImageUrl = input.ImageUrl
	item.CategoryID = input.CategoryID
	if input.UserID != 0 {
		item.UserID = input.UserID
	}
	item.UpdatedAt = time.Now()

	if err := uc.repo.Update(item); err != nil {
		return nil, err
	}

	return uc.GetByID(id)
}

func (uc *itemUseCase) Delete(id uint) error {
	_, err := uc.repo.FindByID(id)
	if err != nil {
		return apperror.ErrNotFound
	}

	return uc.repo.Delete(id)
}
