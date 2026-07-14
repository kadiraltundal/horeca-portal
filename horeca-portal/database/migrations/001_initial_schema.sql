-- ============================================
-- HORECA Portal - Initial Schema Migration
-- Version: 1.0
-- Date: 2026-07-13
-- ============================================

-- Gerekli eklentiler
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- USERS
-- ============================================
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

CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- ============================================
-- CATEGORIES (Hierarchical)
-- ============================================
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

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);

-- ============================================
-- BRANDS
-- ============================================
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_active ON brands(is_active);

-- ============================================
-- PRODUCTS
-- ============================================
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

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_stock ON products(stock_status);
CREATE INDEX idx_products_name_uz_gin ON products USING gin(name_uz gin_trgm_ops);
CREATE INDEX idx_products_name_ru_gin ON products USING gin(name_ru gin_trgm_ops);

-- ============================================
-- PRODUCT IMAGES
-- ============================================
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(200),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(is_primary);

-- ============================================
-- PRODUCT ATTRIBUTES
-- ============================================
CREATE TABLE product_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_value VARCHAR(300) NOT NULL,
    sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_product_attributes_product ON product_attributes(product_id);

-- ============================================
-- PRICING
-- ============================================
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

CREATE INDEX idx_pricing_product ON pricing(product_id);
CREATE INDEX idx_pricing_active ON pricing(is_active);
CREATE INDEX idx_pricing_valid ON pricing(valid_from, valid_until);

-- ============================================
-- PRICING TIERS
-- ============================================
CREATE TABLE pricing_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pricing_id UUID REFERENCES pricing(id) ON DELETE CASCADE,
    min_quantity INTEGER NOT NULL CHECK (min_quantity > 0),
    max_quantity INTEGER CHECK (max_quantity IS NULL OR max_quantity >= min_quantity),
    unit_price DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
    margin_percentage DECIMAL(5,2) CHECK (margin_percentage >= 0 AND margin_percentage <= 100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pricing_tiers_pricing ON pricing_tiers(pricing_id);
CREATE INDEX idx_pricing_tiers_quantity ON pricing_tiers(min_quantity, max_quantity);

-- ============================================
-- CAMPAIGNS
-- ============================================
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

CREATE INDEX idx_campaigns_active ON campaigns(is_active);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);

-- ============================================
-- CAMPAIGN PRODUCTS
-- ============================================
CREATE TABLE campaign_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    campaign_price DECIMAL(12,2) CHECK (campaign_price IS NULL OR campaign_price >= 0),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(campaign_id, product_id)
);

CREATE INDEX idx_campaign_products_campaign ON campaign_products(campaign_id);
CREATE INDEX idx_campaign_products_product ON campaign_products(product_id);

-- ============================================
-- FAVORITES
-- ============================================
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_product ON favorites(product_id);

-- ============================================
-- QUOTE CARTS
-- ============================================
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

CREATE INDEX idx_cart_user ON quote_carts(user_id);
CREATE INDEX idx_cart_product ON quote_carts(product_id);

-- ============================================
-- QUOTES
-- ============================================
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

CREATE INDEX idx_quotes_user ON quotes(user_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created ON quotes(created_at);
CREATE INDEX idx_quotes_number ON quotes(quote_number);

-- ============================================
-- QUOTE ITEMS
-- ============================================
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

CREATE INDEX idx_quote_items_quote ON quote_items(quote_id);
CREATE INDEX idx_quote_items_product ON quote_items(product_id);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('quote_status', 'price_change', 'campaign', 'stock', 'system')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ============================================
-- SEARCH HISTORY
-- ============================================
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    query VARCHAR(200) NOT NULL,
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_search_history_query ON search_history(query);

-- ============================================
-- SETTINGS
-- ============================================
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_settings_key ON settings(key);

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated_at trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ları uygula
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

-- ============================================
-- VARSAYILAN VERİLER
-- ============================================

-- Ayarlar
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
('admin_telegram_ids', '[]', 'Admin Telegram ID''leri');

-- Kategoriler
INSERT INTO categories (name_uz, name_ru, slug, icon, sort_order) VALUES
('Kimyasal Mahsulotlar', 'Химические продукты', 'kimyasal', '🧴', 1),
('Kağıt Mahsulotlar', 'Бумажные продукты', 'qogoz', '📄', 2),
('Tekstil', 'Текстиль', 'tekstil', '🧵', 3),
('Asbob-uskunalar', 'Инструменты', 'asboblar', '🔧', 4);

-- Alt kategoriler
INSERT INTO categories (parent_id, name_uz, name_ru, slug, icon, sort_order)
SELECT 
    c.id,
    sub.name_uz,
    sub.name_ru,
    sub.slug,
    sub.icon,
    sub.sort_order
FROM categories c
CROSS JOIN (VALUES
    ('kimyasal', 'Bulaşık Deterjanı', 'Мыло для посуды', 'bulasik-deterjani', '🍽️', 1),
    ('kimyasal', 'Yüzey Temizleyici', 'Средство для уборки', 'yuzey-temizleyici', '🧹', 2),
    ('kimyasal', 'Dezenfektan', 'Дезинфикатор', 'dezenfektan', '💉', 3),
    ('qogoz', 'Peçete', 'Салфетки', 'pecete', '🧻', 1),
    ('qogoz', 'Tuvalet Kağıdı', 'Туалетная бумага', 'tuvalet-kagidi', '🧻', 2),
    ('qogoz', 'Havlu', 'Полотенца', 'havlu', '🧖', 3),
    ('tekstil', 'Nevresim', 'Постельное белье', 'nevresim', '🛏️', 1),
    ('tekstil', 'Perde', 'Шторы', 'perde', '🪟', 2)
) AS sub(parent_slug, name_uz, name_ru, slug, icon, sort_order)
WHERE c.slug = sub.parent_slug;

-- Markalar
INSERT INTO brands (name, slug, description) VALUES
('Kalsan', 'kalsan', 'Asosiy brend - yuqori sifatli mahsulotlar');

-- Örnek ürünler
INSERT INTO products (category_id, brand_id, sku, name_uz, name_ru, description_uz, unit, min_quantity)
SELECT 
    c.id,
    b.id,
    p.sku,
    p.name_uz,
    p.name_ru,
    p.description_uz,
    p.unit,
    p.min_quantity
FROM brands b
CROSS JOIN categories c
CROSS JOIN (VALUES
    ('bulasik-deterjani', 'DET-001', 'Premium Deterjan', 'Премиум Детергент', 'Yuqori sifatli deterjan', 'piece', 1),
    ('bulasik-deterjani', 'DET-002', 'Ekonom Deterjan', 'Эконом Детергент', 'Iqtisodiy deterjan', 'piece', 1),
    ('yuzey-temizleyici', 'TEM-001', 'Universal Temizleyici', 'Универсальный Чистильщик', 'Barcha yuzalar uchun', 'liter', 1),
    ('dezenfektan', 'DEZ-001', 'Medikal Dezenfektan', 'Медицинский Дезинфектор', 'Tibbiy dezinfeksiya', 'liter', 1),
    ('pecete', 'PEC-001', 'Qogoz Peçete', 'Бумажные Салфетки', '100% qogoz', 'box', 1),
    ('havlu', 'HAV-001', 'Qo''l Havlisi', 'Полотенце для рук', 'Yumshoq qo''l havlisi', 'piece', 1),
    ('nevresim', 'NEV-001', 'Kral o''lchamli nevresim', 'Кровать King Size', 'Premium paxta', 'set', 1)
) AS p(category_slug, sku, name_uz, name_ru, description_uz, unit, min_quantity)
WHERE c.slug = p.category_slug;

-- Fiyatlandırma
INSERT INTO pricing (product_id, cost_price, currency, additional_costs, margin_percentage, selling_price)
SELECT 
    p.id,
    pr.cost_price,
    'USD',
    pr.additional_costs,
    pr.margin,
    (pr.cost_price + pr.additional_costs) * (1 + pr.margin / 100)
FROM products p
CROSS JOIN (VALUES
    ('DET-001', 1.50, 0.10, 25),
    ('DET-002', 1.00, 0.10, 20),
    ('TEM-001', 2.00, 0.20, 30),
    ('DEZ-001', 3.00, 0.30, 35),
    ('PEC-001', 0.80, 0.05, 25),
    ('HAV-001', 1.20, 0.10, 30),
    ('NEV-001', 15.00, 1.00, 40)
) AS pr(sku, cost_price, additional_costs, margin)
WHERE p.sku = pr.sku;

-- Fiyat kademeleri
INSERT INTO pricing_tiers (pricing_id, min_quantity, max_quantity, unit_price, margin_percentage)
SELECT 
    pr.id,
    tier.min_qty,
    tier.max_qty,
    tier.unit_price,
    tier.margin
FROM pricing pr
JOIN products p ON pr.product_id = p.id
CROSS JOIN (VALUES
    ('DET-001', 1, 10, 2.50, 25),
    ('DET-001', 11, 50, 2.30, 20),
    ('DET-001', 51, 100, 2.15, 15),
    ('DET-001', 101, NULL, 2.00, 10),
    ('TEM-001', 1, 10, 3.50, 30),
    ('TEM-001', 11, 50, 3.20, 25),
    ('TEM-001', 51, NULL, 2.90, 20)
) AS tier(sku, min_qty, max_qty, unit_price, margin)
WHERE p.sku = tier.sku;

-- ============================================
-- TAMAMLANDI
-- ============================================
-- Migration başarıyla tamamlandı!