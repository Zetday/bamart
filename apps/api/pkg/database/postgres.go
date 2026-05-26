package database

import (
	"log"
	"time"

	"project-bamart2/apps/api/pkg/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Connect opens and validates a Postgres connection via GORM.
// Panics on failure — unrecoverable at startup.
func Connect(cfg *config.Config) *gorm.DB {
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	})
	if err != nil {
		log.Fatalf("[database] failed to connect: %v", err)
	}

	log.Println("[database] connected to PostgreSQL")
	return db
}
