package main

import (
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"project-bamart2/apps/api/pkg/config"
)

// GORM database model mapping matching the exact column layouts
type User struct {
	ID        uint      `gorm:"primaryKey;autoIncrement"`
	Name      string    `gorm:"size:255;not null"`
	Email     string    `gorm:"size:255;uniqueIndex;not null"`
	Password  string    `gorm:"size:255;not null"`
	Role      string    `gorm:"type:varchar(20);default:'BUYER'"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

func (User) TableName() string { return "users" }

type Category struct {
	ID          uint      `gorm:"primaryKey;autoIncrement"`
	Name        string    `gorm:"size:100;uniqueIndex;not null"`
	Description string    `gorm:"type:text"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt `gorm:"index"`
}

func (Category) TableName() string { return "categories" }

type Item struct {
	ID          uint      `gorm:"primaryKey;autoIncrement"`
	UserID      uint      `gorm:"not null"`
	Name        string    `gorm:"size:255;not null"`
	Description string    `gorm:"type:text"`
	Price       int       `gorm:"not null"`
	Stock       int       `gorm:"not null"`
	ImageUrl    string    `gorm:"size:255"`
	CategoryID  uint
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt `gorm:"index"`
}

func (Item) TableName() string { return "items" }

type Order struct {
	ID         uint      `gorm:"primaryKey;autoIncrement"`
	UserID     uint      `gorm:"not null"`
	OrderDate  time.Time `gorm:"default:CURRENT_TIMESTAMP;not null"`
	TotalPrice int       `gorm:"not null"`
	Status     string    `gorm:"size:100;not null"`
	FullName   string    `gorm:"size:255;not null"`
	Phone      string    `gorm:"size:50;not null"`
	Address    string    `gorm:"type:text;not null"`
	City       string    `gorm:"size:100;not null"`
	PostalCode string    `gorm:"size:20;not null"`
	Notes      string    `gorm:"type:text"`
	CreatedAt  time.Time
	UpdatedAt  time.Time
	DeletedAt  gorm.DeletedAt `gorm:"index"`
}

func (Order) TableName() string { return "orders" }

type OrderItem struct {
	ID       uint `gorm:"primaryKey;autoIncrement"`
	OrderID  uint `gorm:"not null"`
	ItemID   uint `gorm:"not null"`
	Quantity int  `gorm:"not null"`
	Subtotal int  `gorm:"not null"`
}

func (OrderItem) TableName() string { return "order_items" }

type Cart struct {
	ID        uint      `gorm:"primaryKey;autoIncrement"`
	UserID    uint      `gorm:"uniqueIndex;not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

func (Cart) TableName() string { return "carts" }

type CartItem struct {
	ID       uint `gorm:"primaryKey;autoIncrement"`
	CartID   uint `gorm:"not null"`
	ItemID   uint `gorm:"not null"`
	Quantity int  `gorm:"default:1;not null"`
	Subtotal int  `gorm:"not null"`
}

func (CartItem) TableName() string { return "cart_items" }

func main() {
	cfg := config.Load()
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{})
	if err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}

	log.Println("🌱 Seeding database started...")

	// 1. Wipe existing records to allow clean seeding
	// Order items first due to foreign keys
	db.Exec("TRUNCATE TABLE order_items RESTART IDENTITY CASCADE")
	db.Exec("TRUNCATE TABLE orders RESTART IDENTITY CASCADE")
	db.Exec("TRUNCATE TABLE cart_items RESTART IDENTITY CASCADE")
	db.Exec("TRUNCATE TABLE carts RESTART IDENTITY CASCADE")
	db.Exec("TRUNCATE TABLE items RESTART IDENTITY CASCADE")
	db.Exec("TRUNCATE TABLE categories RESTART IDENTITY CASCADE")
	db.Exec("TRUNCATE TABLE users RESTART IDENTITY CASCADE")

	// 2. Hash Password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("❌ Failed to hash password: %v", err)
	}
	passStr := string(hashedPassword)

	// 3. Seed Users
	users := []User{
		{Name: "Admin", Email: "admin@example.com", Password: passStr, Role: "ADMIN"},
		{Name: "Toko Sasirangan", Email: "sasirangan@example.com", Password: passStr, Role: "SELLER"},
		{Name: "Toko Wadai", Email: "wadai@example.com", Password: passStr, Role: "SELLER"},
		{Name: "Pembeli A", Email: "buyer1@example.com", Password: passStr, Role: "BUYER"},
		{Name: "Pembeli B", Email: "buyer2@example.com", Password: passStr, Role: "BUYER"},
	}

	for i := range users {
		if err := db.Create(&users[i]).Error; err != nil {
			log.Fatalf("❌ Failed to seed user %s: %v", users[i].Email, err)
		}
	}

	// Resolve seller IDs
	var seller1, seller2, buyer1 User
	db.Where("email = ?", "sasirangan@example.com").First(&seller1)
	db.Where("email = ?", "wadai@example.com").First(&seller2)
	db.Where("email = ?", "buyer1@example.com").First(&buyer1)

	// 4. Seed Categories
	categories := []Category{
		{Name: "Makanan", Description: "Produk makanan khas Banjar"},
		{Name: "Minuman", Description: "Minuman khas Banjarmasin"},
		{Name: "Fashion", Description: "Pakaian UMKM Banjarmasin"},
		{Name: "Kerajinan", Description: "Kerajinan tangan lokal"},
	}

	for i := range categories {
		if err := db.Create(&categories[i]).Error; err != nil {
			log.Fatalf("❌ Failed to seed category %s: %v", categories[i].Name, err)
		}
	}

	// Resolve Category IDs
	var catMakanan, catMinuman, catFashion, catKerajinan Category
	db.Where("name = ?", "Makanan").First(&catMakanan)
	db.Where("name = ?", "Minuman").First(&catMinuman)
	db.Where("name = ?", "Fashion").First(&catFashion)
	db.Where("name = ?", "Kerajinan").First(&catKerajinan)

	// 5. Seed Items
	items := []Item{
		// --- SELLER 1 (Toko Sasirangan) ---
		{
			Name:        "Kain Sasirangan Premium",
			Description: "Motif modern Banjar",
			Price:       250000,
			Stock:       20,
			ImageUrl:    "/items/1765085042653-IMG-20120918-00103.jpg",
			CategoryID:  catFashion.ID,
			UserID:      seller1.ID,
		},
		{
			Name:        "Tas Rotan Anyaman",
			Description: "Kerajinan rotan handmade",
			Price:       150000,
			Stock:       30,
			ImageUrl:    "/items/1765085658419-rotan.jpg",
			CategoryID:  catKerajinan.ID,
			UserID:      seller1.ID,
		},
		{
			Name:        "Dompet Sasirangan",
			Description: "Dompet elegan motif sasirangan",
			Price:       45000,
			Stock:       40,
			ImageUrl:    "/items/1765085114524-dompet_sasirangan.jpg",
			CategoryID:  catFashion.ID,
			UserID:      seller1.ID,
		},
		{
			Name:        "Miniatur Jukung",
			Description: "Miniatur kapal tradisional Banjar",
			Price:       70000,
			Stock:       15,
			ImageUrl:    "/items/1765085665394-miniatur-jukung.png",
			CategoryID:  catKerajinan.ID,
			UserID:      seller1.ID,
		},
		{
			Name:        "Anyaman Purun",
			Description: "Kerajinan purun khas Kalimantan",
			Price:       35000,
			Stock:       50,
			ImageUrl:    "/items/1765085195589-anyaman_purun.webp",
			CategoryID:  catKerajinan.ID,
			UserID:      seller1.ID,
		},
		{
			Name:        "Sisir Kayu Ulin",
			Description: "Sisir kayu ulin tahan lama",
			Price:       20000,
			Stock:       80,
			ImageUrl:    "/items/1765085670586-sisir_ulin.webp",
			CategoryID:  catKerajinan.ID,
			UserID:      seller1.ID,
		},
		{
			Name:        "Gelang Manik Dayak",
			Description: "Gelang etnik khas Kalimantan",
			Price:       30000,
			Stock:       70,
			ImageUrl:    "/items/1765085680482-gelak-manik-dayak.jpg",
			CategoryID:  catFashion.ID,
			UserID:      seller1.ID,
		},
		{
			Name:        "Syal Sasirangan",
			Description: "Syal dari kain sasirangan asli",
			Price:       65000,
			Stock:       25,
			ImageUrl:    "/items/1765085686808-syal-sasirangan.jpg",
			CategoryID:  catFashion.ID,
			UserID:      seller1.ID,
		},
		{
			Name:        "Topi Rotan Baimbai",
			Description: "Topi rotan handmade",
			Price:       55000,
			Stock:       33,
			ImageUrl:    "/items/1765085700058-topi-rotan.jpeg",
			CategoryID:  catKerajinan.ID,
			UserID:      seller1.ID,
		},
		{
			Name:        "Gantungan Kunci Sasirangan",
			Description: "Aksesoris motif sasirangan",
			Price:       15000,
			Stock:       200,
			ImageUrl:    "/items/1765084242721-Screenshot_2025-11-14_125547.png",
			CategoryID:  catFashion.ID,
			UserID:      seller1.ID,
		},

		// --- SELLER 2 (Toko Wadai) ---
		{
			Name:        "Wadai Bingka",
			Description: "Kue khas Banjar",
			Price:       20000,
			Stock:       50,
			ImageUrl:    "/items/1765085711279-bingka.jpeg",
			CategoryID:  catMakanan.ID,
			UserID:      seller2.ID,
		},
		{
			Name:        "Es Saraba Banjar",
			Description: "Minuman rempah khas Banjar",
			Price:       10000,
			Stock:       100,
			ImageUrl:    "/items/1765085718319-es-saraba.jpg",
			CategoryID:  catMinuman.ID,
			UserID:      seller2.ID,
		},
		{
			Name:        "Amplang Ikan Pipih",
			Description: "Camilan renyah khas Kalimantan",
			Price:       25000,
			Stock:       120,
			ImageUrl:    "/items/1765085727448-amplang.jpg",
			CategoryID:  catMakanan.ID,
			UserID:      seller2.ID,
		},
		{
			Name:        "Sambal Acan Banjar",
			Description: "Sambal pedas khas Banjar",
			Price:       18000,
			Stock:       70,
			ImageUrl:    "/items/1765085746093-sambal-acan.jpg",
			CategoryID:  catMakanan.ID,
			UserID:      seller2.ID,
		},
		{
			Name:        "Kopi Banua",
			Description: "Kopi robusta khas Kalsel",
			Price:       35000,
			Stock:       45,
			ImageUrl:    "/items/1765085775971-kopi-banua.jpg",
			CategoryID:  catMinuman.ID,
			UserID:      seller2.ID,
		},
		{
			Name:        "Teh Gambut",
			Description: "Teh herbal lokal",
			Price:       30000,
			Stock:       60,
			ImageUrl:    "/items/1765085941561-teh-gambut.jpeg",
			CategoryID:  catMinuman.ID,
			UserID:      seller2.ID,
		},
		{
			Name:        "Kerupuk Ikan Haruan",
			Description: "Kerupuk ikan gabus",
			Price:       22000,
			Stock:       90,
			ImageUrl:    "/items/1765086023286-kerupuk_haruan.jpg",
			CategoryID:  catMakanan.ID,
			UserID:      seller2.ID,
		},
		{
			Name:        "Sari Jahe Merah Banjar",
			Description: "Jahe merah tradisional",
			Price:       15000,
			Stock:       110,
			ImageUrl:    "/items/1765086034099-sari-jeha-merah.webp",
			CategoryID:  catMinuman.ID,
			UserID:      seller2.ID,
		},
		{
			Name:        "Dodol Kandangan",
			Description: "Dodol khas Kandangan",
			Price:       25000,
			Stock:       75,
			ImageUrl:    "/items/1765086043799-dodol-kandangan.jpg",
			CategoryID:  catMakanan.ID,
			UserID:      seller2.ID,
		},
		{
			Name:        "Roti Mantau Banjar",
			Description: "Roti tradisional gurih",
			Price:       12000,
			Stock:       65,
			ImageUrl:    "/items/1765086174006-roti_mantau.jpeg",
			CategoryID:  catMakanan.ID,
			UserID:      seller2.ID,
		},
	}

	for i := range items {
		if err := db.Create(&items[i]).Error; err != nil {
			log.Fatalf("❌ Failed to seed item %s: %v", items[i].Name, err)
		}
	}

	// Resolve the first item for sample order
	var firstItem Item
	db.Where("user_id = ?", seller1.ID).First(&firstItem)

	// 6. Seed Sample Order
	order := Order{
		UserID:     buyer1.ID,
		TotalPrice: firstItem.Price * 2,
		Status:     "PAID",
		FullName:   "Pembeli A",
		Phone:      "08123456789",
		Address:    "Jl. Mawar No. 10",
		City:       "Banjarmasin",
		PostalCode: "70122",
		Notes:      "Pesanan contoh",
		OrderDate:  time.Now(),
	}

	if err := db.Create(&order).Error; err != nil {
		log.Fatalf("❌ Failed to create sample order: %v", err)
	}

	orderItem := OrderItem{
		OrderID:  order.ID,
		ItemID:   firstItem.ID,
		Quantity: 2,
		Subtotal: firstItem.Price * 2,
	}

	if err := db.Create(&orderItem).Error; err != nil {
		log.Fatalf("❌ Failed to create sample order item: %v", err)
	}

	log.Println("🌱 Seeding database completed successfully!")
}
