# Database Design

## HORECA Portal - PostgreSQL Veritabanı Tasarımı

**Versiyon**: 1.0
**Tarih**: 2026-07-13
**Veritabanı**: PostgreSQL 16

---

## 1. Genel Bakış

### 1.1 Tasarım Prensipleri
- **Normalization**: 3NF'e kadar normalizasyon
- **UUID Primary Key**: Tüm tablolar UUID kullanır
- **Soft Delete**: `is_active` ile silme (hard delete yok)
- **Timestamp**: `created_at` ve `updated_at` alanları
- **Audit Trail**: Kritik değişiklikler için log

### 1.2 Şema Yapısı
```
┌─────────────────────────────────────────────────────────────┐
│                     HORECA Portal DB                         │
├─────────────────────────────────────────────────────────────┤
│  Core Tables:                                                │
│  ├── users                                                   │
│  ├── categories                                              │
│  ├── brands                                                  │
│  └── products                                                │
│                                                              │
│  Pricing Tables:                                             │
│  ├── pricing                                                 │
│  └── pricing_tiers                                           │
│                                                              │
│  Product Relations:                                          │
│  ├── product_images                                          │
│  └── product_attributes                                      │
│                                                              │
│  User Relations:                                             │
│  ├── favorites                                               │
│  ├── quote_carts                                             │
│  ├── search_history                                          │
│  └── notifications                                           │
│                                                              │
│  Quote System:                                               │
│  ├── quotes                                                  │
│  └── quote_items                                             │
│                                                              │
│  Campaign System:                                            │
│  ├── campaigns                                               │
│  └── campaign_products                                       │
│                                                              │
│  System:                                                     │
│  └── settings                                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Tablo Detayları

### 2.1 users
Kullanıcı bilgileri.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(100),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(20),
    company VARCHAR(200),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    language VARCHAR(5) DEFAULT 'uz' CHECK (language IN ('uz', 'ru')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Alanlar**:
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUID | Birincil anahtar |
| telegram_id | BIGINT | Telegram kullanıcı ID'si (benzersiz) |
| username | VARCHAR(100) | Telegram username |
| first_name | VARCHAR(100) | Ad |
| last_name | VARCHAR(100) | Soyad |
| phone | VARCHAR(20) | Telefon (opsiyonel) |
| company | VARCHAR(200) | Şirket adı |
| role | VARCHAR(20) | Rol: customer, admin |
| language | VARCHAR(5) | Dil tercihi: uz, ru |
| is_active | BOOLEAN | Aktif mi? |
| created_at | TIMESTAMP | Oluşturulma tarihi |
| updated_at | TIMESTAMP | Güncellenme tarihi |

**İndeksler**:
```sql
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
```

---

### 2.2 categories
Kategori hiyerarşisi.

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name_uz VARCHAR(200) NOT NULL,
    name_ru VARCHAR(200),
    slug VARCHAR(200) UNIQUE NOT NULL,
    icon VARCHAR(50),
    image_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Alanlar**:
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUID | Birincil anahtar |
| parent_id | UUID | Üst kategori ID (self-reference) |
| name_uz | VARCHAR(200) | Özbekçe ad |
| name_ru | VARCHAR(200) | Rusça ad |
| slug | VARCHAR(200) | URL dostu ad (benzersiz) |
| icon | VARCHAR(50) | Emoji ikon |
| image_url | VARCHAR(500) | Görsel URL |
| sort_order | INTEGER | Sıralama |
| is_active | BOOLEAN | Aktif mi? |
| created_at | TIMESTAMP | Oluşturulma tarihi |

**İlişkiler**:
- `parent_id` → `categories.id` (self-reference)
- Bir kategorinin birden fazla alt kategorisi olabilir
- Bir kategorinin birden fazla ürünü olabilir

**İndeksler**:
```sql
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);
```

---

### 2.3 brands
Marka bilgileri.

```sql
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Alanlar**:
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUID | Birincil anahtar |
| name | VARCHAR(200) | Marka adı |
| slug | VARCHAR(200) | URL dostu ad (benzersiz) |
| logo_url | VARCHAR(500) | Logo görseli |
| description | TEXT | Açıklama |
| is_active | BOOLEAN | Aktif mi? |
| created_at | TIMESTAMP | Oluşturulma tarihi |

**İndeksler**:
```sql
CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_active ON brands(is_active);
```

---

### 2.4 products
Ürün bilgileri.

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name_uz VARCHAR(300) NOT NULL,
    name_ru VARCHAR(300),
    description_uz TEXT,
    description_ru TEXT,
    unit VARCHAR(20) DEFAULT 'piece' CHECK (unit IN ('piece', 'kg', 'liter', 'box', 'set')),
    min_quantity INTEGER DEFAULT 1,
    max_quantity INTEGER,
    stock_status VARCHAR(20) DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock', 'limited')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Alanlar**:
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUID | Birincil anahtar |
| category_id | UUID | Kategori ID |
| brand_id | UUID | Marka ID |
| sku | VARCHAR(100) | Stok takip kodu (benzersiz) |
| name_uz | VARCHAR(300) | Özbekçe ad |
| name_ru | VARCHAR(300) | Rusça ad |
| description_uz | TEXT | Özbekçe açıklama |
| description_ru | TEXT | Rusça açıklama |
| unit | VARCHAR(20) | Birim: piece, kg, liter, box, set |
| min_quantity | INTEGER | Minimum sipariş miktarı |
| max_quantity | INTEGER | Maximum sipariş miktarı |
| stock_status | VARCHAR(20) | Stok durumu |
| is_active | BOOLEAN | Aktif mi? |
| created_at | TIMESTAMP | Oluşturulma tarihi |
| updated_at | TIMESTAMP | Güncellenme tarihi |

**İlişkiler**:
- `category_id` → `categories.id`
- `brand_id` → `brands.id`
- Bir ürünün birden fazla görseli olabilir
- Bir ürünün birden fazla özelliği olabilir
- Bir ürünün fiyatlandırması olabilir

**İndeksler**:
```sql
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_stock ON products(stock_status);
CREATE INDEX idx_products_name_uz_gin ON products USING gin(name_uz gin_trgm_ops);
CREATE INDEX idx_products_name_ru_gin ON products USING gin(name_ru gin_trgm_ops);
```

---

### 2.5 product_images
Ürün görselleri.

```sql
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(200),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Alanlar**:
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUID | Birincil anahtar |
| product_id | UUID | Ürün ID |
| image_url | VARCHAR(500) | Görsel URL |
| alt_text | VARCHAR(200) | Alternatif metin |
| sort_order | INTEGER | Sıralama |
| is_primary | BOOLEAN | Ana görsel mi? |
| created_at | TIMESTAMP | Oluşturulma tarihi |

**İlişkiler**:
- `product_id` → `products.id` (CASCADE delete)

**İndeksler**:
```sql
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(is_primary);
```

---

### 2.6 product_attributes
Ürün özellikleri.

```sql
CREATE TABLE product_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_value VARCHAR(300) NOT NULL,
    sort_order INTEGER DEFAULT 0
);
```

**Alanlar**:
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUID | Birincil anahtar |
| product_id | UUID | Ürün ID |
| attribute_name | VARCHAR(100) | Özellik adı |
| attribute_value | VARCHAR(300) | Özellik değeri |
| sort_order | INTEGER | Sıralama |

**Örnek Veri**:
```sql
INSERT INTO product_attributes (product_id, attribute_name, attribute_value) VALUES
('uuid', 'Hacim', '1L'),
('uuid', 'Rang', 'Ko''k'),
('uuid', 'Ishlab chiqaruvchi', 'O''zbekiston');
```

**İndeksler**:
```sql
CREATE INDEX idx_product_attributes_product ON product_attributes(product_id);
```

---

### 2.7 pricing
Ürün fiyatlandırması.

```sql
CREATE TABLE pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    cost_price DECIMAL(12,2) NOT NULL CHECK (cost_price >= 0),
    currency VARCHAR(3) DEFAULT 'USD' CHECK (currency IN ('USD', 'UZS')),
    additional_costs DECIMAL(12,2) DEFAULT 0 CHECK (additional_costs >= 0),
    margin_percentage DECIMAL(5,2) NOT NULL CHECK (margin_percentage >= 0 AND margin_percentage <= 100),
    selling_price DECIMAL(12,2) NOT NULL CHECK (selling_price >= 0),
    valid_from TIMESTAMP DEFAULT NOW(),
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Alanlar**:
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUID | Birincil anahtar |
| product_id | UUID | Ürün ID |
| cost_price | DECIMAL(12,2) | Alış maliyeti |
| currency | VARCHAR(3) | Para birimi: USD, UZS |
| additional_costs | DECIMAL(12,2) | Ek maliyetler |
| margin_percentage | DECIMAL(5,2) | Kâr marjı yüzdesi |
| selling_price | DECIMAL(12,2) | Satış fiyatı |
| valid_from | TIMESTAMP | Başlangıç tarihi |
| valid_until | TIMESTAMP | Bitiş tarihi |
| is_active | BOOLEAN | Aktif mi? |
| created_at | TIMESTAMP | Oluşturulma tarihi |
| updated_at | TIMESTAMP | Güncellenme tarihi |

**Fiyat Hesaplama**:
```
selling_price = (cost_price + additional_costs) × (1 + margin_percentage / 100)
```

**Örnek Hesaplama**:
```sql
-- cost_price: $1.50, additional_costs: $0.10, margin: 25%
-- selling_price = (1.50 + 0.10) × (1 + 25/100) = 1.60 × 1.25 = $2.00
```

**İndeksler**:
```sql
CREATE INDEX idx_pricing_product ON pricing(product_id);
CREATE INDEX idx_pricing_active ON pricing(is_active);
CREATE INDEX idx_pricing_valid ON pricing(valid_from, valid_until);
```

---

### 2.8 pricing_tiers
Miktara göre fiyat kademeleri.

```sql
CREATE TABLE pricing_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pricing_id UUID REFERENCES pricing(id) ON DELETE CASCADE,
    min_quantity INTEGER NOT NULL CHECK (min_quantity > 0),
    max_quantity INTEGER CHECK (max_quantity IS NULL OR max_quantity >= min_quantity),
    unit_price DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
    margin_percentage DECIMAL(5,2) CHECK (margin_percentage >= 0 AND margin_percentage <= 100),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Alanlar**:
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUID | Birincil anahtar |
| pricing_id | UUID | Fiyatlandırma ID |
| min_quantity | INTEGER | Minimum miktar |
| max_quantity | INTEGER | Maximum miktar (NULL = sınırsız) |
| unit_price | DECIMAL(12,2) | Birim fiyat |
| margin_percentage | DECIMAL(5,2) | Kademe kâr marjı |
| created_at | TIMESTAMP | Oluşturulma tarihi |

**Örnek Veri**:
```sql
-- Deterjan için fiyat kademeleri
INSERT INTO pricing_tiers (pricing_id, min_quantity, max_quantity, unit_price, margin_percentage) VALUES
('pricing-uuid', 1, 10, 2.50, 25),
('pricing-uuid', 11, 50, 2.30, 20),
('pricing-uuid', 51, 100, 2.15, 15),
('pricing-uuid', 101, NULL, 2.00, 10);
```

**İndeksler**:
```sql
CREATE INDEX idx_pricing_tiers_pricing ON pricing_tiers(pricing_id);
CREATE INDEX idx_pricing_tiers_quantity ON pricing_tiers(min_quantity, max_quantity);
```

---

### 2.9 campaigns
Kampanya bilgileri.

```sql
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_uz VARCHAR(200) NOT NULL,
    title_ru VARCHAR(200),
    description_uz TEXT,
    description_ru TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(12,2) NOT NULL CHECK (discount_value > 0),
    min_quantity INTEGER CHECK (min_quantity IS NULL OR min_quantity > 0),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    CHECK (end_date > start_date)
);
```

**Alanlar**:
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUID | Birincil anahtar |
| title_uz | VARCHAR(200) | Özbekçe başlık |
| title_ru | VARCHAR(200) | Rusça başlık |
| description_uz | TEXT | Özbekçe açıklama |
| description_ru | TEXT | Rusça açıklama |
| discount_type | VARCHAR(20) | İndirim türü: percentage, fixed |
| discount_value | DECIMAL(12,2) | İndirim değeri |
| min_quantity | INTEGER | Minimum miktar |
| start_date | TIMESTAMP | Başlangıç tarihi |
| end_date | TIMESTAMP | Bitiş tarihi |
| is_active | BOOLEAN | Aktif mi? |
| created_at | TIMESTAMP | Oluşturulma tarihi |

**İndeksler**:
```sql
CREATE INDEX idx_campaigns_active ON campaigns(is_active);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
```

---

### 2.10 campaign_products
Kampanya-Ürün ilişkisi.

```sql
CREATE TABLE campaign_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    campaign_price DECIMAL(12,2) CHECK (campaign_price IS NULL OR campaign_price >= 0),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(campaign_id, product_id)
);
```

**İndeksler**:
```sql
CREATE INDEX idx_campaign_products_campaign ON campaign_products(campaign_id);
CREATE INDEX idx_campaign_products_product ON campaign_products(product_id);
```

---

### 2.11 favorites
Kullanıcı favorileri.

```sql
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);
```

**İndeksler**:
```sql
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_product ON favorites(product_id);
```

---

### 2.12 quote_carts
Teklif sepeti.

```sql
CREATE TABLE quote_carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(12,2) NOT NULL CHECK (total_price >= 0),
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**İndeksler**:
```sql
CREATE INDEX idx_cart_user ON quote_carts(user_id);
CREATE INDEX idx_cart_product ON quote_carts(product_id);
```

---

### 2.13 quotes
Teklifler.

```sql
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    total_amount DECIMAL(12,2) CHECK (total_amount >= 0),
    currency VARCHAR(3) DEFAULT 'USD' CHECK (currency IN ('USD', 'UZS')),
    customer_note TEXT,
    admin_note TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Teklif Numarası Formatı**: `QYYMMDD-XXXX`
- Örnek: `Q260713-0001`

**Durum Akışı**:
```
pending → processing → completed
                  ↘ rejected
```

**İndeksler**:
```sql
CREATE INDEX idx_quotes_user ON quotes(user_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created ON quotes(created_at);
CREATE INDEX idx_quotes_number ON quotes(quote_number);
```

---

### 2.14 quote_items
Teklif detayları.

```sql
CREATE TABLE quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(12,2) NOT NULL CHECK (total_price >= 0),
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**İndeksler**:
```sql
CREATE INDEX idx_quote_items_quote ON quote_items(quote_id);
CREATE INDEX idx_quote_items_product ON quote_items(product_id);
```

---

### 2.15 notifications
Bildirimler.

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('quote_status', 'price_change', 'campaign', 'stock', 'system')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Bildirim Tipleri**:
| Tip | Açıklama |
|-----|----------|
| quote_status | Teklif durumu değişikliği |
| price_change | Fiyat değişikliği |
| campaign | Yeni kampanya |
| stock | Stok durumu değişikliği |
| system | Sistem bildirimi |

**İndeksler**:
```sql
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
```

---

### 2.16 search_history
Arama geçmişi.

```sql
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    query VARCHAR(200) NOT NULL,
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**İndeksler**:
```sql
CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_search_history_query ON search_history(query);
```

---

### 2.17 settings
Sistem ayarları.

```sql
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Varsayılan Ayarlar**:
```sql
INSERT INTO settings (key, value, description) VALUES
('site_name', 'HORECA Portal', 'Website adı'),
('site_slogan', 'Powered by Kalsan', 'Website sloganı'),
('default_currency', 'USD', 'Varsayılan para birimi'),
('supported_currencies', '["USD", "UZS"]', 'Desteklenen para birimleri'),
('cart_expiry_days', '7', 'Sepet son kullanma süresi (gün)'),
('quote_expiry_days', '30', 'Teklif saklama süresi (gün)'),
('max_daily_quotes', '20', 'Günlük teklif limiti'),
('max_cart_items', '50', 'Tek teklifteki maksimum ürün sayısı'),
('telegram_bot_token', '', 'Telegram bot token'),
('telegram_chat_id', '', 'Telegram chat ID'),
('admin_telegram_ids', '[]', 'Admin Telegram ID\'leri');
```

**İndeksler**:
```sql
CREATE INDEX idx_settings_key ON settings(key);
```

---

## 3. İlişki Diyagramı (ERD)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │       │ categories  │       │   brands    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ telegram_id │       │ parent_id   │──────▶│ name        │
│ first_name  │       │ name_uz     │       │ slug        │
│ last_name   │       │ slug        │       │ logo_url    │
│ role        │       │ icon        │       └──────┬──────┘
└──────┬──────┘       └──────┬──────┘              │
       │                     │                     │
       │                     ▼                     │
       │              ┌─────────────┐              │
       │              │  products   │◀─────────────┘
       │              ├─────────────┤
       │              │ id (PK)     │
       │              │ category_id │
       │              │ brand_id    │
       │              │ sku         │
       │              │ name_uz     │
       │              └──────┬──────┘
       │                     │
       │    ┌────────────────┼────────────────┐
       │    │                │                │
       ▼    ▼                ▼                ▼
┌─────────────┐      ┌─────────────┐   ┌─────────────┐
│  favorites  │      │   pricing   │   │product_imgs │
├─────────────┤      ├─────────────┤   ├─────────────┤
│ id (PK)     │      │ id (PK)     │   │ id (PK)     │
│ user_id     │      │ product_id  │   │ product_id  │
│ product_id  │      │ cost_price  │   │ image_url   │
└─────────────┘      │ selling_price│  └─────────────┘
                     └──────┬──────┘
                            │
                            ▼
                     ┌─────────────┐
                     │pricing_tiers│
                     ├─────────────┤
                     │ id (PK)     │
                     │ pricing_id  │
                     │ min_quantity│
                     │ unit_price  │
                     └─────────────┘

┌─────────────┐       ┌─────────────┐
│   quotes    │       │ quote_carts │
├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │
│ user_id     │       │ user_id     │
│ quote_number│       │ product_id  │
│ status      │       │ quantity    │
│ total_amount│       │ unit_price  │
└──────┬──────┘       └─────────────┘
       │
       ▼
┌─────────────┐       ┌─────────────┐
│ quote_items │       │notifications│
├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │
│ quote_id    │       │ user_id     │
│ product_id  │       │ type        │
│ quantity    │       │ title       │
│ unit_price  │       │ message     │
└─────────────┘       └─────────────┘
```

---

## 4. Trigger'lar ve Fonksiyonlar

### 4.1 Updated_at Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tüm tablolara uygula
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_updated_at BEFORE UPDATE ON pricing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_carts_updated_at BEFORE UPDATE ON quote_carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4.2 Fiyat Hesaplama Fonksiyonu
```sql
CREATE OR REPLACE FUNCTION calculate_selling_price(
    p_cost_price DECIMAL,
    p_additional_costs DECIMAL,
    p_margin_percentage DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    RETURN (p_cost_price + p_additional_costs) * (1 + p_margin_percentage / 100);
END;
$$ LANGUAGE plpgsql;

-- Kullanım
SELECT calculate_selling_price(1.50, 0.10, 25); -- Sonuç: 2.00
```

### 4.3 Teklif Numarası Oluşturma
```sql
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS VARCHAR AS $$
DECLARE
    v_date VARCHAR;
    v_random VARCHAR;
    v_number VARCHAR;
BEGIN
    v_date := TO_CHAR(NOW(), 'YYMMDD');
    v_random := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    v_number := 'Q' || v_date || '-' || v_random;
    RETURN v_number;
END;
$$ LANGUAGE plpgsql;
```

---

## 5. Görünümler (Views)

### 5.1 Aktif Ürünler
```sql
CREATE VIEW v_active_products AS
SELECT 
    p.id,
    p.sku,
    p.name_uz,
    p.name_ru,
    p.unit,
    p.stock_status,
    c.name_uz AS category_name,
    c.slug AS category_slug,
    b.name AS brand_name,
    b.slug AS brand_slug,
    pr.selling_price,
    pr.currency,
    p.created_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN pricing pr ON p.id = pr.product_id AND pr.is_active = true
WHERE p.is_active = true;
```

### 5.2 Teklif Özeti
```sql
CREATE VIEW v_quote_summary AS
SELECT 
    q.id,
    q.quote_number,
    q.status,
    q.total_amount,
    q.currency,
    q.customer_note,
    q.admin_note,
    q.created_at,
    u.first_name,
    u.last_name,
    u.company,
    u.telegram_id,
    COUNT(qi.id) AS item_count
FROM quotes q
LEFT JOIN users u ON q.user_id = u.id
LEFT JOIN quote_items qi ON q.id = qi.quote_id
GROUP BY q.id, u.id;
```

### 5.3 Kullanıcı İstatistikleri
```sql
CREATE VIEW v_user_stats AS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.company,
    COUNT(DISTINCT q.id) AS total_quotes,
    COUNT(DISTINCT CASE WHEN q.status = 'completed' THEN q.id END) AS completed_quotes,
    SUM(CASE WHEN q.status = 'completed' THEN q.total_amount ELSE 0 END) AS total_spent,
    MAX(q.created_at) AS last_quote_date
FROM users u
LEFT JOIN quotes q ON u.id = q.user_id
GROUP BY u.id;
```

---

## 6. Veri Göç Stratejisi

### 6.1 Mevcut Verilerin İçe Aktarılması
```sql
-- CSV'den ürün yükleme
COPY products(sku, name_uz, name_ru, category_id, brand_id, unit)
FROM '/path/to/products.csv'
DELIMITER ','
CSV HEADER;

-- Toplu fiyatlandırma
INSERT INTO pricing (product_id, cost_price, currency, margin_percentage, selling_price)
SELECT 
    p.id,
    pc.cost_price,
    'USD',
    pc.margin,
    (pc.cost_price * (1 + pc.margin / 100))
FROM product_costs pc
JOIN products p ON pc.sku = p.sku;
```

### 6.2 Seed Verileri
```sql
-- Admin kullanıcı
INSERT INTO users (telegram_id, first_name, last_name, role)
VALUES (123456789, 'Admin', 'Kalsan', 'admin');

-- Kategoriler
INSERT INTO categories (name_uz, name_ru, slug, icon, sort_order) VALUES
('Kimyasal Mahsulotlar', 'Химические продукты', 'kimyasal', '🧴', 1),
('Kağıt Mahsulotlar', 'Бумажные продукты', 'qogoz', '📄', 2),
('Tekstil', 'Текстиль', 'tekstil', '🧵', 3),
('Asbob-uskunalar', 'Инструменты', 'asboblar', '🔧', 4);

-- Markalar
INSERT INTO brands (name, slug, description) VALUES
('Kalsan', 'kalsan', 'Asosiy brend');
```

---

## 7. Backup Stratejisi

### 7.1 Günlük Backup
```bash
#!/bin/bash
# daily_backup.sh

DATE=$(date +%Y%m%d)
BACKUP_DIR="/backups/postgres"
DB_NAME="horeca_portal"

# Tam backup
pg_dump -U horeca_admin -F c -f "$BACKUP_DIR/full_$DATE.dump" $DB_NAME

# Sadece schema
pg_dump -U horeca_admin -s -f "$BACKUP_DIR/schema_$DATE.sql" $DB_NAME

# 30 günden eski backup'ları sil
find $BACKUP_DIR -name "*.dump" -mtime +30 -delete
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
```

### 7.2 Geri Yükleme
```bash
# Tam geri yükleme
pg_restore -U horeca_admin -d horeca_portal /backups/postgres/full_20260713.dump

# Sadece schema
psql -U horeca_admin -d horeca_portal -f /backups/postgres/schema_20260713.sql
```

---

## 8. Performans İpuçları

### 8.1 Sorgu Optimizasyonu
```sql
-- EXPLAIN ANALYZE ile sorgu analizi
EXPLAIN ANALYZE SELECT * FROM products WHERE name_uz ILIKE '%deterjan%';

-- Büyük tablolar için partitioning
CREATE TABLE quotes_partitioned (
    LIKE quotes INCLUDING ALL
) PARTITION BY RANGE (created_at);

CREATE TABLE quotes_2026_01 PARTITION OF quotes_partitioned
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

### 8.2 Connection Pooling
```
# pgbouncer.conf
[pgbouncer]
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
```

---

## 9. Güvenlik

### 9.1 RLS (Row Level Security)
```sql
-- Kullanıcılar sadece kendi verilerini görebilir
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_favorites ON favorites
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::uuid);

ALTER TABLE quote_carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_carts ON quote_carts
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::uuid);
```

### 9.2 Şifreleme
```sql
-- Hassas alanlar için
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Örnek: Telefon numarası şifreleme
UPDATE users SET phone = pgp_sym_encrypt(phone, 'secret_key') WHERE id = 'uuid';
```

---

*Bu doküman HORECA Portal veritabanı tasarımını içermektedir.*
*Tarih: 2026-07-13*
*Versiyon: 1.0*