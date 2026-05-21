package repository

import (
	"errors"
	"strings"
	"time"

	"project-bamart2/apps/api/internal/features/category/domain"
	"project-bamart2/apps/api/internal/features/category/port"
	"project-bamart2/apps/api/internal/shared/apperror"

	"gorm.io/gorm"
)

type categoryRecord struct {
	ID          uint   `gorm:"primaryKey;autoIncrement"`
	Name        string `gorm:"uniqueIndex;not null"`
	Description *string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt `gorm:"index"`
}

func (categoryRecord) TableName() string { return "categories" }

func toRecord(d *domain.Category) *categoryRecord {
	return &categoryRecord{
		ID:          d.ID,
		Name:        d.Name,
		Description: d.Description,
	}
}

func toDomain(r *categoryRecord) *domain.Category {
	return &domain.Category{
		ID:          r.ID,
		Name:        r.Name,
		Description: r.Description,
		CreatedAt:   r.CreatedAt,
		UpdatedAt:   r.UpdatedAt,
	}
}

type gormCategoryRepository struct {
	db *gorm.DB
}

var _ port.CategoryRepository = (*gormCategoryRepository)(nil)

func New(db *gorm.DB) port.CategoryRepository {
	return &gormCategoryRepository{db: db}
}

func (r *gormCategoryRepository) FindAll() ([]domain.Category, error) {
	var records []categoryRecord
	if err := r.db.Find(&records).Error; err != nil {
		return nil, err
	}

	var cats []domain.Category
	for _, rec := range records {
		cats = append(cats, *toDomain(&rec))
	}
	return cats, nil
}

func (r *gormCategoryRepository) FindByID(id uint) (*domain.Category, error) {
	var rec categoryRecord
	if err := r.db.First(&rec, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.ErrNotFound
		}
		return nil, err
	}
	return toDomain(&rec), nil
}

func (r *gormCategoryRepository) Create(cat *domain.Category) error {
	rec := toRecord(cat)
	if err := r.db.Create(rec).Error; err != nil {
		if isUniqueViolation(err) {
			return apperror.ErrDuplicateName
		}
		return err
	}
	cat.ID = rec.ID
	return nil
}

func (r *gormCategoryRepository) Update(cat *domain.Category) error {
	rec := toRecord(cat)
	if err := r.db.Updates(rec).Error; err != nil {
		if isUniqueViolation(err) {
			return apperror.ErrDuplicateName
		}
		return err
	}
	return nil
}

// isUniqueViolation detects PostgreSQL unique constraint errors (code 23505).
func isUniqueViolation(err error) bool {
	return strings.Contains(err.Error(), "23505") ||
		strings.Contains(err.Error(), "unique constraint") ||
		strings.Contains(err.Error(), "duplicate key")
}

func (r *gormCategoryRepository) Delete(id uint) error {
	return r.db.Delete(&categoryRecord{}, id).Error
}
