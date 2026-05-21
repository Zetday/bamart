package token

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Claims is the payload stored inside a JWT.
// Lives in pkg/token because it's shared between the token package and
// the auth feature's port interface.
type Claims struct {
	UserID uint   `json:"id"`
	Email  string `json:"email"`
	Name   string `json:"name"`
	Role   string `json:"role"`
}

// JWTService signs and verifies HS256 JWTs.
type JWTService struct {
	secret []byte
	expiry time.Duration
}

// New creates a JWTService. Panics if secret is empty.
func New(secret string) *JWTService {
	if secret == "" {
		panic("[token] JWT_SECRET must not be empty")
	}
	return &JWTService{
		secret: []byte(secret),
		expiry: 7 * 24 * time.Hour,
	}
}

// Sign creates a signed JWT from the given claims.
func (s *JWTService) Sign(c Claims) (string, error) {
	mapClaims := jwt.MapClaims{
		"id":    c.UserID,
		"email": c.Email,
		"name":  c.Name,
		"role":  c.Role,
		"exp":   time.Now().Add(s.expiry).Unix(),
	}
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, mapClaims)
	return tok.SignedString(s.secret)
}

// Verify parses and validates a JWT string, returning its claims.
func (s *JWTService) Verify(tokenString string) (*Claims, error) {
	tok, err := jwt.Parse(tokenString, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrTokenSignatureInvalid
		}
		return s.secret, nil
	})
	if err != nil || !tok.Valid {
		return nil, errors.New("invalid or expired token")
	}

	mc, ok := tok.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("malformed token claims")
	}

	return &Claims{
		UserID: uint(mc["id"].(float64)),
		Email:  mc["email"].(string),
		Name:   mc["name"].(string),
		Role:   mc["role"].(string),
	}, nil
}
