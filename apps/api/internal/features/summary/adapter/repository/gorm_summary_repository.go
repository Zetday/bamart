package repository

import (
	"project-bamart2/apps/api/internal/features/summary/domain"
	"project-bamart2/apps/api/internal/features/summary/port"

	"gorm.io/gorm"
)

type gormSummaryRepository struct {
	db *gorm.DB
}

var _ port.SummaryRepository = (*gormSummaryRepository)(nil)

func New(db *gorm.DB) port.SummaryRepository {
	return &gormSummaryRepository{db: db}
}

// ── Admin Summary ─────────────────────────────────────────────────────────────

func (r *gormSummaryRepository) CountAdminUsers() (int64, error) {
	var total int64
	err := r.db.Table("users").Where("deleted_at IS NULL").Count(&total).Error
	return total, err
}

func (r *gormSummaryRepository) CountAdminProducts() (int64, error) {
	var total int64
	err := r.db.Table("items").Where("deleted_at IS NULL").Count(&total).Error
	return total, err
}

func (r *gormSummaryRepository) CountAdminOrders() (int64, error) {
	var total int64
	err := r.db.Table("orders").Where("deleted_at IS NULL").Count(&total).Error
	return total, err
}

func (r *gormSummaryRepository) GetAdminMonthlyOrders() ([]domain.MonthlyOrderData, error) {
	var results []domain.MonthlyOrderData
	err := r.db.Raw(`
		SELECT
			TO_CHAR(order_date, 'Mon') AS month,
			COUNT(*) AS orders
		FROM orders
		WHERE deleted_at IS NULL
		GROUP BY month, DATE_TRUNC('month', order_date)
		ORDER BY DATE_TRUNC('month', order_date) ASC
	`).Scan(&results).Error
	return results, err
}

// ── Seller Summary ────────────────────────────────────────────────────────────

func (r *gormSummaryRepository) CountSellerProducts(sellerID uint) (int64, error) {
	var total int64
	err := r.db.Table("items").
		Where("user_id = ? AND deleted_at IS NULL", sellerID).
		Count(&total).Error
	return total, err
}

func (r *gormSummaryRepository) CountSellerOrders(sellerID uint) (int64, error) {
	var total int64
	err := r.db.Table("orders").
		Joins("JOIN order_items oi ON oi.order_id = orders.id").
		Joins("JOIN items i ON i.id = oi.item_id").
		Where("i.user_id = ? AND orders.deleted_at IS NULL", sellerID).
		Distinct("orders.id").
		Count(&total).Error
	return total, err
}

func (r *gormSummaryRepository) GetSellerOrderItemRevenue(sellerID uint) ([]domain.OrderItemRevenue, error) {
	var rows []domain.OrderItemRevenue
	err := r.db.Table("order_items oi").
		Select("oi.subtotal, o.order_date").
		Joins("JOIN orders o ON o.id = oi.order_id").
		Joins("JOIN items i ON i.id = oi.item_id").
		Where("i.user_id = ?", sellerID).
		Scan(&rows).Error
	return rows, err
}

// ── Public Stats ──────────────────────────────────────────────────────────────

func (r *gormSummaryRepository) CountPublicProducts() (int64, error) {
	var total int64
	err := r.db.Table("items").Where("deleted_at IS NULL").Count(&total).Error
	return total, err
}

func (r *gormSummaryRepository) CountPublicSellers() (int64, error) {
	var total int64
	err := r.db.Table("users").Where("role = ? AND deleted_at IS NULL", "SELLER").Count(&total).Error
	return total, err
}

func (r *gormSummaryRepository) CountPublicBuyers() (int64, error) {
	var total int64
	err := r.db.Table("users").Where("role = ? AND deleted_at IS NULL", "BUYER").Count(&total).Error
	return total, err
}
