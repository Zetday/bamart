package summary

import (
	adapterHandler "project-bamart2/apps/api/internal/features/summary/adapter/handler"
	adapterRepo "project-bamart2/apps/api/internal/features/summary/adapter/repository"
	"project-bamart2/apps/api/internal/features/summary/usecase"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

type Feature struct {
	handler *adapterHandler.SummaryHandler
}

func New(db *gorm.DB) *Feature {
	repo := adapterRepo.New(db)
	uc := usecase.New(repo)
	h := adapterHandler.NewSummaryHandler(uc)
	return &Feature{handler: h}
}

func (f *Feature) Mount(api fiber.Router, jwtMiddleware fiber.Handler) {
	adapterHandler.RegisterRoutes(api, f.handler, jwtMiddleware)
}
