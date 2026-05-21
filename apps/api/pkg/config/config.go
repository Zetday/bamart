package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

// Config holds all application-level configuration loaded from environment.
// Pass this struct through your DI chain — never call os.Getenv() in business logic.
type Config struct {
	DatabaseURL    string
	JWTSecret      string
	Port           string
	AllowedOrigins []string
}

// Load reads the .env file (if present) and returns a validated Config.
// Panics if a required value is missing — fail fast at startup.
func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("[config] no .env file found, using system environment")
	}

	return &Config{
		DatabaseURL:    mustGetEnv("DATABASE_URL"),
		JWTSecret:      mustGetEnv("JWT_SECRET"),
		Port:           getEnvOrDefault("PORT", "8000"),
		AllowedOrigins: strings.Split(getEnvOrDefault("ALLOWED_ORIGINS", "http://localhost:3000"), ","),
	}
}

func mustGetEnv(key string) string {
	val := os.Getenv(key)
	if val == "" {
		log.Fatalf("[config] required environment variable %q is not set", key)
	}
	return val
}

func getEnvOrDefault(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
