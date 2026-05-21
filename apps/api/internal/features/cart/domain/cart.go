package domain

import "time"

type CartItem struct {
	ID        uint
	CartID    uint
	ItemID    uint
	ItemName  string
	ItemPrice int
	Quantity  int
	Subtotal  int // Quantity * ItemPrice
}

type Cart struct {
	ID        uint
	UserID    uint
	Items     []CartItem
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (c *Cart) CalculateSubtotal() int {
	total := 0
	for _, item := range c.Items {
		total += item.Subtotal
	}
	return total
}
