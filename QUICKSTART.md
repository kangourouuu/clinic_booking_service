# Quick Start Guide - Developer Edition

Get the Clinic Booking Service up and running in minutes!

## 🎯 Prerequisites Checklist

Before you start, make sure you have:

- [ ] **Go 1.23+** installed ([Download](https://golang.org/dl/))
- [ ] **Node.js 18+** installed ([Download](https://nodejs.org/))
- [ ] **Git** installed
- [ ] **Code editor** (VS Code recommended)
- [ ] **PostgreSQL** (local) OR **Neon account** (cloud)

Optional but recommended:
- [ ] Docker Desktop (for containerized setup)
- [ ] Stripe test account
- [ ] Cloudinary account

## ⚡ 5-Minute Setup (Local Development)

### Step 1: Clone & Navigate

```bash
git clone https://github.com/kangourouuu/clinic_booking_service.git
cd clinic_booking_service
```

### Step 2: Backend Setup (2 minutes)

```bash
cd backend

# Create config file
mkdir -p config
cat > config/config.yaml << EOF
main:
  port: "9000"
  log_type: "console"
  log_file: "logs/app.log"
  database: true
  redis: false
  rabbitmq: false

db:
  host: "localhost"
  port: 5432
  username: "postgres"
  password: "your_password"
  database: "clinic"
  sslmode: "disable"
EOF

# Create .env file
cat > .env << EOF
SECRET_KEY=development-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_your_key
CLOUDINARY_URL=cloudinary://key:secret@cloud
EOF

# Install dependencies
go mod download

# Run backend
go run cmd/main.go
```

Backend is now running at `http://localhost:9000` 🎉

### Step 3: Frontend Setup (2 minutes)

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend is now running at `http://localhost:3000` 🎉

### Step 4: Database Setup (1 minute)

If using local PostgreSQL:

```bash
# Create database
createdb clinic

# The app will auto-create tables on first run
```

If using Neon (cloud):
1. Sign up at https://neon.tech
2. Create a new project
3. Update `config/config.yaml` with Neon credentials

## 🐳 Docker Setup (Alternative - Even Faster!)

### One-Command Start

```bash
# Start everything with Docker Compose
docker-compose up --build

# Backend → http://localhost:9000
# Frontend → http://localhost:3000
# PostgreSQL → localhost:5432
# Redis → localhost:6379
# RabbitMQ → localhost:5672
# RabbitMQ UI → http://localhost:15672
```

That's it! Everything is configured and running.

## 🎮 Testing the Application

### 1. Register a Patient

Open browser at `http://localhost:3000`

```
1. Click "Register"
2. Fill in details:
   - Username: testpatient
   - Email: patient@test.com
   - Password: Test123!
   - Phone: 1234567890
3. Upload avatar (optional)
4. Click "Register"
```

### 2. Login

```
1. Go to "Login" → "Patient Login"
2. Email: patient@test.com
3. Password: Test123!
4. Click "Login"
```

### 3. Browse Services

```
1. Click "Services" in navigation
2. Select a category
3. Select a subcategory
4. View available services
```

## 🔧 Common Configuration

### Environment Variables

#### Backend `.env`
```bash
# Required
SECRET_KEY=your-secret-key
FRONTEND_URL=http://localhost:3000

# Optional (for full features)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
CLOUDINARY_URL=cloudinary://xxx:xxx@xxx
```

#### Frontend `.env.local`
```bash
VITE_API_BASE_URL=/api
VITE_APP_ENV=local
```

### Database Configuration

#### Local PostgreSQL
```yaml
db:
  host: "localhost"
  port: 5432
  username: "postgres"
  password: "your_password"
  database: "clinic"
  sslmode: "disable"
```

#### Neon (Cloud)
```yaml
db:
  host: "ep-xxx.neon.tech"
  port: 5432
  username: "neondb_owner"
  password: "npg_xxx"
  database: "clinic_booking"
  sslmode: "require"
```

## 🚀 Development Workflow

### Backend Development

```bash
cd backend

# Run with hot reload (if using air)
air

# Or standard run
go run cmd/main.go

# Run tests
go test ./... -v

# Build
go build -o main cmd/main.go
```

### Frontend Development

```bash
cd frontend

# Dev server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📚 API Testing

### Using cURL

```bash
# Health check
curl http://localhost:9000/service

# Register patient
curl -X POST http://localhost:9000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!",
    "phone": "1234567890"
  }'

# Login
curl -X POST http://localhost:9000/api/login/patient \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### Using Postman

Import collection from `postman_collection.json` (if available)

Or create new requests:
- Base URL: `http://localhost:9000/api`
- Set `Content-Type: application/json`
- For authenticated requests, add cookie: `clinic_token=<your-token>`

## 🎨 Customizing the UI

### Colors

Edit `frontend/tailwind.config.js`:

```js
colors: {
  primary: {
    500: '#0ea5e9', // Your brand color
    600: '#0284c7',
    // ...
  }
}
```

### Components

All UI components are in `frontend/src/components/ui/`:
- `Button.jsx` - Button component
- `Card.jsx` - Card component
- `Input.jsx` - Input fields
- `Badge.jsx` - Badge component
- `Loading.jsx` - Loading states

### Styling

Global styles in `frontend/src/index.css`:
- Medical theme utilities
- Custom animations
- Scrollbar styling

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check if port 9000 is available
lsof -i :9000

# Check database connection
psql -U postgres -h localhost -d clinic

# View logs
tail -f backend/logs/app.log
```

### Frontend won't start

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check if port 3000 is available
lsof -i :3000

# Try different port
npm run dev -- --port 3001
```

### Database connection failed

```bash
# Verify PostgreSQL is running
pg_isready

# Check credentials in config.yaml
# Make sure database exists:
psql -U postgres -l | grep clinic
```

### CORS errors

1. Check `FRONTEND_URL` in backend `.env`
2. Verify CORS middleware in `backend/internal/api/middleware/auth.go`
3. Clear browser cache
4. Check browser console for actual error

## 📝 Development Tips

### Hot Reload

- **Backend**: Use [Air](https://github.com/cosmtrek/air) for hot reload
- **Frontend**: Vite provides hot reload by default

### Code Quality

```bash
# Frontend
npm run lint
npm run format  # if configured

# Backend
go fmt ./...
go vet ./...
golangci-lint run  # if installed
```

### Database Management

```bash
# Connect to database
psql -U postgres -d clinic

# View tables
\dt

# View table structure
\d patients

# Reset database (careful!)
DROP DATABASE clinic;
CREATE DATABASE clinic;
```

## 🎯 Next Steps

1. ✅ **Explore the codebase**
   - Backend: `backend/internal/`
   - Frontend: `frontend/src/`

2. ✅ **Read the docs**
   - [README.md](./README.md) - Project overview
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
   - [CHANGELOG.md](./CHANGELOG.md) - Version history

3. ✅ **Try features**
   - Register patients
   - Book services
   - Test payment flow (with Stripe test mode)

4. ✅ **Make changes**
   - Customize UI components
   - Add new features
   - Fix bugs

5. ✅ **Deploy**
   - Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Deploy to Vercel (frontend)
   - Deploy to Render (backend)

## 💡 Pro Tips

- Use React Query DevTools (bottom right corner) to debug API calls
- Check browser Network tab for API request/response
- Use `console.log` for debugging (removed in production build)
- Git commit frequently with descriptive messages
- Test on different browsers and screen sizes

## 🤝 Need Help?

- 📖 Check documentation in this repo
- 🐛 Open an issue on GitHub
- 💬 Join our community discussions
- 📧 Email: info@medicare.vn

---

**Happy Coding! 🚀**
