package usecase

import (
	"project-bamart2/apps/api/internal/features/category/domain"
	"project-bamart2/apps/api/internal/features/category/port"
	"project-bamart2/apps/api/internal/shared/apperror"
	"time"
)

type CreateCategoryInput struct {
	Name        string
	Description *string
}

type UpdateCategoryInput struct {
	Name        string
	Description *string
}

type CategoryUseCase interface {
	GetAll() ([]domain.Category, error)
	GetByID(id uint) (*domain.Category, error)
	Create(input CreateCategoryInput) (*domain.Category, error)
	Update(id uint, input UpdateCategoryInput) (*domain.Category, error)
	Delete(id uint) error
}

type categoryUseCase struct {
	repo port.CategoryRepository
}

func New(repo port.CategoryRepository) CategoryUseCase {
	return &categoryUseCase{repo: repo}
}

func (uc *categoryUseCase) GetAll() ([]domain.Category, error) {
	return uc.repo.FindAll()
}

func (uc *categoryUseCase) GetByID(id uint) (*domain.Category, error) {
	return uc.repo.FindByID(id)
}

func (uc *categoryUseCase) Create(input CreateCategoryInput) (*domain.Category, error) {
	cat := &domain.Category{
		Name:        input.Name,
		Description: input.Description,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := uc.repo.Create(cat); err != nil {
		return nil, err
	}
	return cat, nil
}

func (uc *categoryUseCase) Update(id uint, input UpdateCategoryInput) (*domain.Category, error) {
	cat, err := uc.repo.FindByID(id)
	if err != nil {
		return nil, apperror.ErrNotFound
	}

	if input.Name != "" {
		cat.Name = input.Name
	}
	cat.Description = input.Description
	cat.UpdatedAt = time.Now()

	if err := uc.repo.Update(cat); err != nil {
		return nil, err
	}
	return cat, nil
}

func (uc *categoryUseCase) Delete(id uint) error {
	_, err := uc.repo.FindByID(id)
	if err != nil {
		return apperror.ErrNotFound
	}
	return uc.repo.Delete(id)
}
