package order

import (
	adapterHandler "project-bamart2/apps/api/internal/features/order/adapter/handler"
	adapterRepo "project-bamart2/apps/api/internal/features/order/adapter/repository"
	"project-bamart2/apps/api/internal/features/order/usecase"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

type Feature struct {
	handler *adapterHandler.OrderHandler
}

func New(db *gorm.DB) *Feature {
	repo := adapterRepo.New(db)
	uc := usecase.New(repo)
	h := adapterHandler.NewOrderHandler(uc)
	return &Feature{handler: h}
}

func (f *Feature) Mount(api fiber.Router, jwtMiddleware fiber.Handler) {
	adapterHandler.RegisterRoutes(api, f.handler, jwtMiddleware)
}
