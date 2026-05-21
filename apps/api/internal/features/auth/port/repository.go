package port

import "project-bamart2/apps/api/internal/features/auth/domain"

// UserRepository defines the data access contract for the auth feature.
// The use case depends on this interface, never on the concrete GORM implementation.
type UserRepository interface {
	Create(user *domain.User) error
	FindByEmail(email string) (*domain.User, error)
	FindByID(id uint) (*domain.User, error)
	FindByRole(role string) ([]domain.User, error)
}
