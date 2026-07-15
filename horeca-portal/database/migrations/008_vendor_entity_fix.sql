-- ============================================
-- HORECA Portal - Vendor Entity Fix Migration
-- Version: 8.0
-- Date: 2026-07-14
-- ============================================

-- Vendor tablosunu guncelle (entity ile esles)
DO $$ 
BEGIN
    -- slug kolonu ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'slug') THEN
        ALTER TABLE vendors ADD COLUMN slug VARCHAR(200);
        -- Mevcut kayitlar icin slug olustur
        UPDATE vendors SET slug = LOWER(REPLACE(name, ' ', '-')) || '-' || SUBSTRING(id::text, 1, 8);
        ALTER TABLE vendors ALTER COLUMN slug SET NOT NULL;
        ALTER TABLE vendors ADD CONSTRAINT vendors_slug_unique UNIQUE (slug);
    END IF;

    -- banner_url kolonu ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'banner_url') THEN
        ALTER TABLE vendors ADD COLUMN banner_url VARCHAR(500);
    END IF;

    -- city kolonu ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'city') THEN
        ALTER TABLE vendors ADD COLUMN city VARCHAR(100);
    END IF;

    -- country kolonu ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'country') THEN
        ALTER TABLE vendors ADD COLUMN country VARCHAR(100);
    END IF;

    -- commission_rate kolonu ekle (commission yerine)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'commission_rate') THEN
        ALTER TABLE vendors ADD COLUMN commission_rate DECIMAL(5,2) DEFAULT 0;
        -- Eski commission verisini tasi
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'commission') THEN
            UPDATE vendors SET commission_rate = commission;
            ALTER TABLE vendors DROP COLUMN commission;
        END IF;
    END IF;

    -- tax_number kolonu ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'tax_number') THEN
        ALTER TABLE vendors ADD COLUMN tax_number VARCHAR(50);
    END IF;

    -- bank_account kolonu ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'bank_account') THEN
        ALTER TABLE vendors ADD COLUMN bank_account TEXT;
    END IF;

    -- is_verified kolonu ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'is_verified') THEN
        ALTER TABLE vendors ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;

    -- is_active kolonu ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'is_active') THEN
        ALTER TABLE vendors ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    -- total_sales kolonu ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'total_sales') THEN
        ALTER TABLE vendors ADD COLUMN total_sales INTEGER DEFAULT 0;
    END IF;

    -- total_revenue kolonu ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'total_revenue') THEN
        ALTER TABLE vendors ADD COLUMN total_revenue DECIMAL(12,2) DEFAULT 0;
    END IF;

    -- approved_at, suspended_at, suspend_reason kolonlarini temizle (entity'de yok)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'approved_at') THEN
        ALTER TABLE vendors DROP COLUMN approved_at;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'suspended_at') THEN
        ALTER TABLE vendors DROP COLUMN suspended_at;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'suspend_reason') THEN
        ALTER TABLE vendors DROP COLUMN suspend_reason;
    END IF;

    -- Vendor Products tablosunu guncelle
    -- vendor_price kolonu (custom_price yerine)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_products' AND column_name = 'vendor_price') THEN
        ALTER TABLE vendor_products ADD COLUMN vendor_price DECIMAL(12,2) NOT NULL DEFAULT 0;
        -- Eski custom_price verisini tasi
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_products' AND column_name = 'custom_price') THEN
            UPDATE vendor_products SET vendor_price = custom_price;
            ALTER TABLE vendor_products DROP COLUMN custom_price;
        END IF;
    END IF;

    -- vendor_sku kolonu ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_products' AND column_name = 'vendor_sku') THEN
        ALTER TABLE vendor_products ADD COLUMN vendor_sku VARCHAR(100);
    END IF;

    -- stock_quantity kolonu (stock yerine)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_products' AND column_name = 'stock_quantity') THEN
        ALTER TABLE vendor_products ADD COLUMN stock_quantity INTEGER DEFAULT 0;
        -- Eski stock verisini tasi
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_products' AND column_name = 'stock') THEN
            UPDATE vendor_products SET stock_quantity = stock;
            ALTER TABLE vendor_products DROP COLUMN stock;
        END IF;
    END IF;

    -- status kolonu (active yerine)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_products' AND column_name = 'status') THEN
        ALTER TABLE vendor_products ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
    END IF;

    -- is_active kolonu ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_products' AND column_name = 'is_active') THEN
        ALTER TABLE vendor_products ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

END $$;

-- Indeksler
CREATE INDEX IF NOT EXISTS idx_vendors_slug ON vendors(slug);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_active ON vendors(is_active);
CREATE INDEX IF NOT EXISTS idx_vendor_products_status ON vendor_products(status);

-- ============================================
-- MIGRATION TAMAMLANDI
-- ============================================
