# Deployment Guide

This guide provides step-by-step instructions for deploying the Clinic Booking Service to production.

## Architecture Overview

- **Frontend**: React SPA hosted on Vercel
- **Backend**: Go API hosted on Render
- **Database**: PostgreSQL on Neon
- **Optional**: Redis (if needed) and RabbitMQ (if needed) can be deployed separately

## Prerequisites

1. **Accounts**:
   - [Vercel Account](https://vercel.com) for frontend hosting
   - [Render Account](https://render.com) for backend hosting
   - [Neon Account](https://neon.tech) for PostgreSQL database
   - Stripe account for payments
   - Cloudinary account for image uploads

2. **Tools**:
   - Git
   - Node.js (v18+)
   - Go (v1.23+)

## Database Setup (Neon)

1. Create a new Neon project at https://neon.tech
2. Note your connection string (it will look like):
   ```
   postgresql://username:password@host/database?sslmode=require
   ```
3. The database schema will be auto-created on first run via the seed script

## Backend Deployment (Render)

### Step 1: Prepare Configuration

1. Ensure `render.yaml` is in your repository root:
```yaml
services:
  - type: web
    name: clinic-booking-backend
    runtime: go
    plan: free
    buildCommand: cd backend && go build -o main cmd/main.go
    startCommand: cd backend && ./main
    envVars:
      - key: CONFIG_DIR
        value: config/config.production.yaml
      - key: PORT
        value: 9000
      - key: GO_ENV
        value: production
    healthCheckPath: /api/health
```

### Step 2: Set Environment Variables

In Render dashboard, add these environment variables:

```bash
# Required
SECRET_KEY=your-jwt-secret-key-generate-a-strong-random-string
FRONTEND_URL=https://your-frontend-url.vercel.app

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Cloudinary
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Optional (if using external services)
# REDIS_HOST=your-redis-host:6379
# REDIS_PASSWORD=your-redis-password
# RABBITMQ_URL=amqp://user:pass@host:5672/
```

### Step 3: Deploy

1. Connect your GitHub repository to Render
2. Render will automatically deploy using `render.yaml`
3. Note your backend URL: `https://clinic-booking-backend.onrender.com`

### Step 4: Update Database Config

The `backend/config/config.production.yaml` should have your Neon database credentials:

```yaml
db:
  host: "ep-round-mountain-a1dg7qjn-pooler.ap-southeast-1.aws.neon.tech"
  port: 5432
  username: "neondb_owner"
  password: "npg_jxang6CcbuV8"
  database: "clinic_booking"
  sslmode: "require"
```

**Note**: For production, consider using environment variables instead of hardcoding credentials.

## Frontend Deployment (Vercel)

### Step 1: Prepare Configuration

1. Ensure `vercel.json` is in your repository root
2. Update `frontend/.env.production` with your backend URL:

```bash
VITE_API_BASE_URL=https://clinic-booking-backend.onrender.com/api
VITE_APP_ENV=production
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables:
   ```
   VITE_API_BASE_URL=https://clinic-booking-backend.onrender.com/api
   VITE_APP_ENV=production
   ```
6. Click "Deploy"

### Step 3: Update CORS

Update your backend's CORS configuration to include your Vercel domain:

In `backend/internal/api/middleware/auth.go`, the allowed origins should include:
```go
allowedOrigins := []string{
    "http://localhost:3000",
    "https://your-app.vercel.app", // Add your Vercel domain
    os.Getenv("FRONTEND_URL"),
}
```

## Post-Deployment

### 1. Test the Application

- Visit your Vercel URL
- Test patient registration
- Test login functionality
- Test booking a service
- Test payment flow

### 2. Configure Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://clinic-booking-backend.onrender.com/api/webhook/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. Copy the webhook secret and update `STRIPE_WEBHOOK_SECRET` in Render

### 3. Set Up Monitoring

- Configure Render logs monitoring
- Set up Vercel analytics
- Consider adding error tracking (e.g., Sentry)

## Environment Variables Reference

### Backend (.env)

```bash
# Server
PORT=9000
CONFIG_DIR=config/config.production.yaml
GO_ENV=production

# Security
SECRET_KEY=your-secret-key-here

# CORS
FRONTEND_URL=https://your-frontend-url.vercel.app

# Payment
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Image Upload
CLOUDINARY_URL=cloudinary://xxx:xxx@xxx

# Optional Services
REDIS_HOST=
REDIS_PASSWORD=
RABBITMQ_URL=
```

### Frontend (.env.production)

```bash
VITE_API_BASE_URL=https://clinic-booking-backend.onrender.com/api
VITE_APP_ENV=production
```

## Troubleshooting

### Backend Issues

**502 Bad Gateway**
- Check Render logs
- Verify database connection
- Ensure all environment variables are set

**CORS Errors**
- Verify `FRONTEND_URL` environment variable
- Check CORS configuration in middleware
- Ensure frontend URL is in allowed origins list

**Database Connection Failed**
- Verify Neon database credentials
- Check SSL mode is set to "require"
- Ensure database is not suspended (Neon free tier)

### Frontend Issues

**API Calls Failing**
- Verify `VITE_API_BASE_URL` is correct
- Check backend is running
- Verify CORS configuration

**Build Failures**
- Check Node.js version (should be 18+)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript/ESLint errors

## Scaling Considerations

### Database
- Monitor Neon usage
- Consider upgrading plan for production
- Set up database backups

### Backend
- Upgrade Render plan for higher resources
- Consider adding Redis for session storage
- Set up horizontal scaling if needed

### Frontend
- Vercel automatically scales
- Configure CDN caching headers
- Optimize images with Cloudinary

## Security Checklist

- [ ] Change default SECRET_KEY
- [ ] Use production Stripe keys
- [ ] Enable HTTPS only
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable database SSL
- [ ] Rotate credentials regularly
- [ ] Set up security headers
- [ ] Enable logging and monitoring
- [ ] Regular security audits

## Support

For issues or questions:
- Check application logs in Render
- Review Vercel deployment logs
- Check Neon database status
- Contact support at: info@medicare.vn

## License

MIT License
