package cart

import (
	adapterHandler "project-bamart2/apps/api/internal/features/cart/adapter/handler"
	adapterRepo "project-bamart2/apps/api/internal/features/cart/adapter/repository"
	"project-bamart2/apps/api/internal/features/cart/usecase"

	itemPort "project-bamart2/apps/api/internal/features/item/port"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

type Feature struct {
	handler *adapterHandler.CartHandler
}

func New(db *gorm.DB, itemRepo itemPort.ItemRepository) *Feature {
	repo := adapterRepo.New(db)
	uc := usecase.New(repo, itemRepo)
	h := adapterHandler.NewCartHandler(uc)
	return &Feature{handler: h}
}

func (f *Feature) Mount(api fiber.Router, jwtMiddleware fiber.Handler) {
	adapterHandler.RegisterRoutes(api, f.handler, jwtMiddleware)
}
