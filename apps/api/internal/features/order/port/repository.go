package port

import "project-bamart2/apps/api/internal/features/order/domain"

type OrderRepository interface {
	FindByUserID(userID uint) ([]domain.Order, error)
	FindByID(id uint) (*domain.Order, error)
	FindAll() ([]domain.Order, error)
	Create(order *domain.Order) error
	Update(order *domain.Order) error
	Delete(id uint) error
	FindByIDAndUser(orderID uint, userID uint) (*domain.Order, error)
	UpdateStatus(orderID uint, status string) error
	FindTotalByIDAndUser(orderID uint, userID uint) (*int, error)

	GetCartItemsByUserID(userID uint) ([]domain.CartItemDTO, error)
	ClearCartItemsByUserID(userID uint) error
}
