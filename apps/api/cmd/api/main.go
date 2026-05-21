package main

import (
	"log"

	"project-bamart2/apps/api/internal/features/auth"
	"project-bamart2/apps/api/internal/features/cart"
	"project-bamart2/apps/api/internal/features/category"
	"project-bamart2/apps/api/internal/features/item"
	itemRepo "project-bamart2/apps/api/internal/features/item/adapter/repository"
	"project-bamart2/apps/api/internal/features/order"
	"project-bamart2/apps/api/internal/features/summary"

	"project-bamart2/apps/api/internal/shared/middleware"
	"project-bamart2/apps/api/pkg/config"
	"project-bamart2/apps/api/pkg/database"
	"project-bamart2/apps/api/pkg/token"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
)

func main() {
	// 1. Load configuration
	cfg := config.Load()

	// 2. Setup infrastructure
	db := database.Connect(cfg)
	tokenService := token.New(cfg.JWTSecret)
	jwtMiddleware := middleware.JWTMiddleware(tokenService)

	// 3. Setup features
	// We directly instance the item repository adapter to share it with the cart usecase
	// which prevents import cycles while preserving the Clean Arch boundary.
	itemRepository := itemRepo.New(db)

	authFeature := auth.New(db, tokenService)
	itemFeature := item.New(db)
	categoryFeature := category.New(db)
	cartFeature := cart.New(db, itemRepository)
	orderFeature := order.New(db)
	summaryFeature := summary.New(db)

	// 4. Setup fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c fiber.Ctx, err error) error {
			log.Printf("Error handled: %v", err)
			return c.Status(500).JSON(fiber.Map{"error": "Internal Server Error", "details": err.Error()})
		},
	})

	app.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.AllowedOrigins,
		AllowCredentials: true,
	}))

	// 5. Mount routes
	api := app.Group("/api")

	authFeature.Mount(api, jwtMiddleware)
	itemFeature.Mount(api, jwtMiddleware)
	categoryFeature.Mount(api)
	cartFeature.Mount(api, jwtMiddleware)
	orderFeature.Mount(api, jwtMiddleware)
	summaryFeature.Mount(api, jwtMiddleware)

	// List routes on startup
	for _, r := range app.GetRoutes() {
		log.Println(r.Method, r.Path)
	}

	log.Printf("🚀 Server starting on port %s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}
