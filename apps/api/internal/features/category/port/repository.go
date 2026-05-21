package port

import "project-bamart2/apps/api/internal/features/category/domain"

type CategoryRepository interface {
	FindAll() ([]domain.Category, error)
	FindByID(id uint) (*domain.Category, error)
	Create(cat *domain.Category) error
	Update(cat *domain.Category) error
	Delete(id uint) error
}
