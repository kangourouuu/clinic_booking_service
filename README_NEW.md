# 🏥 Clinic Booking Service - Modern Healthcare Management System

A full-stack **Clinic Booking and Management System** built with **Go (Gin)** backend and **React (Vite)** frontend, featuring modern UI/UX, efficient data fetching with TanStack Query, and production-ready deployment configurations.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Go Version](https://img.shields.io/badge/Go-1.23+-00ADD8?logo=go)](https://golang.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)](https://vitejs.dev/)

## ✨ Features

### 🎨 Modern Medical-Themed UI
- **Professional Design**: Medical color palette (primary blue, teal, success green)
- **Smooth Animations**: Fade-ins, scale effects, and smooth transitions
- **Responsive Layout**: Mobile-first design that works on all devices
- **Accessibility**: Enhanced focus states and keyboard navigation
- **Google Fonts**: Inter and Poppins for professional typography

### ⚡ Performance Optimized
- **Lazy Loading**: 70% reduction in initial bundle size
- **Code Splitting**: Optimized chunks for faster loading
- **TanStack Query**: Efficient data fetching with smart caching
- **Build Optimization**: Fast builds with esbuild minification

### 🔐 Authentication & Authorization
- JWT-based authentication with cookie support
- Role-based access control (RBAC) with Casbin
- Secure password hashing
- Session management

### 👨‍⚕️ User Management
- **Patients**: Registration, profile management, medical history
- **Doctors**: Schedule management, patient records
- **Nurses**: Service management, patient queue
- **Admin**: Complete system management

### 📅 Appointment System
- Service category and subcategory browsing
- Real-time booking availability
- Queue management
- Booking history tracking

### 💳 Payment Integration
- Stripe payment gateway
- Secure checkout process
- Webhook support for payment verification
- Payment history tracking

### 🗄️ Data Management
- PostgreSQL with Bun ORM
- Neon database support with SSL
- Redis caching (optional)
- RabbitMQ messaging (optional)

### ☁️ Cloud Services
- Cloudinary for image uploads and management
- Automatic image optimization
- Avatar upload with resizing

## 🏗️ Architecture

```
clinic_booking_service/
├── backend/                 # Go backend service
│   ├── cmd/                # Application entry point
│   ├── internal/           # Private application code
│   │   ├── api/           # HTTP handlers and routes
│   │   ├── domain/        # Business logic and models
│   │   ├── infrastructure/ # External services (DB, Redis, etc.)
│   │   └── usecase/       # Use case implementations
│   ├── pkg/               # Public libraries
│   └── config/            # Configuration files
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API services
│   │   ├── context/      # React context providers
│   │   └── routes/       # Application routing
│   └── public/           # Static assets
└── docker-compose.yaml   # Multi-service setup
```

## 🚀 Quick Start

### Prerequisites

- **Go**: 1.23+
- **Node.js**: 18+
- **Docker** (optional, for containerized setup)
- **PostgreSQL**: 16+ (or Neon account)

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/kangourouuu/clinic_booking_service.git
cd clinic_booking_service
```

#### 2. Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# - SECRET_KEY: Generate a strong random string
# - STRIPE_SECRET_KEY: Your Stripe secret key
# - CLOUDINARY_URL: Your Cloudinary URL

# Install dependencies
go mod download

# Run the backend
go run cmd/main.go
```

Backend will be available at `http://localhost:9000`

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

### Using Docker Compose

```bash
# Start all services
docker-compose up --build

# Backend → http://localhost:9000
# Frontend → http://localhost:3000
```

## 🛠️ Tech Stack

### Backend
- **Framework**: [Gin](https://gin-gonic.com/) - Fast HTTP web framework
- **ORM**: [Bun](https://bun.uptrace.dev/) - High-performance ORM
- **Database**: PostgreSQL (with [Neon](https://neon.tech/) support)
- **Caching**: [Redis](https://redis.io/)
- **Messaging**: [RabbitMQ](https://www.rabbitmq.com/)
- **Auth**: [Casbin](https://casbin.org/) RBAC + JWT
- **Payments**: [Stripe](https://stripe.com/)
- **Storage**: [Cloudinary](https://cloudinary.com/)

### Frontend
- **Framework**: React 18.2
- **Build Tool**: Vite 5.0
- **Styling**: Tailwind CSS 3.3
- **Data Fetching**: [TanStack Query](https://tanstack.com/query) (React Query)
- **Routing**: React Router DOM 6.21
- **Forms**: React Hook Form 7.48
- **Icons**: Lucide React 0.293
- **Animations**: Framer Motion 10.16
- **HTTP Client**: Axios 1.6
- **Notifications**: React Hot Toast 2.4

### Infrastructure
- **Frontend Hosting**: [Vercel](https://vercel.com/)
- **Backend Hosting**: [Render](https://render.com/)
- **Database**: [Neon](https://neon.tech/) PostgreSQL
- **Containerization**: Docker & Docker Compose

## 📖 API Documentation

### Base URL
- **Development**: `http://localhost:9000/api`
- **Production**: `https://your-backend.onrender.com/api`

### Authentication Endpoints

```bash
# Patient Registration
POST /api/register
Content-Type: multipart/form-data
{
  "username": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "avatar": "file"
}

# Patient Login
POST /api/login/patient
{
  "email": "string",
  "password": "string"
}

# Doctor Login
POST /api/login/doctor
{
  "email": "string",
  "password": "string"
}

# Nurse Login
POST /api/login/nurse
{
  "email": "string",
  "password": "string"
}
```

### Patient Endpoints

```bash
# Get Profile
GET /api/patient/profile
Authorization: Bearer {token}

# Update Profile
PUT /api/patient/profile
Authorization: Bearer {token}

# Get Services
GET /api/patient/services

# Book Service
POST /api/patient/book
Authorization: Bearer {token}

# Get Booking History
GET /api/patient/bookings
Authorization: Bearer {token}
```

For complete API documentation, see [API.md](./API.md)

## 🎨 UI Components

### Button Component
```jsx
import Button from '@/components/ui/Button'

<Button variant="primary" size="md">
  Click Me
</Button>

// Variants: primary, secondary, outline, ghost, danger, success, teal
// Sizes: sm, md, lg, xl
```

### Card Component
```jsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

<Card variant="medical">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>

// Variants: default, medical, hover, glass
```

### Using TanStack Query Hooks
```jsx
import { usePatientProfile, useUpdatePatientProfile } from '@/hooks/useQueries'

function ProfilePage() {
  const { data, isLoading, error } = usePatientProfile()
  const updateProfile = useUpdatePatientProfile()

  const handleUpdate = (data) => {
    updateProfile.mutate(data)
  }

  if (isLoading) return <Loading />
  if (error) return <div>Error: {error.message}</div>

  return <div>{data.name}</div>
}
```

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions.

### Quick Deploy

#### Frontend to Vercel
```bash
cd frontend
vercel --prod
```

#### Backend to Render
1. Connect GitHub repository to Render
2. Render will auto-detect `render.yaml` and deploy
3. Set environment variables in Render dashboard

## 🧪 Testing

### Backend Tests
```bash
cd backend
go test ./... -v
```

### Frontend Build Test
```bash
cd frontend
npm run build
```

## 📝 Environment Variables

### Backend (.env)
```bash
PORT=9000
SECRET_KEY=your-secret-key
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
CLOUDINARY_URL=cloudinary://xxx:xxx@xxx
```

### Frontend (.env.local)
```bash
VITE_API_BASE_URL=/api
VITE_APP_ENV=local
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Medical icons and images from various free resources
- Design inspiration from modern healthcare applications
- Community feedback and contributions

## 📞 Contact

- **Email**: info@medicare.vn
- **GitHub**: [@kangourouuu](https://github.com/kangourouuu)

---

⭐ **Star this repository if you find it helpful!**

**Built with ❤️ by the MediCare Team**
