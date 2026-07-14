-- ============================================
-- HORECA Portal - Rollback Migration
-- Version: 1.0
-- Date: 2026-07-13
-- ============================================
-- UYARI: Bu script tüm verileri silecektir!
-- Sadece gerekli durumlarda kullanın.

-- Trigger'ları kaldır
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_pricing_updated_at ON pricing;
DROP TRIGGER IF EXISTS update_quote_carts_updated_at ON quote_carts;
DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;

-- Fonksiyonları kaldır
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Tabloları sil (ilişki sırasına göre)
DROP TABLE IF EXISTS search_history CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS quote_items CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS quote_carts CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS campaign_products CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS pricing_tiers CASCADE;
DROP TABLE IF EXISTS pricing CASCADE;
DROP TABLE IF EXISTS product_attributes CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Eklentileri kaldır (opsiyonel)
-- DROP EXTENSION IF EXISTS "pg_trgm";
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- ============================================
-- ROLLBACK TAMAMLANDI
-- ============================================