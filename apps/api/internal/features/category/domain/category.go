package domain

import "time"

// Category represents a product category.
type Category struct {
	ID          uint
	Name        string
	Description *string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
