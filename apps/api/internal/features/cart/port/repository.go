package port

import "project-bamart2/apps/api/internal/features/cart/domain"

type CartRepository interface {
	FindByUserID(userID uint) (*domain.Cart, error)
	CreateCart(userID uint) (*domain.Cart, error)
	FindItem(cartID, itemID uint) (*domain.CartItem, error)
	FindItemByID(id uint) (*domain.CartItem, error)
	CreateItem(item *domain.CartItem) error
	UpdateItem(item *domain.CartItem) error
	DeleteItem(cartItemID uint, userID uint) error
	FindCartWithItems(userID uint) (*domain.Cart, error)
}
