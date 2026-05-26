package repository

import (
	"errors"
	"time"

	"project-bamart2/apps/api/internal/features/item/domain"
	"project-bamart2/apps/api/internal/features/item/port"
	"project-bamart2/apps/api/internal/shared/apperror"

	"gorm.io/gorm"
)

// ── GORM models (Anti-Corruption Layer) ───────────────────────────────────────

type itemRecord struct {
	ID          uint `gorm:"primaryKey;autoIncrement"`
	UserID      uint `gorm:"not null"` // Keep FK to User simple
	CategoryID  *uint
	Name        string `gorm:"not null"`
	Description *string
	Price       int
	Stock       int
	ImageUrl    *string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt `gorm:"index"`

	// Define lightweight relations just for fetching names
	User     userMinimalRecord `gorm:"foreignKey:UserID"`
	Category catMinimalRecord  `gorm:"foreignKey:CategoryID"`
}

func (itemRecord) TableName() string { return "items" }

type userMinimalRecord struct {
	ID   uint `gorm:"primaryKey"`
	Name string
}

func (userMinimalRecord) TableName() string { return "users" }

type catMinimalRecord struct {
	ID   uint `gorm:"primaryKey"`
	Name string
}

func (catMinimalRecord) TableName() string { return "categories" }

// toRecord maps domain.Item to itemRecord for DB
func toRecord(d *domain.Item) *itemRecord {
	return &itemRecord{
		ID:          d.ID,
		UserID:      d.UserID,
		CategoryID:  d.CategoryID,
		Name:        d.Name,
		Description: d.Description,
		Price:       d.Price,
		Stock:       d.Stock,
		ImageUrl:    d.ImageUrl,
	}
}

// toDomain maps itemRecord to domain.Item for business logic
func toDomain(r *itemRecord) *domain.Item {
	d := &domain.Item{
		ID:          r.ID,
		UserID:      r.UserID,
		CategoryID:  r.CategoryID,
		Name:        r.Name,
		Description: r.Description,
		Price:       r.Price,
		Stock:       r.Stock,
		ImageUrl:    r.ImageUrl,
		CreatedAt:   r.CreatedAt,
		UpdatedAt:   r.UpdatedAt,
	}

	if r.User.Name != "" {
		d.SellerName = r.User.Name
	}
	if r.Category.Name != "" {
		d.CategoryName = r.Category.Name
	}

	return d
}

// ── Repository Implementation ─────────────────────────────────────────────────

type gormItemRepository struct {
	db *gorm.DB
}

var _ port.ItemRepository = (*gormItemRepository)(nil)

func New(db *gorm.DB) port.ItemRepository {
	db.AutoMigrate(&itemRecord{})
	return &gormItemRepository{db: db}
}

func (r *gormItemRepository) Create(item *domain.Item) error {
	rec := toRecord(item)
	if err := r.db.Create(rec).Error; err != nil {
		return err
	}
	item.ID = rec.ID
	return nil
}

func (r *gormItemRepository) FindByID(id uint) (*domain.Item, error) {
	var rec itemRecord
	err := r.db.
		Preload("User").
		Preload("Category").
		First(&rec, id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.ErrNotFound
		}
		return nil, err
	}

	dom := toDomain(&rec)

	var totalSold int64
	r.db.Table("order_items").Where("item_id = ?", id).Select("COALESCE(SUM(quantity), 0)").Row().Scan(&totalSold)
	dom.Sold = int(totalSold)

	return dom, nil
}

func (r *gormItemRepository) Update(item *domain.Item) error {
	rec := toRecord(item)
	return r.db.Session(&gorm.Session{FullSaveAssociations: false}).
		Updates(rec).Error
}

func (r *gormItemRepository) Delete(id uint) error {
	return r.db.Delete(&itemRecord{}, id).Error
}

func (r *gormItemRepository) FindAll(search string) ([]domain.Item, error) {
	var records []itemRecord

	query := r.db.
		Preload("User").
		Preload("Category")

	if search != "" {
		like := "%" + search + "%"
		query = query.Where(
			r.db.Where("name ILIKE ?", like).
				Or("description ILIKE ?", like),
		)
	}

	if err := query.Find(&records).Error; err != nil {
		return nil, err
	}

	var items []domain.Item
	for _, rec := range records {
		items = append(items, *toDomain(&rec))
	}
	return items, nil
}
