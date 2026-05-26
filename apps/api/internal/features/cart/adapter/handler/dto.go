package handler

import "project-bamart2/apps/api/internal/features/cart/domain"

type AddToCartRequest struct {
	ItemID   uint `json:"itemId"`
	Quantity int  `json:"quantity"` // Optional, def: 1
}

type RemoveFromCartRequest struct {
	CartItemID uint `json:"cartItemId"`
}

type UpdateCartQuantityRequest struct {
	CartItemID uint `json:"cartItemId"`
	Quantity   int  `json:"quantity"`
}

type CartItemResponse struct {
	ID           uint   `json:"id"`
	CartID       uint   `json:"cartId"`
	ItemID       uint   `json:"itemId"`
	ItemName     string `json:"itemName"`
	ItemPrice    int    `json:"itemPrice"`
	ItemImageUrl string `json:"itemImageUrl"`
	Quantity     int    `json:"quantity"`
	Subtotal     int    `json:"subtotal"`
}

type CartResponse struct {
	ID        uint               `json:"id"`
	UserID    uint               `json:"userId"`
	Items     []CartItemResponse `json:"items"`
	Total     int                `json:"total"`
	CreatedAt string             `json:"createdAt"`
	UpdatedAt string             `json:"updatedAt"`
}

func FromDomain(c *domain.Cart) CartResponse {
	res := CartResponse{
		ID:        c.ID,
		UserID:    c.UserID,
		Total:     c.CalculateSubtotal(),
		CreatedAt: c.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: c.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	for _, it := range c.Items {
		res.Items = append(res.Items, CartItemResponse{
			ID:           it.ID,
			CartID:       it.CartID,
			ItemID:       it.ItemID,
			ItemName:     it.ItemName,
			ItemPrice:    it.ItemPrice,
			ItemImageUrl: it.ItemImageUrl,
			Quantity:     it.Quantity,
			Subtotal:     it.Subtotal,
		})
	}
	return res
}
