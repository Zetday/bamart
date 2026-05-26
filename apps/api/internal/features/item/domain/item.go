package domain

import "time"

// Item is the pure domain entity for a product/item in the system.
type Item struct {
	ID          uint
	UserID      uint // The seller who owns this item
	CategoryID  *uint
	Name        string
	Description *string
	Price       int
	Stock       int
	ImageUrl    *string
	CreatedAt   time.Time
	UpdatedAt   time.Time

	// Optional relations loaded depending on context
	SellerName   string
	CategoryName string
	Sold         int
}
