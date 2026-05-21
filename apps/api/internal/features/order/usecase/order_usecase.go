package usecase

import (
	"errors"
	"strconv"
	"time"

	"project-bamart2/apps/api/internal/features/order/domain"
	"project-bamart2/apps/api/internal/features/order/port"
	"project-bamart2/apps/api/internal/shared/apperror"
)

// ── Input Types ──────────────────────────────────────────────────────────────

type CheckoutInput struct {
	UserID     uint
	FullName   string
	Phone      string
	Address    string
	City       string
	PostalCode string
	Notes      *string
	Delivery   string
}

type UpdateOrderInput struct {
	BuyerID    uint
	TotalPrice int
	Status     string
	FullName   string
	Phone      string
	Address    string
	City       string
	PostalCode string
	Notes      *string
}

// ── Interface ─────────────────────────────────────────────────────────────────

type OrderUseCase interface {
	GetUserOrders(userID uint) ([]domain.Order, error)
	GetByID(id uint) (*domain.Order, error)
	GetAll() ([]domain.Order, error)
	Checkout(input CheckoutInput) (string, error)
	Update(id uint, input UpdateOrderInput) (*domain.Order, error)
	Delete(id uint) error
	GetUserOrderDetail(orderID uint, userID uint) (*domain.Order, error)
	PayOrder(orderID uint, userID uint) (string, error)
	GetOrderSummary(orderID uint, userID uint) (int, error)
}

// ── Implementation ────────────────────────────────────────────────────────────

type orderUseCase struct {
	repo port.OrderRepository
}

func New(repo port.OrderRepository) OrderUseCase {
	return &orderUseCase{repo: repo}
}

func (uc *orderUseCase) GetUserOrders(userID uint) ([]domain.Order, error) {
	return uc.repo.FindByUserID(userID)
}

func (uc *orderUseCase) GetByID(id uint) (*domain.Order, error) {
	order, err := uc.repo.FindByID(id)
	if err != nil {
		return nil, apperror.ErrNotFound
	}
	return order, nil
}

func (uc *orderUseCase) GetAll() ([]domain.Order, error) {
	return uc.repo.FindAll()
}

func (uc *orderUseCase) Checkout(input CheckoutInput) (string, error) {
	// Ambil cart user
	cartItems, err := uc.repo.GetCartItemsByUserID(input.UserID)
	if err != nil {
		return "", err
	}
	if len(cartItems) == 0 {
		return "", errors.New("Cart empty")
	}

	subtotal := 0
	for _, ci := range cartItems {
		subtotal += ci.Quantity * ci.Price
	}

	shippingCost := 0
	if input.Delivery == "cepat" {
		shippingCost = 15000
	} else if input.Delivery == "reguler" {
		shippingCost = 0
	}

	totalPrice := subtotal + shippingCost

	order := &domain.Order{
		UserID:     input.UserID,
		OrderDate:  time.Now(),
		TotalPrice: totalPrice,
		Status:     "PENDING",
		FullName:   input.FullName,
		Phone:      input.Phone,
		Address:    input.Address,
		City:       input.City,
		PostalCode: input.PostalCode,
		Notes:      input.Notes,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	for _, ci := range cartItems {
		order.Items = append(order.Items, domain.OrderItem{
			ItemID:   ci.ItemID,
			ItemName: ci.ItemName,
			Quantity: ci.Quantity,
			Subtotal: ci.Quantity * ci.Price,
		})
	}

	if err := uc.repo.Create(order); err != nil {
		return "", err
	}

	// Kosongkan cart
	_ = uc.repo.ClearCartItemsByUserID(input.UserID)

	redirectURL := "/payment?orderId=" + strconv.Itoa(int(order.ID))
	return redirectURL, nil
}

func (uc *orderUseCase) Update(id uint, input UpdateOrderInput) (*domain.Order, error) {
	order, err := uc.repo.FindByID(id)
	if err != nil {
		return nil, apperror.ErrNotFound
	}

	order.UserID = input.BuyerID
	order.TotalPrice = input.TotalPrice
	order.Status = input.Status
	order.FullName = input.FullName
	order.Phone = input.Phone
	order.Address = input.Address
	order.City = input.City
	order.PostalCode = input.PostalCode
	order.Notes = input.Notes
	order.UpdatedAt = time.Now()

	if err := uc.repo.Update(order); err != nil {
		return nil, err
	}

	return order, nil
}

func (uc *orderUseCase) Delete(id uint) error {
	_, err := uc.repo.FindByID(id)
	if err != nil {
		return apperror.ErrNotFound
	}
	return uc.repo.Delete(id)
}

func (uc *orderUseCase) GetUserOrderDetail(orderID uint, userID uint) (*domain.Order, error) {
	order, err := uc.repo.FindByIDAndUser(orderID, userID)
	if err != nil {
		return nil, apperror.ErrNotFound
	}
	return order, nil
}

func (uc *orderUseCase) PayOrder(orderID uint, userID uint) (string, error) {
	order, err := uc.repo.FindByIDAndUser(orderID, userID)
	if err != nil {
		return "", apperror.ErrNotFound
	}

	if order.Status == "PAID" {
		return "", apperror.ErrOrderAlreadyPaid
	}

	if err := uc.repo.UpdateStatus(orderID, "PAID"); err != nil {
		return "", err
	}

	redirectURL := "/success?orderId=" + strconv.Itoa(int(order.ID))
	return redirectURL, nil
}

func (uc *orderUseCase) GetOrderSummary(orderID uint, userID uint) (int, error) {
	total, err := uc.repo.FindTotalByIDAndUser(orderID, userID)
	if err != nil {
		return 0, apperror.ErrNotFound
	}
	return *total, nil
}
