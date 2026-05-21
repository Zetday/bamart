package domain

import "time"

type OrderItem struct {
	ID       uint
	OrderID  uint
	ItemID   uint
	ItemName string
	Quantity int
	Subtotal int
}

type CartItemDTO struct {
	CartID   uint
	ItemID   uint
	ItemName string
	Quantity int
	Price    int
}

type Order struct {
	ID         uint
	UserID     uint
	OrderDate  time.Time
	TotalPrice int
	Status     string
	Items      []OrderItem

	// Address Info
	FullName   string
	Phone      string
	Address    string
	City       string
	PostalCode string
	Notes      *string

	CreatedAt time.Time
	UpdatedAt time.Time
}
