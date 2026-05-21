package port

import "project-bamart2/apps/api/internal/features/item/domain"

// ItemRepository defines the data access contract for items.
type ItemRepository interface {
	FindByID(id uint) (*domain.Item, error)
	FindAll(search string) ([]domain.Item, error)
	Create(item *domain.Item) error
	Update(item *domain.Item) error
	Delete(id uint) error
}
