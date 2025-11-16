# Environment Variables Configuration

This document lists all required and optional environment variables for deploying the Clinic Booking Service.

## Backend Environment Variables (Render)

### Required Variables

These variables MUST be set in the Render dashboard for the backend to work:

```bash
# Server Configuration
CONFIG_DIR=config/config.production.yaml
PORT=9000
GO_ENV=production
```

### Optional Variables

These variables are optional but recommended for full functionality:

```bash
# Security (Recommended for production)
SECRET_KEY=your-jwt-secret-key-generate-a-strong-random-string

# CORS (Required if frontend is on different domain)
FRONTEND_URL=https://clinic-booking-service.vercel.app

# Payment Integration (Required for payment functionality)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Image Upload (Required for avatar uploads)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Redis (Optional - for real-time WebSocket queue updates)
# If not provided, WebSocket features will be disabled but app will still work
REDIS_HOST=
REDIS_PASSWORD=
REDIS_DB=0

# RabbitMQ (Optional - for message queue processing)
# If not provided, message queue will be disabled but app will still work
RABBITMQ_USERNAME=
RABBITMQ_PASSWORD=
RABBITMQ_HOST=
RABBITMQ_PORT=5672
```

### Configuration Notes for Backend

1. **Database**: Already configured in `backend/config/config.production.yaml`
2. **Redis & RabbitMQ**: Set to `false` in production config by default
   - The app will run without these services
   - Real-time WebSocket queue updates require Redis
   - Message queue processing requires RabbitMQ
   - If disabled, the app uses direct database updates instead

## Frontend Environment Variables (Vercel)

### Required Variables

Set these in the Vercel dashboard under your project's Environment Variables:

```bash
VITE_API_BASE_URL=https://clinic-booking-backend-78t6.onrender.com/api
VITE_APP_ENV=production
```

### How to Set Variables in Vercel

1. Go to your project in Vercel
2. Navigate to Settings → Environment Variables
3. Add each variable:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://clinic-booking-backend-78t6.onrender.com/api`
   - Environment: Production (check the box)
4. Click "Save"
5. Redeploy your application for changes to take effect

## How to Set Variables in Render

1. Go to your service in Render
2. Navigate to Environment tab
3. Click "Add Environment Variable"
4. Add each variable with its value
5. Click "Save Changes"
6. Render will automatically redeploy with new variables

## Minimal Working Configuration

For a basic deployment that works without payment, image upload, Redis, or RabbitMQ:

### Backend (Render)
```bash
CONFIG_DIR=config/config.production.yaml
PORT=9000
GO_ENV=production
```

### Frontend (Vercel)
```bash
VITE_API_BASE_URL=https://clinic-booking-backend-78t6.onrender.com/api
VITE_APP_ENV=production
```

This minimal setup will:
- ✅ Allow user registration and login
- ✅ Allow viewing services and categories
- ✅ Allow booking services
- ✅ Provide basic patient/doctor/nurse functionality
- ❌ No real-time WebSocket updates (requires Redis)
- ❌ No async message queue processing (requires RabbitMQ)
- ❌ No payment processing (requires Stripe)
- ❌ No image uploads (requires Cloudinary)

## Full Production Configuration

For complete functionality with all features:

### Backend (Render)
```bash
# Required
CONFIG_DIR=config/config.production.yaml
PORT=9000
GO_ENV=production

# Security
SECRET_KEY=your-strong-secret-key-here

# CORS
FRONTEND_URL=https://clinic-booking-service.vercel.app

# Payment
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Image Upload
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Redis (for real-time updates)
REDIS_HOST=your-redis-host:6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# RabbitMQ (for message queue)
RABBITMQ_USERNAME=your-rabbitmq-username
RABBITMQ_PASSWORD=your-rabbitmq-password
RABBITMQ_HOST=your-rabbitmq-host
RABBITMQ_PORT=5672
```

### Frontend (Vercel)
```bash
VITE_API_BASE_URL=https://clinic-booking-backend-78t6.onrender.com/api
VITE_APP_ENV=production
```

## Enabling Redis and RabbitMQ

If you want to enable Redis and RabbitMQ:

1. Set up Redis and RabbitMQ services (e.g., on Railway, Redis Labs, CloudAMQP)
2. Update `backend/config/config.production.yaml`:
   ```yaml
   main:
     redis: true
     rabbitmq: true
   
   redis:
     addr: "your-redis-host:6379"
     password: "your-redis-password"
     db: 0
   
   rabbitmq:
     username: "your-username"
     password: "your-password"
     host: "your-rabbitmq-host"
     port: 5672
   ```
3. Commit and push the changes
4. Render will automatically redeploy

## Verifying Configuration

After deployment:

1. **Backend**: Check Render logs for:
   ```
   level=info msg="Connected to postgresql database"
   level=warning msg="Redis connection not available, skipping token caching"
   level=warning msg="RabbitMQ initialization skipped"
   ```

2. **Frontend**: Open browser console and check:
   ```javascript
   // Should see API calls going to your backend URL
   🚀 GET https://clinic-booking-backend-78t6.onrender.com/api/...
   ```

## Troubleshooting

### Backend Issues

**App crashes on startup with "RabbitMQ is disabled in config"**
- ✅ Fixed! The app now handles disabled Redis/RabbitMQ gracefully

**CORS errors**
- Set `FRONTEND_URL` environment variable in Render
- Value should be: `https://clinic-booking-service.vercel.app`

**Database connection fails**
- Check `backend/config/config.production.yaml` has correct credentials
- Ensure Neon database is not suspended (free tier limitation)

### Frontend Issues

**API calls return 404 or go to wrong URL**
- Verify `VITE_API_BASE_URL` is set correctly in Vercel
- Make sure to include `/api` at the end
- Redeploy after changing environment variables

**Environment variable not working**
- Make sure it starts with `VITE_` (Vite requirement)
- Redeploy after adding/changing variables
- Clear browser cache

## Quick Setup Commands

### Using Vercel CLI
```bash
cd frontend
vercel env add VITE_API_BASE_URL production
# Enter: https://clinic-booking-backend-78t6.onrender.com/api
vercel env add VITE_APP_ENV production
# Enter: production
vercel --prod
```

### Using Render CLI
```bash
# Set environment variables via dashboard (no CLI available)
# Or use render.yaml (already configured)
```
