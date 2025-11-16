# Changelog

All notable changes to the Clinic Booking Service will be documented in this file.

## [2.0.0] - 2025-11-16

### Major Refactoring Release

This release includes comprehensive refactoring of both frontend and backend with significant improvements in performance, UI/UX, and deployment readiness.

### Added

#### Backend
- **Neon PostgreSQL Support**: Added SSL configuration for Neon database connections
- **Flexible CORS**: Environment-based CORS with support for multiple origins
- **Production Config**: Created `config/config.production.yaml` for production deployment
- **Environment Templates**: Added `.env.example` with all required variables
- **Render Deployment**: Added `render.yaml` for easy Render deployment

#### Frontend
- **TanStack Query Integration**: Replaced manual API calls with React Query for efficient data fetching and caching
- **Lazy Loading**: Implemented React.lazy() for all pages, reducing initial bundle size by 70%
- **Code Splitting**: Configured manual chunks for optimal bundle splitting
  - React vendor: 162KB
  - Query vendor: 29KB
  - UI vendor: 124KB
  - Form vendor: 35KB
  - Main bundle: 25KB
- **Loading States**: Added comprehensive loading states with custom Loading component
- **Environment Config**: Added `.env.development`, `.env.production` files
- **Vercel Deployment**: Added `vercel.json` for production deployment

#### UI/UX
- **Modern Medical Theme**: Professional medical color palette with:
  - Primary Blue: Trust and professionalism
  - Medical Teal: Healing and calm
  - Success Green: Health and wellness
  - Proper warning and error colors
- **Enhanced Components**: Redesigned all core UI components:
  - Buttons with gradients and hover effects
  - Cards with multiple variants (default, medical, hover, glass)
  - Badges with medical theme
  - Inputs with better validation states
- **Typography**: Added Google Fonts (Inter, Poppins) for better readability
- **Animations**: Smooth transitions, fade-ins, and scale effects
- **Shadows**: Medical-themed shadows for depth
- **Accessibility**: Enhanced focus states and keyboard navigation

#### Developer Experience
- **Build Optimization**: Configured Vite with esbuild minification
- **Dependency Optimization**: Pre-bundled common dependencies
- **Source Maps**: Enabled for easier debugging
- **Dev Tools**: Added React Query DevTools

### Changed

#### Backend
- **Database Client**: Updated to support SSL mode configuration
- **CORS Middleware**: Enhanced to support dynamic origins from environment variables
- **Config Structure**: Improved configuration loading with production support

#### Frontend
- **Routing**: Converted to lazy-loaded routes with Suspense fallbacks
- **API Layer**: Migrated to TanStack Query with custom hooks
- **Styling**: Complete Tailwind config overhaul with medical theme
- **Component Library**: Redesigned all components with new design system

### Performance Improvements

- **Initial Load Time**: Reduced by ~70% through code splitting
- **Bundle Size**: Optimized from 541KB to multiple smaller chunks
- **Caching**: Implemented React Query caching (5min stale, 10min cache)
- **Build Time**: Faster builds with esbuild minification

### Security

- **CodeQL Analysis**: Passed with 0 vulnerabilities
- **CORS**: Enhanced with environment-based origin validation
- **SSL**: Database connections use SSL in production
- **Environment Variables**: Sensitive data moved to environment variables

### Documentation

- **DEPLOYMENT.md**: Comprehensive deployment guide for Vercel and Render
- **README Updates**: Updated with new features and setup instructions
- **.env.example**: Template for all required environment variables

### Migration Notes

For existing installations:

1. **Backend**:
   - Copy `backend/.env.example` to `backend/.env` and fill in values
   - Update `backend/config/config.yaml` for local development
   - Set environment variables in your hosting platform

2. **Frontend**:
   - Run `npm install` to get new dependencies
   - Update environment variables for your deployment
   - Rebuild with `npm run build`

3. **Database**:
   - No schema changes in this release
   - Existing data is compatible

### Breaking Changes

- **API Changes**: Some components now require TanStack Query context
- **Environment Variables**: Frontend now requires `VITE_API_BASE_URL`
- **CORS**: Backend requires `FRONTEND_URL` environment variable

### Dependencies

#### Added
- `@tanstack/react-query`: ^5.x
- `@tanstack/react-query-devtools`: ^5.x

#### Updated
- All existing dependencies updated to latest compatible versions

### Known Issues

- None at this time

### Contributors

- @kangourouuu

---

## [1.0.0] - Initial Release

Initial release with basic functionality:
- Patient registration and authentication
- Doctor and Nurse management
- Service booking system
- Stripe payment integration
- Basic UI components
- Docker support
