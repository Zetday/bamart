package item

import (
	adapterHandler "project-bamart2/apps/api/internal/features/item/adapter/handler"
	adapterRepo "project-bamart2/apps/api/internal/features/item/adapter/repository"
	"project-bamart2/apps/api/internal/features/item/usecase"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

type Feature struct {
	handler *adapterHandler.ItemHandler
}

// New sets up the item feature wiring.
func New(db *gorm.DB) *Feature {
	repo := adapterRepo.New(db)
	uc := usecase.New(repo)
	h := adapterHandler.NewItemHandler(uc)
	return &Feature{handler: h}
}

// Mount attaches the feature routes to a router.
func (f *Feature) Mount(api fiber.Router, jwtMiddleware fiber.Handler) {
	adapterHandler.RegisterRoutes(api, f.handler, jwtMiddleware)
}
