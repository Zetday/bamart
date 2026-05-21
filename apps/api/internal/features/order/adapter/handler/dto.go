package handler

import (
	"time"

	"project-bamart2/apps/api/internal/features/order/domain"
)

type CheckoutRequest struct {
	FullName   string  `json:"fullName"`
	Phone      string  `json:"phone"`
	Address    string  `json:"address"`
	City       string  `json:"city"`
	PostalCode string  `json:"postalCode"`
	Notes      *string `json:"notes"`
	Delivery   string  `json:"delivery"`
}

type UpdateOrderRequest struct {
	TotalPrice int     `json:"totalPrice"`
	Status     string  `json:"status"`
	FullName   string  `json:"fullName"`
	Phone      string  `json:"phone"`
	Address    string  `json:"address"`
	City       string  `json:"city"`
	PostalCode string  `json:"postalCode"`
	Notes      *string `json:"notes"`
}

type PayOrderRequest struct {
	OrderID uint `json:"orderId"`
}

type OrderResponse struct {
	ID         uint                `json:"id"`
	UserID     uint                `json:"userId"`
	OrderDate  time.Time           `json:"orderDate"`
	TotalPrice int                 `json:"totalPrice"`
	Status     string              `json:"status"`
	FullName   string              `json:"fullName"`
	Phone      string              `json:"phone"`
	Address    string              `json:"address"`
	City       string              `json:"city"`
	PostalCode string              `json:"postalCode"`
	Notes      *string             `json:"notes"`
	Items      []OrderItemResponse `json:"items,omitempty"`
}

type OrderItemResponse struct {
	ID       uint   `json:"id"`
	OrderID  uint   `json:"orderId"`
	ItemID   uint   `json:"itemId"`
	ItemName string `json:"itemName"`
	Quantity int    `json:"quantity"`
	Subtotal int    `json:"subtotal"`
}

func FromDomain(o *domain.Order) OrderResponse {
	res := OrderResponse{
		ID:         o.ID,
		UserID:     o.UserID,
		OrderDate:  o.OrderDate,
		TotalPrice: o.TotalPrice,
		Status:     o.Status,
		FullName:   o.FullName,
		Phone:      o.Phone,
		Address:    o.Address,
		City:       o.City,
		PostalCode: o.PostalCode,
		Notes:      o.Notes,
	}
	for _, it := range o.Items {
		res.Items = append(res.Items, OrderItemResponse{
			ID:       it.ID,
			OrderID:  o.ID,
			ItemID:   it.ItemID,
			ItemName: it.ItemName,
			Quantity: it.Quantity,
			Subtotal: it.Subtotal,
		})
	}
	return res
}

func FromDomainList(orders []domain.Order) []OrderResponse {
	res := make([]OrderResponse, 0, len(orders))
	for _, o := range orders {
		res = append(res, FromDomain(&o))
	}
	return res
}
