# HORECA Portal

**Powered by Kalsan**

Telegram Mini App for HORECA sector in Uzbekistan

## Tech Stack

### Frontend
- Next.js 16+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Telegram WebApp SDK

### Backend
- NestJS 11+
- TypeScript
- TypeORM
- PostgreSQL 16
- Redis 7+
- JWT Authentication

## Project Structure

```
horeca-portal/
├── frontend/          # Next.js Telegram Mini App
│   ├── src/
│   │   ├── app/       # Pages
│   │   ├── components/# UI Components
│   │   ├── hooks/     # Custom Hooks
│   │   ├── services/  # API Services
│   │   ├── stores/    # State Management
│   │   └── types/     # TypeScript Types
│   └── package.json
│
├── backend/           # NestJS API
│   ├── src/
│   │   ├── modules/   # Feature Modules
│   │   ├── common/    # Shared Utilities
│   │   └── config/    # Configuration
│   └── package.json
│
├── database/          # SQL Scripts
├── docker-compose.yml # Docker Configuration
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### 1. Start Database

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- pgAdmin on port 5050

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env  # Configure environment
npm run start:dev
```

Backend runs on http://localhost:3001

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=horeca_admin
DB_PASSWORD=horeca_secret_2024
DB_DATABASE=horeca_portal

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_TELEGRAM_BOT_URL=https://t.me/your_bot_username
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
- `GET /api/products/:id/alternatives` - Get alternatives

### Categories
- `GET /api/categories` - List categories
- `GET /api/categories/:slug` - Get category

### Brands
- `GET /api/brands` - List brands
- `GET /api/brands/:slug` - Get brand

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart
- `DELETE /api/cart` - Clear cart

### Quotes
- `GET /api/quotes` - List user quotes
- `POST /api/quotes` - Create quote
- `GET /api/quotes/:id` - Get quote
- `POST /api/quotes/:id/repeat` - Repeat quote

### Payments
- `POST /api/payments` - Create payment
- `GET /api/payments` - List user payments
- `GET /api/payments/admin/all` - All payments (admin)
- `GET /api/payments/admin/stats` - Payment stats (admin)
- `GET /api/payments/:id` - Get payment
- `POST /api/payments/:id/process/click` - Process Click payment
- `POST /api/payments/:id/process/payme` - Process Payme payment
- `PUT /api/payments/:id/status` - Update payment status

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List user orders
- `GET /api/orders/admin/all` - All orders (admin)
- `GET /api/orders/admin/stats` - Order stats (admin)
- `GET /api/orders/:id` - Get order
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/payment-status` - Update payment status
- `PUT /api/orders/:id/cancel` - Cancel order

### Reports
- `GET /api/reports/dashboard` - Dashboard stats
- `GET /api/reports/sales` - Sales report
- `GET /api/reports/products` - Product report
- `GET /api/reports/users` - User report
- `GET /api/reports/conversion` - Conversion rate

### Vendors
- `POST /api/vendors` - Create vendor
- `GET /api/vendors` - List all vendors
- `GET /api/vendors/my` - My vendors
- `GET /api/vendors/:id` - Get vendor
- `PUT /api/vendors/:id/approve` - Approve vendor
- `PUT /api/vendors/:id/reject` - Reject vendor
- `PUT /api/vendors/:id/suspend` - Suspend vendor

### Recommendations
- `GET /api/recommendations/similar/:productId` - Similar products
- `GET /api/recommendations/popular` - Popular products
- `GET /api/recommendations/personalized` - Personalized recommendations

### Favorites
- `GET /api/favorites` - List favorites
- `POST /api/favorites/:productId` - Add favorite
- `DELETE /api/favorites/:productId` - Remove favorite

### Notifications
- `GET /api/notifications` - List notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/quotes` - List all quotes
- `PUT /api/admin/quotes/:id` - Update quote status

## Features

### Phase 1 - Core Platform
- Telegram Login (HMAC-SHA256 + JWT)
- Product Catalog (CRUD, images, attributes)
- Hierarchical Categories (2 levels)
- Brand Management
- Dynamic Pricing (cost + margin, volume tiers)
- Quote Cart & Quote System
- Favorites & Notifications
- Search (autocomplete, history, popular)
- Promotional Campaigns
- Admin Panel (dashboard, product/quote management)
- CSV Product Import
- Telegram Bot Notifications
- Caching (in-memory, 5min TTL)

### Phase 2 - Payments, Orders, Reports
- Payment System (Click, Payme, credit card, bank transfer, cash)
- Order Management (7 statuses, payment tracking)
- Reports (dashboard, sales, products, users, conversion)

### Phase 3 - Multi-Vendor, Enhanced UX
- Vendor System (registration, approval, commission, rating)
- Report Charts & Export
- User Settings (language, notifications)

### Phase 4 - Email, Recommendations, Performance
- Email Notifications (templates)
- Product Recommendations (similar, popular, personalized)
- Performance Indexes (trigram search)

## License

Private - Kalsan