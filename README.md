# Clinic Booking Service

A full-stack **Clinic Booking and Management System** built with **Go (Gin, Bun ORM, PostgreSQL, Redis, RabbitMQ, Stripe, Cloudinary)** and a **React (Vite) frontend**.
It provides APIs and UI for managing patients, doctors, nurses, appointments, services, payments, and booking queues.

---

## 🚀 Features

- 🔐 Authentication & Authorization with **JWT + Casbin RBAC**
- 👨‍⚕️ Manage **Patients, Doctors, Nurses**
- 📅 Appointment & Booking Queue Management
- 💳 Online Payments via **Stripe**
- 🗄️ Database with **PostgreSQL** and ORM **Bun**
- ⚡ Caching with **Redis**
- 📩 Messaging with **RabbitMQ**
- ☁️ Image uploads with **Cloudinary**
- 🌐 Frontend in **React (Vite)**

---

## 📂 Project Structure

```
clinic_booking_service/
├── backend/                     # Go backend service
│   ├── cmd/
│   │   ├── main.go              # Application entry point
│   │   └── server/             # HTTP server, engine, graceful shutdown
│   ├── internal/
│   │   ├── api/                # HTTP handlers, routes, middleware
│   │   ├── usecase/           # Business logic
│   │   ├── domain/            # Entities and DTOs
│   │   └── infrastructure/    # DB (Bun), repositories, Redis, RabbitMQ
│   ├── pkg/                    # config, casbin, db_init, common utils, responses
│   ├── config/                 # YAML config files (config.production.yaml)
│   ├── scripts/                # Helper scripts (test DB migration)
│   ├── test/                   # Integration tests
│   ├── Dockerfile
│   ├── go.mod / go.sum
│   └── .air.toml               # Hot reload config
├── frontend/                    # React (Vite) frontend
├── docker-compose.yaml          # Multi-service setup
├── render.yaml / vercel.json    # Deployment configs
└── .gitignore
```

---

## 🛠️ Tech Stack

**Backend**
- [Go](https://golang.org/) + [Gin](https://gin-gonic.com/)
- [Bun ORM](https://bun.uptrace.dev/) + PostgreSQL
- [Redis](https://redis.io/) for caching
- [RabbitMQ](https://www.rabbitmq.com/) for message queue
- [Casbin](https://casbin.org/) for RBAC
- [Stripe](https://stripe.com/) for payments
- [Cloudinary](https://cloudinary.com/) for media storage

**Frontend**
- React 18 (Vite)
- Tailwind CSS
- TanStack Query, React Router, Axios
- Framer Motion, react-hook-form, react-hot-toast, lucide-react

**Infrastructure**
- Docker & Docker Compose
- Hot reload with Air

---

## ⚙️ Setup & Installation

### 1. Clone the repo
```bash
git clone https://github.com/kangourouuu/clinic_booking_service.git
cd clinic_booking_service
```

### 2. Configuration file

The backend loads server, database, Redis and RabbitMQ settings from a YAML file.
The path is taken from the `CONFIG_DIR` environment variable (default: `config/config.yaml`).

Only `backend/config/config.production.yaml` is committed, so either:

- set `CONFIG_DIR=config/config.production.yaml`, or
- create `backend/config/config.yaml` based on `config.production.yaml`.

Example structure:
```yaml
main:
  port: "9000"
  database: true
  redis: true
  rabbitmq: true

db:
  host: "localhost"
  port: 5432
  username: "postgres"
  password: "postgres"
  database: "clinic"
  sslmode: "disable"
```

### 3. Environment variables

Create a `.env` file in `backend/` with the secrets read from the environment:
```env
SECRET_KEY=your_jwt_signing_secret
STRIPE_API=your_stripe_secret_key
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
ADMIN_PASSWORD=your_admin_password
# Optional
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
FRONTEND_URL=http://localhost:3000
```

### 4. Run with Docker Compose
```bash
docker compose up --build
```

### Application URLs
```
Backend  → http://localhost:9000
Frontend → http://localhost:3000
```

---

## 📖 API Documentation

The API is served under the `/api` prefix:
```
http://localhost:9000/api
```

Health checks:
```
GET /            → { "status": "ok" }
GET /api/health  → service/dependency status
```

---

## 🧪 Testing

Backend uses [Testify](https://github.com/stretchr/testify) for unit tests:
```bash
cd backend
go test ./...
```

Integration tests (`backend/test/integration`) require a running PostgreSQL test database.
A `backend-test` service is also defined in `docker-compose.yaml`:
```bash
docker compose run --rm backend-test
```

---

## 📌 Roadmap

- Add email/SMS notifications
- Expand test coverage (integration & e2e)
- Deploy with CI/CD pipeline
- Publish API documentation / Postman collection
