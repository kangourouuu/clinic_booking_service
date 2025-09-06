# Clinic Booking Service

A full-stack **Clinic Booking and Management System** built with **Go (Gin, PostgreSQL, Redis, RabbitMQ, Stripe, Cloudinary)** and a **React (Vite) frontend**.  
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

clinic_booking_service/  
  ├── backend/ # Go backend service  
  │ ├── cmd/ # Entry point (main.go, server)  
  │ ├── internal/ # Handlers, services, domain, middleware  
  │ ├── pkg/ # Config, Casbin, DB init  
  │ ├── Dockerfile  
  │ ├── go.mod / go.sum  
  │ └── .air.toml # Hot reload config  
  ├── frontend/ # React (Vite) frontend  
  ├── docker-compose.yaml # Multi-service setup  
  ├── run.sh # Helper script  
  └── .gitignore  

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
- React (Vite)
- Tailwind CSS

**Infrastructure**
- Docker & Docker Compose
- Hot reload with Air

---

## ⚙️ Setup & Installation

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/clinic_booking_service.git  
cd clinic_booking_service-main
```

### 2. Environment variables
#### Create .env file in backend/ with values:  
```bash
- STRIPE_SECRET_KEY=your_stripe_key  
- CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

### 3. Run with Docker Compose
```bash
docker-compose up --build
```

## Application will be available with these URL:
  ```bash
  Backend → http://localhost:9000  
  Frontend → http://localhost:3000
  ```
## 📖 API Documentation

API is available at:
```bash
http://localhost:9000/api
```

Postman collection can be added for testing.
## 🧪 Testing

Backend uses Testify for unit tests:
```bash
cd backend
go test ./...
```

## 📌 Roadmap

Add email/SMS notifications

Expand test coverage (integration & e2e)

Deploy with CI/CD pipeline
