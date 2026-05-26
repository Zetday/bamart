package handler

import "project-bamart2/apps/api/internal/features/item/domain"

// ── Request DTOs ─────────────────────────────────────────────────────────────

type CreateItemRequest struct {
	UserID      uint    `json:"userId"`
	CategoryID  *uint   `json:"categoryId"`
	Name        string  `json:"name"`
	Description *string `json:"description"`
	Price       int     `json:"price"`
	Stock       int     `json:"stock"`
	ImageUrl    *string `json:"imageUrl"`
}

type UpdateItemRequest struct {
	UserID      uint    `json:"userId"`
	CategoryID  *uint   `json:"categoryId"`
	Name        string  `json:"name"`
	Description *string `json:"description"`
	Price       int     `json:"price"`
	Stock       int     `json:"stock"`
	ImageUrl    *string `json:"imageUrl"`
}

// ── Response DTOs ────────────────────────────────────────────────────────────

type ItemResponse struct {
	ID          uint    `json:"id"`
	Name        string  `json:"name"`
	Price       int     `json:"price"`
	Stock       int     `json:"stock"`
	Description *string `json:"description"`
	ImageUrl    *string `json:"imageUrl"`
	UserID      uint    `json:"userId"`
	CategoryID  *uint   `json:"categoryId"`
	Seller      string  `json:"seller,omitempty"`
	Category    string  `json:"category,omitempty"`
	Sold        int     `json:"sold"`
}

func FromDomain(item *domain.Item) ItemResponse {
	return ItemResponse{
		ID:          item.ID,
		Name:        item.Name,
		Price:       item.Price,
		Stock:       item.Stock,
		Description: item.Description,
		ImageUrl:    item.ImageUrl,
		UserID:      item.UserID,
		CategoryID:  item.CategoryID,
		Seller:      item.SellerName,
		Category:    item.CategoryName,
		Sold:        item.Sold,
	}
}

func FromDomainList(items []domain.Item) []ItemResponse {
	res := make([]ItemResponse, 0, len(items))
	for _, item := range items {
		res = append(res, FromDomain(&item))
	}
	return res
}
