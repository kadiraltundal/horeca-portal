-- ============================================
-- HORECA Portal - Permissions Migration
-- Version: 7.0
-- Date: 2026-07-14
-- ============================================

-- Roles tablosu
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Permissions tablosu
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(resource, action)
);

-- Role-Permission iliskisi
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- User-Permission iliskisi (ek izinler icin)
CREATE TABLE IF NOT EXISTS user_permissions (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, permission_id)
);

-- Roller ekle
INSERT INTO roles (name, description) VALUES
    ('admin', 'Yonetici - Tum yetkilere sahip'),
    ('manager', 'Yonetici - Kisitli yetkiler'),
    ('vendor', 'Satici - Urun yonetimi'),
    ('supplier', 'Tedarikci - Urun ekleme'),
    ('customer', 'Musteri - Temel islemler')
ON CONFLICT (name) DO NOTHING;

-- Izinleri ekle
INSERT INTO permissions (name, resource, action, description) VALUES
    -- Products
    ('products:create', 'products', 'create', 'Urun olusturma'),
    ('products:read', 'products', 'read', 'Urun goruntuleme'),
    ('products:update', 'products', 'update', 'Urun guncelleme'),
    ('products:delete', 'products', 'delete', 'Urun silme'),
    -- Categories
    ('categories:create', 'categories', 'create', 'Kategori olusturma'),
    ('categories:read', 'categories', 'read', 'Kategori goruntuleme'),
    ('categories:update', 'categories', 'update', 'Kategori guncelleme'),
    ('categories:delete', 'categories', 'delete', 'Kategori silme'),
    -- Brands
    ('brands:create', 'brands', 'create', 'Marka olusturma'),
    ('brands:read', 'brands', 'read', 'Marka goruntuleme'),
    ('brands:update', 'brands', 'update', 'Marka guncelleme'),
    ('brands:delete', 'brands', 'delete', 'Marka silme'),
    -- Orders
    ('orders:create', 'orders', 'create', 'Siparis olusturma'),
    ('orders:read', 'orders', 'read', 'Siparis goruntuleme'),
    ('orders:update', 'orders', 'update', 'Siparis guncelleme'),
    ('orders:delete', 'orders', 'delete', 'Siparis silme'),
    -- Payments
    ('payments:create', 'payments', 'create', 'Odeme olusturma'),
    ('payments:read', 'payments', 'read', 'Odeme goruntuleme'),
    ('payments:update', 'payments', 'update', 'Odeme guncelleme'),
    -- Quotes
    ('quotes:create', 'quotes', 'create', 'Teklif olusturma'),
    ('quotes:read', 'quotes', 'read', 'Teklif goruntuleme'),
    ('quotes:update', 'quotes', 'update', 'Teklif guncelleme'),
    ('quotes:delete', 'quotes', 'delete', 'Teklif silme'),
    -- Vendors
    ('vendors:create', 'vendors', 'create', 'Satici olusturma'),
    ('vendors:read', 'vendors', 'read', 'Satici goruntuleme'),
    ('vendors:update', 'vendors', 'update', 'Satici guncelleme'),
    ('vendors:delete', 'vendors', 'delete', 'Satici silme'),
    ('vendors:approve', 'vendors', 'approve', 'Satici onaylama'),
    -- Campaigns
    ('campaigns:create', 'campaigns', 'create', 'Kampanya olusturma'),
    ('campaigns:read', 'campaigns', 'read', 'Kampanya goruntuleme'),
    ('campaigns:update', 'campaigns', 'update', 'Kampanya guncelleme'),
    ('campaigns:delete', 'campaigns', 'delete', 'Kampanya silme'),
    -- Users
    ('users:read', 'users', 'read', 'Kullanici goruntuleme'),
    ('users:update', 'users', 'update', 'Kullanici guncelleme'),
    ('users:delete', 'users', 'delete', 'Kullanici silme'),
    -- Reports
    ('reports:read', 'reports', 'read', 'Rapor goruntuleme'),
    -- Notifications
    ('notifications:read', 'notifications', 'read', 'Bildirim goruntuleme'),
    ('notifications:send', 'notifications', 'send', 'Bildirim gonderme'),
    -- Settings
    ('settings:read', 'settings', 'read', 'Ayar goruntuleme'),
    ('settings:update', 'settings', 'update', 'Ayar guncelleme'),
    -- Favorites
    ('favorites:read', 'favorites', 'read', 'Favori goruntuleme'),
    ('favorites:create', 'favorites', 'create', 'Favori ekleme'),
    ('favorites:delete', 'favorites', 'delete', 'Favori silme'),
    -- Search
    ('search:read', 'search', 'read', 'Arama yapma'),
    -- Import
    ('import:create', 'import', 'create', 'Import yapma'),
    ('import:read', 'import', 'read', 'Import goruntuleme'),
    -- Recommendations
    ('recommendations:read', 'recommendations', 'read', 'Oneri goruntuleme')
ON CONFLICT (name) DO NOTHING;

-- Rollere izinleri ata
-- Admin: tum izinler
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Manager: cogu izin (silmeler hariç)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'manager'
  AND p.action != 'delete'
ON CONFLICT DO NOTHING;

-- Vendor: urun ve siparis izinleri
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'vendor'
  AND p.resource IN ('products', 'orders', 'quotes', 'campaigns', 'notifications', 'recommendations')
  AND p.action IN ('create', 'read', 'update')
ON CONFLICT DO NOTHING;

-- Supplier: urun okuma ve olusturma
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'supplier'
  AND p.resource IN ('products', 'orders', 'quotes', 'notifications', 'recommendations')
  AND p.action IN ('create', 'read', 'update')
ON CONFLICT DO NOTHING;

-- Customer: temel izinler
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'customer'
  AND (
    (p.resource IN ('products', 'categories', 'brands', 'campaigns', 'notifications', 'recommendations') AND p.action = 'read')
    OR (p.resource IN ('orders', 'payments', 'quotes') AND p.action IN ('create', 'read'))
    OR (p.resource = 'favorites' AND p.action IN ('read', 'create', 'delete'))
    OR (p.resource = 'settings' AND p.action IN ('read', 'update'))
    OR (p.resource = 'search' AND p.action = 'read')
  )
ON CONFLICT DO NOTHING;

-- Indeksler
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_permissions_name ON permissions(name);
CREATE INDEX idx_permissions_resource ON permissions(resource);
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX idx_user_permissions_user ON user_permissions(user_id);

-- ============================================
-- MIGRATION TAMAMLANDI
-- ============================================
