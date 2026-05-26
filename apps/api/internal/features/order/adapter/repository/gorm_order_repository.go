package repository

import (
	"errors"
	"time"

	"project-bamart2/apps/api/internal/features/order/domain"
	"project-bamart2/apps/api/internal/features/order/port"
	"project-bamart2/apps/api/internal/shared/apperror"

	"gorm.io/gorm"
)

// ── GORM Models ───────────────────────────────────────────────────────────────

type orderRecord struct {
	ID         uint `gorm:"primaryKey;autoIncrement"`
	UserID     uint `gorm:"not null"`
	OrderDate  time.Time
	TotalPrice int
	Status     string `gorm:"size:100;default:'PENDING'"`
	FullName   string
	Phone      string
	Address    string
	City       string
	PostalCode string
	Notes      *string
	CreatedAt  time.Time
	UpdatedAt  time.Time
	DeletedAt  gorm.DeletedAt `gorm:"index"`

	Items []orderItemRecord `gorm:"foreignKey:OrderID"`
}

func (orderRecord) TableName() string { return "orders" }

type orderItemRecord struct {
	ID       uint `gorm:"primaryKey;autoIncrement"`
	OrderID  uint `gorm:"not null"`
	ItemID   uint `gorm:"not null"`
	Quantity int
	Subtotal int

	// Minimal relation for name
	Item itemMinimal `gorm:"foreignKey:ItemID"`
}

func (orderItemRecord) TableName() string { return "order_items" }

type itemMinimal struct {
	ID     uint
	Name   string
	Price  int
	UserID uint
}

func (itemMinimal) TableName() string { return "items" }

type cartRecord struct {
	ID     uint `gorm:"primaryKey;autoIncrement"`
	UserID uint `gorm:"uniqueIndex"`
}

func (cartRecord) TableName() string { return "carts" }

type cartItemRecord struct {
	ID       uint `gorm:"primaryKey;autoIncrement"`
	CartID   uint
	ItemID   uint
	Quantity int
	Subtotal int

	Item itemMinimal `gorm:"foreignKey:ItemID"`
}

func (cartItemRecord) TableName() string { return "cart_items" }

// ── Mapping ───────────────────────────────────────────────────────────────────

func toDomainOrder(r *orderRecord) *domain.Order {
	d := &domain.Order{
		ID:         r.ID,
		UserID:     r.UserID,
		OrderDate:  r.OrderDate,
		TotalPrice: r.TotalPrice,
		Status:     r.Status,
		FullName:   r.FullName,
		Phone:      r.Phone,
		Address:    r.Address,
		City:       r.City,
		PostalCode: r.PostalCode,
		Notes:      r.Notes,
		CreatedAt:  r.CreatedAt,
		UpdatedAt:  r.UpdatedAt,
	}
	for _, ir := range r.Items {
		d.Items = append(d.Items, *toDomainOrderItem(&ir))
	}
	return d
}

func toDomainOrderItem(r *orderItemRecord) *domain.OrderItem {
	return &domain.OrderItem{
		ID:       r.ID,
		OrderID:  r.OrderID,
		ItemID:   r.ItemID,
		ItemName: r.Item.Name,
		Quantity: r.Quantity,
		Subtotal: r.Subtotal,
		SellerID: r.Item.UserID,
	}
}

// ── Repository Implementation ─────────────────────────────────────────────────

type gormOrderRepository struct {
	db *gorm.DB
}

var _ port.OrderRepository = (*gormOrderRepository)(nil)

func New(db *gorm.DB) port.OrderRepository {
	db.AutoMigrate(&orderRecord{}, &orderItemRecord{})
	return &gormOrderRepository{db: db}
}

func (r *gormOrderRepository) FindByUserID(userID uint) ([]domain.Order, error) {
	var records []orderRecord
	err := r.db.
		Where("user_id = ?", userID).
		Order("order_date DESC").
		Preload("Items.Item"). // Ensure item minimal models are loaded
		Find(&records).Error

	if err != nil {
		return nil, err
	}

	var orders []domain.Order
	for _, rec := range records {
		orders = append(orders, *toDomainOrder(&rec))
	}
	return orders, nil
}

func (r *gormOrderRepository) FindByID(id uint) (*domain.Order, error) {
	var rec orderRecord
	if err := r.db.Preload("Items.Item").First(&rec, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.ErrNotFound
		}
		return nil, err
	}
	return toDomainOrder(&rec), nil
}

func (r *gormOrderRepository) FindAll() ([]domain.Order, error) {
	var records []orderRecord
	if err := r.db.Preload("Items.Item").Order("id DESC").Find(&records).Error; err != nil {
		return nil, err
	}

	var orders []domain.Order
	for _, rec := range records {
		orders = append(orders, *toDomainOrder(&rec))
	}
	return orders, nil
}

func (r *gormOrderRepository) Create(order *domain.Order) error {
	rec := &orderRecord{
		UserID:     order.UserID,
		OrderDate:  order.OrderDate,
		TotalPrice: order.TotalPrice,
		Status:     order.Status,
		FullName:   order.FullName,
		Phone:      order.Phone,
		Address:    order.Address,
		City:       order.City,
		PostalCode: order.PostalCode,
		Notes:      order.Notes,
	}

	for _, item := range order.Items {
		rec.Items = append(rec.Items, orderItemRecord{
			ItemID:   item.ItemID,
			Quantity: item.Quantity,
			Subtotal: item.Subtotal,
		})
	}

	if err := r.db.Create(rec).Error; err != nil {
		return err
	}

	order.ID = rec.ID
	return nil
}

func (r *gormOrderRepository) Update(order *domain.Order) error {
	rec := &orderRecord{
		ID:         order.ID,
		UserID:     order.UserID,
		TotalPrice: order.TotalPrice,
		Status:     order.Status,
		FullName:   order.FullName,
		Phone:      order.Phone,
		Address:    order.Address,
		City:       order.City,
		PostalCode: order.PostalCode,
		Notes:      order.Notes,
	}
	return r.db.Omit("Items").Updates(rec).Error
}

func (r *gormOrderRepository) Delete(id uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("order_id = ?", id).Delete(&orderItemRecord{}).Error; err != nil {
			return err
		}
		if err := tx.Delete(&orderRecord{}, id).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *gormOrderRepository) FindByIDAndUser(orderID uint, userID uint) (*domain.Order, error) {
	var rec orderRecord
	if err := r.db.Preload("Items.Item").Where("id = ? AND user_id = ?", orderID, userID).First(&rec).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.ErrNotFound
		}
		return nil, err
	}
	return toDomainOrder(&rec), nil
}

func (r *gormOrderRepository) UpdateStatus(orderID uint, status string) error {
	return r.db.Model(&orderRecord{}).Where("id = ?", orderID).Update("status", status).Error
}

func (r *gormOrderRepository) FindTotalByIDAndUser(orderID uint, userID uint) (*int, error) {
	var result struct {
		TotalPrice int
	}

	err := r.db.Model(&orderRecord{}).
		Select("total_price").
		Where("id = ? AND user_id = ?", orderID, userID).
		Scan(&result).Error

	if err != nil {
		return nil, err
	}

	// Double check if record really exists since Scan doesn't return ErrRecordNotFound for missing select hits.
	if result.TotalPrice == 0 {
		var count int64
		r.db.Model(&orderRecord{}).Where("id = ? AND user_id = ?", orderID, userID).Count(&count)
		if count == 0 {
			return nil, apperror.ErrNotFound
		}
	}

	return &result.TotalPrice, nil
}

func (r *gormOrderRepository) GetCartItemsByUserID(userID uint) ([]domain.CartItemDTO, error) {
	var cart cartRecord
	if err := r.db.Where("user_id = ?", userID).First(&cart).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // empty cart
		}
		return nil, err
	}

	var items []cartItemRecord
	if err := r.db.Preload("Item").Where("cart_id = ?", cart.ID).Find(&items).Error; err != nil {
		return nil, err
	}

	var dtos []domain.CartItemDTO
	for _, it := range items {
		price := it.Item.Price
		if price == 0 && it.Quantity > 0 {
			price = it.Subtotal / it.Quantity
		}
		dtos = append(dtos, domain.CartItemDTO{
			CartID:   it.CartID,
			ItemID:   it.ItemID,
			ItemName: it.Item.Name,
			Quantity: it.Quantity,
			Price:    price,
		})
	}
	return dtos, nil
}

func (r *gormOrderRepository) ClearCartItemsByUserID(userID uint) error {
	var cart cartRecord
	if err := r.db.Where("user_id = ?", userID).First(&cart).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
		return err
	}
	return r.db.Where("cart_id = ?", cart.ID).Delete(&cartItemRecord{}).Error
}
