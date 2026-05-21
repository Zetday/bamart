# 🛒 Project Bamart

Project Bamart is a full-stack e-commerce application built with a modern architecture. It leverages **Next.js** for a highly interactive frontend and a blazing-fast **Golang** (Fiber) backend.

![Bamart Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Golang%20%7C%20PostgreSQL-blue?style=for-the-badge)

## 🏗️ Architecture & Tech Stack

This project is structured as a monorepo containing both the frontend and backend applications:

### Frontend (`apps/web`)
- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Data Fetching:** [SWR](https://swr.vercel.app/)
- **Icons:** [Lucide React](https://lucide.dev/)

### Backend (`apps/api`)
- **Language:** [Go 1.25+](https://go.dev/)
- **Framework:** [Fiber v3](https://gofiber.io/)
- **ORM:** [GORM](https://gorm.io/)
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)

### Infrastructure (`infra`)
- Docker & Docker Compose for local database setup and services.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [Go](https://go.dev/dl/) (v1.25 or higher)
- [PostgreSQL](https://www.postgresql.org/) (or Docker for running via compose)

---

### 1. Database Setup

You can start the PostgreSQL database easily using Docker if you have the compose file set up in `infra/`:
```bash
cd infra
docker compose up -d
```
Alternatively, make sure you have a local PostgreSQL instance running with a database named `bamart_db`.

---

### 2. Backend Setup (Golang)

1. Navigate to the backend directory:
   ```bash
   cd apps/api
   ```
2. Download dependencies:
   ```bash
   go mod download
   ```
3. Copy the `.env.example` to `.env` (or configure your own based on the existing `.env`):
   ```bash
   # Make sure DB_DSN and DB_* variables match your local Postgres setup.
   ```
4. Run the server:
   ```bash
   go run cmd/api/main.go
   ```
   > The API will start running on `http://localhost:8080`.

---

### 3. Frontend Setup (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd apps/web
   ```
2. Install the required Node.js packages:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   > The web app will start running on `http://localhost:3000`.

**Note on API Proxy:** The Next.js app is configured with `rewrites` in `next.config.ts`. Any requests hitting `/api/*` from the frontend will automatically be securely proxied to the Golang backend (`http://localhost:8080/api/*`). This prevents CORS issues and keeps the code clean!

---

## 📁 Project Structure

```text
project-bamart2/
├── apps/
│   ├── api/                  # Golang Fiber Backend
│   │   ├── cmd/api/          # Main entrypoint
│   │   ├── internal/         # Core business logic (Features, Clean Arch)
│   │   └── pkg/              # Shared utilities (DB, Auth, Config)
│   └── web/                  # Next.js Frontend
│       ├── app/              # App Router pages (Cart, Checkout, etc.)
│       ├── components/       # Reusable React components
│       └── public/           # Static assets
└── infra/                    # Docker & Infrastructure configs
```

## ✨ Key Features
- **Shopping Cart:** Add, update quantities, and remove items with optimistic UI updates.
- **Checkout Flow:** Seamless checkout process with delivery calculation.
- **Authentication:** Secure JWT-based authentication for users.
- **Product Catalog:** View categories and items fetched dynamically from the Go API.

## 📄 License
This project is proprietary.
