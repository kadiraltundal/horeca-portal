# HORECA Portal - Backend API

NestJS backend API for the HORECA Portal Telegram Mini App.

## Tech Stack

- NestJS 11
- TypeScript
- TypeORM
- PostgreSQL 16
- Redis 7
- JWT Authentication

## Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run start:dev
```

Backend runs on http://localhost:3001

## Project Structure

```
src/
├── modules/          # Feature modules
│   ├── auth/         # Telegram login + JWT
│   ├── users/        # User profiles
│   ├── products/     # Product catalog
│   ├── categories/   # Hierarchical categories
│   ├── brands/       # Brand management
│   ├── pricing/      # Dynamic tiered pricing
│   ├── cart/         # Quote cart
│   ├── quotes/       # Quote submission
│   ├── notifications/# In-app notifications
│   ├── favorites/    # User favorites
│   ├── campaigns/    # Promotional campaigns
│   ├── search/       # Search + autocomplete
│   ├── admin/        # Admin dashboard
│   ├── settings/     # System settings
│   ├── telegram/     # Telegram bot
│   ├── import/       # CSV import
│   └── health/       # Health check
├── common/           # Shared utilities
└── app.module.ts     # Root module
```

## API Endpoints

### Authentication
- `POST /api/auth/telegram-login` - Login with Telegram
- `POST /api/auth/refresh` - Refresh tokens
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `GET /api/products/search` - Search products

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart

### Quotes
- `GET /api/quotes` - List user quotes
- `POST /api/quotes` - Create quote
- `GET /api/quotes/:id` - Get quote

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/quotes` - List all quotes
- `PUT /api/admin/quotes/:id` - Update quote status

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Deployment

See [DEPLOY.md](../DEPLOY.md) for deployment instructions.
