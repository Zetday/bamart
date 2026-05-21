package category

import (
	adapterHandler "project-bamart2/apps/api/internal/features/category/adapter/handler"
	adapterRepo "project-bamart2/apps/api/internal/features/category/adapter/repository"
	"project-bamart2/apps/api/internal/features/category/usecase"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

type Feature struct {
	handler *adapterHandler.CategoryHandler
}

func New(db *gorm.DB) *Feature {
	repo := adapterRepo.New(db)
	uc := usecase.New(repo)
	h := adapterHandler.NewCategoryHandler(uc)
	return &Feature{handler: h}
}

func (f *Feature) Mount(api fiber.Router) {
	adapterHandler.RegisterRoutes(api, f.handler)
}
