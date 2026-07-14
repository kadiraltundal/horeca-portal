# Market QR

Akıllı market yönetim sistemi — QR kod tabanlı ürün tarama, POS (satış noktası), stok yönetimi ve kampanya sistemi.

## Özellikler

- **POS (Satış Noktası)** — Hızlı satış ekranı, barkod okuyucu desteği, QR tarama
- **Ürün Yönetimi** — Kategoriler, markalar, fiyatlar, stok takibi
- **Stok Yönetimi** — Mağaza bazlı stok, depo yönetimi, toplu güncelleme
- **Sipariş Yönetimi** — Sipariş oluşturma, durum takibi, fiş yazdırma
- **Kampanya & İndirim** — Kupon kodları, yüzde/TL indirim, otomatik kampanya
- **Sadakat Puanı** — Müşteri puanlama, tier sistemi, ödül değiştirme
- **Kasa Yönetimi** — Nakit kasa açma/kapama, Z raporları
- **Tedarikçi Yönetimi** — Tedarikçi CRUD, satın alma siparişleri, fatura takibi
- **Dashboard** — Satış istatistikleri, düşük stok uyarıları, kampanya dönüşümü
- **Admin Paneli** — Tüm modüllerin yönetimi
- **QR Kod** — Ürün bazlı QR kod oluşturma ve tarama

## Mimari

```
market-qr/
├── apps/
│   ├── backend/          # NestJS REST API (port 3001)
│   ├── web/              # Next.js POS uygulaması (port 3000)
│   └── admin/            # React + Vite Admin paneli (port 3002)
├── packages/
│   └── database/         # Prisma ORM + veritabanı şeması
├── docker-compose.yml    # Production kurulumu
└── turbo.json            # Monorepo yapılandırması
```

## Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Backend | NestJS, Prisma, JWT Auth, Swagger |
| Frontend | Next.js 14, React, Tailwind CSS |
| Admin | React 18, Vite, Tailwind CSS |
| Veritabanı | PostgreSQL (prod) / SQLite (dev) |
| ORM | Prisma |
| Container | Docker, Docker Compose |

## Başlangıç

### Ön Koşullar

- Node.js >= 18
- npm >= 9
- PostgreSQL (production için)

### Kurulum

```bash
# Depoyu klonlayın
git clone <repo-url>
cd market-qr

# Bağımlılıkları yükleyin
npm install

# Veritabanı şemasını oluşturun
npm run db:generate
npm run db:push

# Seed verilerini yükleyin (opsiyonel)
npm run db:seed
```

### Çalıştırma

```bash
# Tüm uygulamaları aynı anda başlatın
npm run dev

# Veya ayrı ayrı:
# Backend (port 3001)
cd apps/backend && npm run start:dev

# Web/POS (port 3000)
cd apps/web && npm run dev

# Admin (port 3002)
cd apps/admin && npm run dev
```

### Varsayılan Kullanıcılar

| Rol | E-posta | Şifre |
|-----|---------|-------|
| Admin | admin@marketqr.com | admin123 |
| Kasiyer | staff@marketqr.com | staff123 |
| Müşteri | customer@marketqr.com | customer123 |

## API Endpointleri

Backend başlatıldığında Swagger dokümantasyonu: `http://localhost:3001/api/docs`

### Temel Endpointler

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/v1/auth/login` | Giriş |
| POST | `/api/v1/auth/register` | Kayıt |
| GET | `/api/v1/stores` | Mağazaları listele |
| GET | `/api/v1/categories` | Kategorileri listele |
| GET | `/api/v1/products/:storeId` | Mağaza ürünlerini listele |
| GET | `/api/v1/products/scan/:qrToken` | QR kod ile ürün bul |
| POST | `/api/v1/orders` | Sipariş oluştur |
| POST | `/api/v1/orders/calculate` | Sipariş hesapla |

## Docker ile Kurulum

```bash
# Production ortamı
docker-compose up -d

# Hizmetler:
# - PostgreSQL: 5432
# - Redis: 6379
# - Backend: 3001
# - Web: 3000
# - Admin: 3002
```

## Proje Yapısı

### Backend Modülleri

- **Auth** — JWT kimlik doğrulama, rol bazlı erişim
- **Products** — Ürün CRUD, barkod, varyantlar, görseller
- **Categories** — Hiyerarşik kategori yönetimi
- **Stores** — Mağaza CRUD
- **Inventory** — Stok yönetimi, toplu güncelleme
- **Orders** — Sipariş oluşturma, durum yönetimi, fiş
- **Payments** — Ödeme işleme (İyzico/PayTR entegrasyonu için hazır)
- **Promotions** — Kampanya ve kupon yönetimi
- **Loyalty** — Sadakat puanı sistemi
- **Suppliers** — Tedarikçi yönetimi
- **PurchaseOrders** — Satın alma siparişleri
- **CashDrawer** — Kasa yönetimi
- **ZReport** — Günlük Z raporları
- **Dashboard** — İstatistikler ve raporlama
- **Scan** — QR tarama analitikleri
- **CMS** — Banner, sayfa, blog, FAQ yönetimi

### Veritabanı Modelleri (40+)

Company, Region, Store, Warehouse, Category, Brand, Supplier, Unit, Product, ProductVariant, StoreProduct, Batch, StoreStock, WarehouseStock, ProductQR, User, Customer, Order, OrderItem, Payment, Promotion, Coupon, LoyaltyTransaction, and more...

## Geliştirme

```bash
# Prisma Client güncelle
npm run db:generate

# Veritabanını senkronize et
npm run db:push

# Migration oluştur
npm run db:migrate

# Seed verilerini yeniden yükle
npm run db:seed

# Build
npm run build

# Lint
npm run lint
```

## Lisans

Bu proje özel lisans altında yayınlanmaktadır.
