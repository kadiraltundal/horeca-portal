# Database Quick Reference

## HORECA Portal - Hızlı Başvuru

---

## Tablolar

| Tablo | Açıklama | Anahtar İlişkiler |
|-------|----------|-------------------|
| users | Kullanıcılar | telegram_id (benzersiz) |
| categories | Kategoriler | parent_id (self-ref) |
| brands | Markalar | - |
| products | Ürünler | category_id, brand_id |
| product_images | Ürün görselleri | product_id |
| product_attributes | Ürün özellikleri | product_id |
| pricing | Fiyatlandırma | product_id |
| pricing_tiers | Fiyat kademeleri | pricing_id |
| campaigns | Kampanyalar | - |
| campaign_products | Kampanya-Ürün | campaign_id, product_id |
| favorites | Favoriler | user_id, product_id |
| quote_carts | Sepet | user_id, product_id |
| quotes | Teklifler | user_id |
| quote_items | Teklif detayları | quote_id, product_id |
| notifications | Bildirimler | user_id |
| search_history | Arama geçmişi | user_id |
| settings | Sistem ayarları | key (benzersiz) |

---

## Yaygın Sorgular

### Ürün Ara
```sql
SELECT * FROM products 
WHERE name_uz ILIKE '%deterjan%' 
AND is_active = true;
```

### Kategorili Ürünler
```sql
SELECT p.*, c.name_uz as category_name
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.slug = 'kimyasal'
AND p.is_active = true;
```

### Ürün Fiyatı (Kademeli)
```sql
SELECT 
    p.name_uz,
    pr.selling_price,
    pt.min_quantity,
    pt.max_quantity,
    pt.unit_price
FROM products p
JOIN pricing pr ON p.id = pr.product_id
LEFT JOIN pricing_tiers pt ON pr.id = pt.pricing_id
WHERE p.sku = 'DET-001'
AND pr.is_active = true
ORDER BY pt.min_quantity;
```

### Kullanıcı Sepeti
```sql
SELECT 
    qc.*,
    p.name_uz,
    p.sku
FROM quote_carts qc
JOIN products p ON qc.product_id = p.id
WHERE qc.user_id = 'user-uuid'
ORDER BY qc.created_at DESC;
```

### Teklif Detayı
```sql
SELECT 
    q.*,
    json_agg(json_build_object(
        'product_name', p.name_uz,
        'quantity', qi.quantity,
        'unit_price', qi.unit_price,
        'total_price', qi.total_price
    )) as items
FROM quotes q
JOIN quote_items qi ON q.id = qi.quote_id
JOIN products p ON qi.product_id = p.id
WHERE q.id = 'quote-uuid'
GROUP BY q.id;
```

### Bildirimler (Okunmamış)
```sql
SELECT * FROM notifications
WHERE user_id = 'user-uuid'
AND is_read = false
ORDER BY created_at DESC;
```

### Aktif Kampanyalar
```sql
SELECT c.*, 
    json_agg(p.name_uz) as product_names
FROM campaigns c
JOIN campaign_products cp ON c.id = cp.campaign_id
JOIN products p ON cp.product_id = p.id
WHERE c.is_active = true
AND NOW() BETWEEN c.start_date AND c.end_date
GROUP BY c.id;
```

---

## Performans İpuçları

### İndeks Kullanımı
```sql
-- İndeksleri kontrol et
SELECT * FROM pg_indexes 
WHERE tablename = 'products';

-- Sorgu planını analiz et
EXPLAIN ANALYZE 
SELECT * FROM products 
WHERE name_uz ILIKE '%deterjan%';
```

### Bağlantı Havuzu
```
Maksimum bağlantı: 100
Havuz boyutu: 20
Bekleme süresi: 30s
```

---

## Backup Komutları

### Tam Backup
```bash
pg_dump -U horeca_admin -F c -f backup.dump horeca_portal
```

### Sadece Schema
```bash
pg_dump -U horeca_admin -s -f schema.sql horeca_portal
```

### Geri Yükleme
```bash
pg_restore -U horeca_admin -d horeca_portal backup.dump
```

---

## Yaygın Hatalar ve Çözümleri

| Hata | Sebep | Çözüm |
|------|-------|-------|
| relation does not exist | Tablo oluşturulmamış | Migration'ı çalıştır |
| duplicate key | Benzersiz alan çakışması | Veriyi kontrol et |
| foreign key violation | İlişkili kayıt yok | Önce alt tabloyu oluştur |
| connection refused | PostgreSQL çalışmıyor | Servisi başlat |

---

*Bu belge hızlı başvuru içindir.*
*Tarih: 2026-07-13*