package usecase

import (
	"errors"
	"time"

	"project-bamart2/apps/api/internal/features/auth/domain"
	"project-bamart2/apps/api/internal/features/auth/port"
	"project-bamart2/apps/api/internal/shared/apperror"
	"project-bamart2/apps/api/pkg/token"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// ── Input / Output types ────────────────────────────────────────────────────

type RegisterInput struct {
	Name     string
	Email    string
	Password string
	Role     string
}

type LoginResult struct {
	User  *domain.User
	Token string
}

// ── Interface ────────────────────────────────────────────────────────────────

type AuthUseCase interface {
	Register(input RegisterInput) error
	Login(email, password string) (*LoginResult, error)
	GetUserByID(id uint) (*domain.User, error)
	GetBrands() ([]domain.User, error)
	GetAllUsers(role string) ([]domain.User, error)
}

// ── Implementation ───────────────────────────────────────────────────────────

type authUseCase struct {
	userRepo port.UserRepository
	tokens   *token.JWTService
}

func New(repo port.UserRepository, ts *token.JWTService) AuthUseCase {
	return &authUseCase{userRepo: repo, tokens: ts}
}

func (uc *authUseCase) Register(input RegisterInput) error {
	existing, err := uc.userRepo.FindByEmail(input.Email)

	// Email already taken
	if err == nil && existing != nil {
		return apperror.ErrEmailAlreadyUsed
	}

	// Real DB error (not record-not-found)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	if len(input.Password) < 6 {
		return apperror.ErrPasswordTooShort
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	role := domain.RoleBuyer
	if input.Role != "" {
		r := domain.Role(input.Role)
		if !r.IsValid() {
			return apperror.ErrInvalidRole
		}
		role = r
	}

	return uc.userRepo.Create(&domain.User{
		Name:      input.Name,
		Email:     input.Email,
		Password:  string(hashed),
		Role:      role,
		CreatedAt: time.Now(),
	})
}

func (uc *authUseCase) Login(email, password string) (*LoginResult, error) {
	user, err := uc.userRepo.FindByEmail(email)
	if err != nil {
		return nil, apperror.ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, apperror.ErrInvalidCredentials
	}

	tok, err := uc.tokens.Sign(token.Claims{
		UserID: user.ID,
		Email:  user.Email,
		Name:   user.Name,
		Role:   string(user.Role),
	})
	if err != nil {
		return nil, err
	}

	return &LoginResult{User: user, Token: tok}, nil
}

func (uc *authUseCase) GetUserByID(id uint) (*domain.User, error) {
	user, err := uc.userRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.ErrNotFound
		}
		return nil, err
	}
	return user, nil
}

func (uc *authUseCase) GetBrands() ([]domain.User, error) {
	return uc.userRepo.FindByRole("SELLER")
}

func (uc *authUseCase) GetAllUsers(role string) ([]domain.User, error) {
	if role != "" {
		return uc.userRepo.FindByRole(role)
	}
	return uc.userRepo.FindAll()
}
