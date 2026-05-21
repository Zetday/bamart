package usecase

import (
	"errors"

	"project-bamart2/apps/api/internal/features/cart/domain"
	"project-bamart2/apps/api/internal/features/cart/port"
	itemPort "project-bamart2/apps/api/internal/features/item/port"
	"project-bamart2/apps/api/internal/shared/apperror"
)

type AddToCartInput struct {
	UserID uint
	ItemID uint
	Qty    int
}

type CartUseCase interface {
	GetByUserID(userID uint) (*domain.Cart, error)
	AddToCart(input AddToCartInput) (string, error)
	RemoveItem(cartItemID, userID uint) error
	UpdateQuantity(cartItemID, userID uint, qty int) error
	GetSubtotal(userID uint) (int, error)
}

type cartUseCase struct {
	cartRepo port.CartRepository
	itemRepo itemPort.ItemRepository // Cross-feature dependency on interface
}

func New(cartRepo port.CartRepository, itemRepo itemPort.ItemRepository) CartUseCase {
	return &cartUseCase{
		cartRepo: cartRepo,
		itemRepo: itemRepo,
	}
}

func (uc *cartUseCase) GetByUserID(userID uint) (*domain.Cart, error) {
	cart, err := uc.cartRepo.FindByUserID(userID)
	if err != nil {
		if errors.Is(err, apperror.ErrNotFound) {
			// Return empty instead of error
			return &domain.Cart{
				UserID: userID,
				Items:  []domain.CartItem{},
			}, nil
		}
		return nil, err
	}
	return cart, nil
}

func (uc *cartUseCase) AddToCart(input AddToCartInput) (string, error) {
	product, err := uc.itemRepo.FindByID(input.ItemID)
	if err != nil {
		return "", apperror.ErrNotFound
	}

	cart, err := uc.cartRepo.FindByUserID(input.UserID)
	if errors.Is(err, apperror.ErrNotFound) {
		cart, err = uc.cartRepo.CreateCart(input.UserID)
		if err != nil {
			return "", err
		}
	} else if err != nil {
		return "", err
	}

	existing, err := uc.cartRepo.FindItem(cart.ID, input.ItemID)
	if err == nil && existing != nil {
		existing.Quantity += input.Qty
		existing.Subtotal = existing.Quantity * product.Price

		if err := uc.cartRepo.UpdateItem(existing); err != nil {
			return "", err
		}
		return "Updated quantity", nil
	}

	newItem := &domain.CartItem{
		CartID:   cart.ID,
		ItemID:   input.ItemID,
		Quantity: input.Qty,
		Subtotal: input.Qty * product.Price,
	}

	if err := uc.cartRepo.CreateItem(newItem); err != nil {
		return "", err
	}
	return "Added to cart", nil
}

func (uc *cartUseCase) RemoveItem(cartItemID, userID uint) error {
	return uc.cartRepo.DeleteItem(cartItemID, userID)
}

func (uc *cartUseCase) UpdateQuantity(cartItemID, userID uint, qty int) error {
	if qty <= 0 {
		return apperror.ErrInvalidQuantity
	}

	cartItem, err := uc.cartRepo.FindItemByID(cartItemID)
	if err != nil {
		return apperror.ErrNotFound
	}

	cart, err := uc.cartRepo.FindByUserID(userID)
	if err != nil || cartItem.CartID != cart.ID {
		return apperror.ErrForbidden
	}

	// Wait, we need item price here! FindItemByID gives us domain.CartItem, does it have price?
	// It relies on DB to include item info
	cartItem.Quantity = qty
	cartItem.Subtotal = qty * cartItem.ItemPrice

	return uc.cartRepo.UpdateItem(cartItem)
}

func (uc *cartUseCase) GetSubtotal(userID uint) (int, error) {
	cart, err := uc.cartRepo.FindCartWithItems(userID)
	if err != nil {
		if errors.Is(err, apperror.ErrNotFound) {
			return 0, nil
		}
		return 0, err
	}

	return cart.CalculateSubtotal(), nil
}
