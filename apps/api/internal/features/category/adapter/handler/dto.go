package handler

import "project-bamart2/apps/api/internal/features/category/domain"

type CreateCategoryRequest struct {
	Name        string  `json:"name"`
	Description *string `json:"description"`
}

type UpdateCategoryRequest struct {
	Name        string  `json:"name"`
	Description *string `json:"description"`
}

type CategoryResponse struct {
	ID          uint    `json:"id"`
	Name        string  `json:"name"`
	Description *string `json:"description"`
}

func FromDomain(cat *domain.Category) CategoryResponse {
	return CategoryResponse{
		ID:          cat.ID,
		Name:        cat.Name,
		Description: cat.Description,
	}
}

func FromDomainList(cats []domain.Category) []CategoryResponse {
	res := make([]CategoryResponse, 0, len(cats))
	for _, cat := range cats {
		res = append(res, FromDomain(&cat))
	}
	return res
}
