package port

import "project-bamart2/apps/api/internal/features/summary/domain"

type SummaryRepository interface {
	// Admin
	CountAdminUsers() (int64, error)
	CountAdminProducts() (int64, error)
	CountAdminOrders() (int64, error)
	GetAdminMonthlyOrders() ([]domain.MonthlyOrderData, error)

	// Seller
	CountSellerProducts(sellerID uint) (int64, error)
	CountSellerOrders(sellerID uint) (int64, error)
	GetSellerOrderItemRevenue(sellerID uint) ([]domain.OrderItemRevenue, error)

	// Public Stats
	CountPublicProducts() (int64, error)
	CountPublicSellers() (int64, error)
	CountPublicBuyers() (int64, error)
}
