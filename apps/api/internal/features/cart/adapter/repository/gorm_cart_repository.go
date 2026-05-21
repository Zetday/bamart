package repository

import (
	"errors"
	"time"

	"project-bamart2/apps/api/internal/features/cart/domain"
	"project-bamart2/apps/api/internal/features/cart/port"
	"project-bamart2/apps/api/internal/shared/apperror"

	"gorm.io/gorm"
)

type cartRecord struct {
	ID        uint `gorm:"primaryKey;autoIncrement"`
	UserID    uint `gorm:"uniqueIndex;not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`

	Items []cartItemRecord `gorm:"foreignKey:CartID"`
}

func (cartRecord) TableName() string { return "carts" }

type cartItemRecord struct {
	ID       uint `gorm:"primaryKey;autoIncrement"`
	CartID   uint `gorm:"not null"`
	ItemID   uint `gorm:"not null"`
	Quantity int  `gorm:"default:1"`
	Subtotal int

	// Lightweight relation just for price/name mapping
	Item itemMinimal `gorm:"foreignKey:ItemID"`
}

func (cartItemRecord) TableName() string { return "cart_items" }

type itemMinimal struct {
	ID    uint
	Name  string
	Price int
}

func (itemMinimal) TableName() string { return "items" }

func toDomainCart(r *cartRecord) *domain.Cart {
	d := &domain.Cart{
		ID:        r.ID,
		UserID:    r.UserID,
		CreatedAt: r.CreatedAt,
		UpdatedAt: r.UpdatedAt,
	}
	for _, ir := range r.Items {
		d.Items = append(d.Items, *toDomainItem(&ir))
	}
	return d
}

func toDomainItem(r *cartItemRecord) *domain.CartItem {
	return &domain.CartItem{
		ID:        r.ID,
		CartID:    r.CartID,
		ItemID:    r.ItemID,
		ItemName:  r.Item.Name,
		ItemPrice: r.Item.Price,
		Quantity:  r.Quantity,
		Subtotal:  r.Subtotal,
	}
}

type gormCartRepository struct {
	db *gorm.DB
}

var _ port.CartRepository = (*gormCartRepository)(nil)

func New(db *gorm.DB) port.CartRepository {
	return &gormCartRepository{db: db}
}

func (r *gormCartRepository) FindByUserID(userID uint) (*domain.Cart, error) {
	var rec cartRecord
	err := r.db.Where("user_id = ?", userID).Preload("Items.Item").First(&rec).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.ErrNotFound
		}
		return nil, err
	}
	return toDomainCart(&rec), nil
}

func (r *gormCartRepository) FindCartWithItems(userID uint) (*domain.Cart, error) {
	return r.FindByUserID(userID) // Implementation matches exactly
}

func (r *gormCartRepository) CreateCart(userID uint) (*domain.Cart, error) {
	rec := &cartRecord{UserID: userID}
	if err := r.db.Create(rec).Error; err != nil {
		return nil, err
	}
	return toDomainCart(rec), nil
}

func (r *gormCartRepository) FindItem(cartID, itemID uint) (*domain.CartItem, error) {
	var rec cartItemRecord
	if err := r.db.Where("cart_id = ? AND item_id = ?", cartID, itemID).Preload("Item").First(&rec).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.ErrNotFound
		}
		return nil, err
	}
	return toDomainItem(&rec), nil
}

func (r *gormCartRepository) FindItemByID(id uint) (*domain.CartItem, error) {
	var rec cartItemRecord
	if err := r.db.Preload("Item").First(&rec, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.ErrNotFound
		}
		return nil, err
	}
	return toDomainItem(&rec), nil
}

func (r *gormCartRepository) CreateItem(item *domain.CartItem) error {
	rec := &cartItemRecord{
		CartID:   item.CartID,
		ItemID:   item.ItemID,
		Quantity: item.Quantity,
		Subtotal: item.Subtotal,
	}
	if err := r.db.Create(rec).Error; err != nil {
		return err
	}
	item.ID = rec.ID
	return nil
}

func (r *gormCartRepository) UpdateItem(item *domain.CartItem) error {
	rec := &cartItemRecord{
		ID:       item.ID,
		CartID:   item.CartID,
		ItemID:   item.ItemID,
		Quantity: item.Quantity,
		Subtotal: item.Subtotal,
	}
	return r.db.Omit("Item").Updates(rec).Error // Omit relation to avoid saving item
}

func (r *gormCartRepository) DeleteItem(cartItemID uint, userID uint) error {
	return r.db.Where(`
		id = ? AND cart_id IN (SELECT id FROM carts WHERE user_id = ?)
	`, cartItemID, userID).Delete(&cartItemRecord{}).Error
}
