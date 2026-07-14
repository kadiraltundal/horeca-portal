-- ============================================
-- HORECA Portal - Performance Indexes Migration
-- Version: 4.0
-- Date: 2026-07-13
-- ============================================

-- Ek indeksler performans için

-- Users - Arama ve filtreleme
CREATE INDEX IF NOT EXISTS idx_users_first_name ON users(first_name);
CREATE INDEX IF NOT EXISTS idx_users_last_name ON users(last_name);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Products - Gelişmiş arama
CREATE INDEX IF NOT EXISTS idx_products_name_uz_trgm ON products USING gin(name_uz gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_name_ru_trgm ON products USING gin(name_ru gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_description_uz ON products USING gin(description_uz gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_min_quantity ON products(min_quantity);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Pricing - Kademeli fiyat arama
CREATE INDEX IF NOT EXISTS idx_pricing_selling_price ON pricing(selling_price);
CREATE INDEX IF NOT EXISTS idx_pricing_cost_price ON pricing(cost_price);
CREATE INDEX IF NOT EXISTS idx_pricing_currency ON pricing(currency);

-- Quotes - Durum ve tarih bazlı arama
CREATE INDEX IF NOT EXISTS idx_quotes_created_at_status ON quotes(created_at, status);
CREATE INDEX IF NOT EXISTS idx_quotes_total_amount ON quotes(total_amount);

-- Orders - Gelişmiş raporlama
CREATE INDEX IF NOT EXISTS idx_orders_created_at_status ON orders(created_at, status);
CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON orders(total_amount);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);

-- Order Items - Ürün bazlı analiz
CREATE INDEX IF NOT EXISTS idx_order_items_product_quantity ON order_items(product_id, quantity);
CREATE INDEX IF NOT EXISTS idx_order_items_total_price ON order_items(total_price);

-- Payments - Ödeme analizi
CREATE INDEX IF NOT EXISTS idx_payments_amount ON payments(amount);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at);
CREATE INDEX IF NOT EXISTS idx_payments_status_method ON payments(status, method);

-- Notifications - Hızlı bildirim erişimi
CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON notifications(user_id, type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Favorites - Popüler ürünler
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at);

-- Search History - Popüler aramalar
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at);
CREATE INDEX IF NOT EXISTS idx_search_history_query_count ON search_history(query);

-- Campaigns - Aktif kampanyalar
CREATE INDEX IF NOT EXISTS idx_campaigns_start_end_date ON campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_discount_type ON campaigns(discount_type);

-- Vendors - Satıcı arama
CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(name);
CREATE INDEX IF NOT EXISTS idx_vendors_created_at ON vendors(created_at);
CREATE INDEX IF NOT EXISTS idx_vendors_rating ON vendors(rating);
CREATE INDEX IF NOT EXISTS idx_vendors_total_sales ON vendors(total_sales);

-- Vendor Products - Fiyat bazlı arama
CREATE INDEX IF NOT EXISTS idx_vendor_products_price ON vendor_products(vendor_price);
CREATE INDEX IF NOT EXISTS idx_vendor_products_stock ON vendor_products(stock_quantity);

-- ============================================
-- OPTIMIZE TABLO BOYUTU KONTROLÜ
-- ============================================

-- Büyük tablolar için istatistik güncelleme
ANALYZE users;
ANALYZE products;
ANALYZE orders;
ANALYZE quotes;
ANALYZE payments;
ANALYZE notifications;

-- ============================================
-- MIGRATION TAMAMLANDI
-- ============================================