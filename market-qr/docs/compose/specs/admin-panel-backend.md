# Admin Panel & Backend API — Specification

## S1. Overview

Build a complete admin panel and backend API for the Market QR monorepo. The backend serves as the REST API layer (port 3001) and the admin panel provides a management UI for all business entities.

**Existing state:** A NestJS backend (`apps/backend`) with 29 module stubs and a Vite+React admin panel (`apps/admin`) with page components already exist. This spec covers completing the backend endpoints and ensuring the admin panel fully consumes them.

## S2. Backend API

### S2.1 Server Configuration

- Framework: NestJS (already in place) on port 3001
- Global prefix: `/api/v1` (already set in `main.ts`)
- CORS: enabled, origin from `CORS_ORIGIN` env or `http://localhost:3000`
- Swagger docs at `/api/docs`
- Validation: `class-validator` + `class-transformer` with whitelist+transform

### S2.2 Auth Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Email+password login, returns JWT access+refresh tokens |
| POST | `/auth/register` | Register new user (ADMIN/STAFF only for admin panel) |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/me` | Get current user profile (protected) |

- JWT access token expiry: 15min, refresh token: 7d
- Password hashing: bcryptjs
- Roles: ADMIN, STAFF, CUSTOMER (ADMIN and STAFF can access admin panel)

### S2.3 Products Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/products` | List all products (paginated, filterable by category/brand/status) |
| GET | `/products/:id` | Get product by ID |
| POST | `/products` | Create product |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Soft-delete (set isActive=false) |
| GET | `/products/brands/all` | List all brands |
| POST | `/products/brands` | Create brand |
| PUT | `/products/brands/:id` | Update brand |
| DELETE | `/products/brands/:id` | Delete brand |

### S2.4 Stores Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/stores` | List all stores |
| GET | `/stores/:id` | Get store by ID |
| POST | `/stores` | Create store |
| PUT | `/stores/:id` | Update store |
| DELETE | `/stores/:id` | Delete store |

### S2.5 Orders Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/orders` | List orders (paginated, filterable by storeId, status) |
| GET | `/orders/:id` | Get order detail with items |
| PUT | `/orders/:id/status` | Update order status |
| GET | `/orders/stats/:storeId` | Get order statistics for a store |

### S2.6 Promotions Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/promotions` | List promotions (filterable by isActive) |
| GET | `/promotions/:id` | Get promotion by ID |
| POST | `/promotions` | Create promotion |
| PUT | `/promotions/:id` | Update promotion |
| DELETE | `/promotions/:id` | Delete promotion |
| PUT | `/promotions/:id/toggle` | Toggle active status |
| GET | `/promotions/coupons/all` | List all coupons |
| POST | `/promotions/coupons` | Create coupon |
| POST | `/promotions/coupons/validate` | Validate coupon code |

### S2.7 Users Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users` | List all users (paginated) |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create user |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Deactivate user |
| PUT | `/users/:id/role` | Update user role |

### S2.8 Dashboard Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/overview` | Aggregated stats (total products, orders, revenue, scans, low stock) |
| GET | `/dashboard/top-products` | Top selling products |
| GET | `/dashboard/campaign-conversion` | Promotion conversion stats |

### S2.9 Additional Endpoints (already partially implemented)

- Categories: CRUD
- Inventory: stock management per store
- Suppliers: CRUD
- Stock Movements: list/create
- Purchase Orders: CRUD + status
- Refunds: list/create/status
- Cash Drawer: open/close/history
- Z Reports: generate/list
- Scan Logs: stats, hourly, recent
- Notifications: list/read
- Audit: list/entity history

## S3. Admin Panel

### S3.1 Tech Stack

- Framework: Vite + React 18 + TypeScript (already in place)
- Routing: react-router-dom v6
- Styling: Tailwind CSS 3
- Icons: lucide-react
- Charts: recharts

### S3.2 Authentication

- Login page with email/password form
- JWT token stored in localStorage (`admin_token`)
- AuthContext provides `user`, `token`, `login()`, `logout()`
- Protected routes redirect to `/login` if unauthenticated
- Only ADMIN and STAFF roles allowed

### S3.3 Layout

- Sidebar navigation (dark background, fixed width 256px)
- Main content area with scrollable content
- User info + logout button at sidebar bottom

### S3.4 Pages

#### Dashboard (`/`)
- 8 stat cards: Total Products, Active QR, Today Scans, Today Orders, Month Scans, Month Orders, Total Revenue, Low Stock Alerts
- Recent orders list
- Low stock warnings
- Expiring batches (if available)

#### Products (`/products`)
- Table: SKU, Name, Category, Price, Stock, Actions
- Store selector dropdown
- Create/Edit modal with form fields: name, description, price, category, barcode
- Delete with confirmation

#### Stores (`/stores`)
- Table: Name, Address, Phone, Status, Actions
- Create/Edit modal
- Toggle active status

#### Orders (`/orders`)
- Table: Order No, Customer, Items, Total, Date, Status, Actions
- Store selector + Status filter dropdowns
- Detail modal with items list
- Status update buttons (PENDING→PAID→COMPLETED, or CANCELLED)

#### Promotions (`/promotions`) — NOT YET IN ROUTES
- Table: Title, Discount Type, Value, Date Range, Status, Actions
- Create/Edit modal with: title, description, discountType, discountValue, startDate, endDate, targetCategoryId, usageLimit
- Toggle active status
- Coupon management sub-section

#### Users (`/users`) — NOT YET IN ROUTES
- Table: Name, Email, Role, Store, Status, Actions
- Create/Edit modal
- Role update

### S3.5 Existing Pages (already implemented)

- Categories, Inventory, Stock Movements, Suppliers, Purchase Orders, Refunds, Cash Drawer, Z Reports

## S4. Data Models

All models defined in `packages/database/prisma/schema.prisma`. Key models for this spec:

- **User**: id, email, password, firstName, lastName, phone, role, companyId, storeId, avatarUrl
- **Product**: id, sku, name, description, price, currency, vatRate, barcode, status, isActive, categoryId, brandId, supplierId, unitId
- **Store**: id, regionId, name, address, latitude, longitude, phone, isActive, workingHours
- **Order**: id, userId, storeId, totalAmount, discountAmount, status, paymentMethod
- **Promotion**: id, title, description, discountType, discountValue, startDate, endDate, targetCategoryId, isActive, usageLimit, usedCount
- **Coupon**: id, code, promotionId, usageLimit, usedCount, minAmount, expiresAt, isActive

## S5. Type Definitions

Shared types in `packages/types/src/index.ts`:
- Enums: UserRole, OrderStatus, PaymentMethod, PaymentProvider, PaymentStatus, NotificationChannel, DiscountType
- Entity interfaces: User, Store, Product, Order, OrderItem, Payment, Promotion, etc.
- API types: AuthTokens, LoginRequest, RegisterRequest, PaginatedResponse, ApiResponse

## S6. Environment

- Backend port: 3001
- Admin panel port: 3002 (Vite dev server)
- Database: SQLite via Prisma
- API base URL in admin: `http://localhost:3001/api/v1`
