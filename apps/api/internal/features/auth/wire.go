// Package auth wires all layers of the auth feature together.
// main.go calls auth.New(...) and then f.Mount(api, jwtMiddleware).
package auth

import (
	adapterHandler "project-bamart2/apps/api/internal/features/auth/adapter/handler"
	adapterRepo "project-bamart2/apps/api/internal/features/auth/adapter/repository"
	"project-bamart2/apps/api/internal/features/auth/usecase"
	"project-bamart2/apps/api/pkg/token"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

// Feature is the public handle for the auth module.
type Feature struct {
	handler *adapterHandler.AuthHandler
}

// New wires the entire auth feature: repo → use case → handler.
func New(db *gorm.DB, ts *token.JWTService) *Feature {
	repo := adapterRepo.New(db)
	uc := usecase.New(repo, ts)
	h := adapterHandler.NewAuthHandler(uc)
	return &Feature{handler: h}
}

// Mount registers all auth routes on the given Fiber router group.
func (f *Feature) Mount(api fiber.Router, jwtMiddleware fiber.Handler) {
	adapterHandler.RegisterRoutes(api, f.handler, jwtMiddleware)
}
