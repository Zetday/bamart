package usecase

import (
	"project-bamart2/apps/api/internal/features/summary/domain"
	"project-bamart2/apps/api/internal/features/summary/port"
)

// ── Return Models ────────────────────────────────────────────────────────────

type AdminSummaryResult struct {
	TotalUsers    int64                     `json:"totalUsers"`
	TotalProducts int64                     `json:"totalProducts"`
	TotalOrders   int64                     `json:"totalOrders"`
	MonthlyOrders []domain.MonthlyOrderData `json:"monthlyOrders"`
}

type SellerSummaryResult struct {
	TotalProducts int64                     `json:"totalProducts"`
	TotalOrders   int64                     `json:"totalOrders"`
	TotalRevenue  float64                   `json:"totalRevenue"`
	MonthlyOrders []domain.MonthlyOrderData `json:"monthlyOrders"` // Reusing the same structure for charting
}

type PublicStatsResult struct {
	TotalProducts int64 `json:"totalProducts"`
	TotalSellers  int64 `json:"totalSellers"`
	TotalBuyers   int64 `json:"totalBuyers"`
}

// ── Interface ─────────────────────────────────────────────────────────────────

type SummaryUseCase interface {
	GetAdminSummary() (*AdminSummaryResult, error)
	GetSellerSummary(sellerID uint) (*SellerSummaryResult, error)
	GetPublicStats() (*PublicStatsResult, error)
}

// ── Implementation ────────────────────────────────────────────────────────────

type summaryUseCase struct {
	repo port.SummaryRepository
}

func New(repo port.SummaryRepository) SummaryUseCase {
	return &summaryUseCase{repo: repo}
}

func (uc *summaryUseCase) GetAdminSummary() (*AdminSummaryResult, error) {
	users, _ := uc.repo.CountAdminUsers()
	products, _ := uc.repo.CountAdminProducts()
	orders, _ := uc.repo.CountAdminOrders()
	monthly, _ := uc.repo.GetAdminMonthlyOrders()

	return &AdminSummaryResult{
		TotalUsers:    users,
		TotalProducts: products,
		TotalOrders:   orders,
		MonthlyOrders: monthly,
	}, nil
}

func (uc *summaryUseCase) GetSellerSummary(sellerID uint) (*SellerSummaryResult, error) {
	products, _ := uc.repo.CountSellerProducts(sellerID)
	orders, _ := uc.repo.CountSellerOrders(sellerID)
	revenueData, _ := uc.repo.GetSellerOrderItemRevenue(sellerID)

	var totalRevenue float64
	monthlyMap := make(map[string]int)

	for _, item := range revenueData {
		totalRevenue += item.Subtotal
		monthKey := item.OrderDate.Format("Jan")
		monthlyMap[monthKey]++
	}

	// For simplicity, generate a flat structure out of the map
	// In reality you should order by Month explicitly, but this follows old logic structure
	var monthly []domain.MonthlyOrderData

	// Define standard month order to sort if needed, simplified here
	months := []string{"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"}
	for _, m := range months {
		if count, ok := monthlyMap[m]; ok {
			monthly = append(monthly, domain.MonthlyOrderData{
				Month:  m,
				Orders: count,
			})
		} else {
			// To keep it full year layout if preferred
			// monthly = append(monthly, domain.MonthlyOrderData{Month: m, Orders: 0})
		}
	}

	return &SellerSummaryResult{
		TotalProducts: products,
		TotalOrders:   orders,
		TotalRevenue:  totalRevenue,
		MonthlyOrders: monthly,
	}, nil
}

func (uc *summaryUseCase) GetPublicStats() (*PublicStatsResult, error) {
	products, _ := uc.repo.CountPublicProducts()
	sellers, _ := uc.repo.CountPublicSellers()
	buyers, _ := uc.repo.CountPublicBuyers()

	return &PublicStatsResult{
		TotalProducts: products,
		TotalSellers:  sellers,
		TotalBuyers:   buyers,
	}, nil
}
