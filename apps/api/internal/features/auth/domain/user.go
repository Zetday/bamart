package domain

import "time"

// User is the pure domain entity for the auth/user bounded context.
// No GORM tags. No JSON tags. This is the business truth.
type User struct {
	ID        uint
	Name      string
	Email     string
	Password  string // bcrypt hash
	Role      Role
	CreatedAt time.Time
}

// Role represents the user's permission level in the system.
type Role string

const (
	RoleBuyer  Role = "BUYER"
	RoleSeller Role = "SELLER"
	RoleAdmin  Role = "ADMIN"
)

// IsValid reports whether this role value is one of the defined constants.
func (r Role) IsValid() bool {
	return r == RoleBuyer || r == RoleSeller || r == RoleAdmin
}
