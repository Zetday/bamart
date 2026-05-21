package domain

import "time"

// ── Admin Summary Models ──────────────────────────────────────────────────────

type MonthlyOrderData struct {
	Month  string
	Orders int
}

// ── Seller Summary Models ─────────────────────────────────────────────────────

type OrderItemRevenue struct {
	Subtotal  float64
	OrderDate time.Time
}
