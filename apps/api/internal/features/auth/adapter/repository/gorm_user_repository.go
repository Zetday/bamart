package repository

import (
	"time"

	"project-bamart2/apps/api/internal/features/auth/domain"
	"project-bamart2/apps/api/internal/features/auth/port"

	"gorm.io/gorm"
)

// ── GORM record (anti-corruption layer) ─────────────────────────────────────
// This struct is the only place in the codebase that carries GORM tags for users.
// It never leaks outside this file.

type userRecord struct {
	ID        uint   `gorm:"primaryKey;autoIncrement"`
	Name      string `gorm:"size:255;not null"`
	Email     string `gorm:"size:255;uniqueIndex;not null"`
	Password  string `gorm:"size:255;not null"`
	Role      string `gorm:"type:varchar(20);default:'BUYER'"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

func (userRecord) TableName() string { return "users" }

// toRecord maps a domain entity → GORM record for writes.
func toRecord(u *domain.User) *userRecord {
	return &userRecord{
		ID:       u.ID,
		Name:     u.Name,
		Email:    u.Email,
		Password: u.Password,
		Role:     string(u.Role),
	}
}

// toDomain maps a GORM record → domain entity for reads.
func toDomain(r *userRecord) *domain.User {
	return &domain.User{
		ID:        r.ID,
		Name:      r.Name,
		Email:     r.Email,
		Password:  r.Password,
		Role:      domain.Role(r.Role),
		CreatedAt: r.CreatedAt,
	}
}

// ── Repository ───────────────────────────────────────────────────────────────

type gormUserRepository struct {
	db *gorm.DB
}

// Compile-time interface check
var _ port.UserRepository = (*gormUserRepository)(nil)

func New(db *gorm.DB) port.UserRepository {
	db.AutoMigrate(&userRecord{})
	return &gormUserRepository{db: db}
}

func (r *gormUserRepository) Create(user *domain.User) error {
	rec := toRecord(user)
	if err := r.db.Create(rec).Error; err != nil {
		return err
	}
	user.ID = rec.ID // propagate auto-generated ID back to the caller
	return nil
}

func (r *gormUserRepository) FindByEmail(email string) (*domain.User, error) {
	var rec userRecord
	if err := r.db.Where("email = ?", email).First(&rec).Error; err != nil {
		return nil, err
	}
	return toDomain(&rec), nil
}

func (r *gormUserRepository) FindByID(id uint) (*domain.User, error) {
	var rec userRecord
	if err := r.db.Select("id", "name", "email", "role", "created_at").
		First(&rec, id).Error; err != nil {
		return nil, err
	}
	return toDomain(&rec), nil
}

func (r *gormUserRepository) FindByRole(role string) ([]domain.User, error) {
	var records []userRecord
	if err := r.db.Select("id", "name").Where("role = ?", role).Order("name asc").Find(&records).Error; err != nil {
		return nil, err
	}
	
	var users []domain.User
	for _, rec := range records {
		users = append(users, *toDomain(&rec))
	}
	return users, nil
}

func (r *gormUserRepository) FindAll() ([]domain.User, error) {
	var records []userRecord
	if err := r.db.Order("id desc").Find(&records).Error; err != nil {
		return nil, err
	}
	
	var users []domain.User
	for _, rec := range records {
		users = append(users, *toDomain(&rec))
	}
	return users, nil
}

