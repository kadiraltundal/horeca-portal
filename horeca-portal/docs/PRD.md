# Product Requirements Document (PRD)

## HORECA Portal - Faz 1

**Versiyon**: 1.0
**Tarih**: 2026-07-13
**Durum**: Taslak

---

## 1. Genel Bakış

### 1.1 Ürün Tanımı
HORECA Portal, Özbekistan HORECA sektörü için tasarlanmış bir Telegram Mini App platformudur. Platform, Kalsan'ın satış süreçlerini hızlandırmak ve satın alma süreçlerini dijitalleştirmek amacıyla geliştirilmektedir.

### 1.2 Ürün Vizyonu
Satın almacının ihtiyacı olan ürünleri hızlıca bulmasını ve Kalsan'a teklif göndermesini sağlayan profesyonel bir dijital platform olmak.

### 1.3 Hedef Kitle
| Segment | Temel İhtiyaç | Öncelik |
|---------|---------------|---------|
| Oteller | Toplu alım, kalite güvencesi | Yüksek |
| Restoranlar | Hızlı tedarik, alternatif ürün | Yüksek |
| Cafeler | Düzenli sipariş, kampanya takibi | Orta |
| Hastaneler | Güvenilir tedarik, sertifika | Orta |
| Endüstriyel Mutfak | Proje bazlı teklif, büyük miktar | Orta |

### 1.4 Başarı Metrikleri
| Metrik | Hedef | Ölçüm Yöntemi |
|--------|-------|---------------|
| Kullanıcı başına aylık aktif kullanım | %60+ | Analytics |
| Teklif oluşturma süresi | < 3 dakika | User tracking |
| Teklif yanıt oranı | %80+ | Admin dashboard |
| Platforma dönüş sıklığı | Haftada 2+ kez | Analytics |
| Kullanıcı memnuniyeti | 4.5/5 | Anket |

---

## 2. Kullanıcı Rollerini

### 2.1 Müşteri (Customer)
- Ürünleri görüntüleyebilir
- Arama ve filtreleme yapabilir
- Sepete ürün ekleyebilir
- Teklif gönderebilir
- Teklif geçmişini görüntüleyebilir
- Favorilerini yönetebilir
- Bildirimleri görüntüleyebilir

### 2.2 Admin (Kalsan Ekibi)
- Tüm müşteri işlemlerini yapabilir
- Ürünleri yönetebilir (CRUD)
- Kategorileri yönetebilir
- Markaları yönetebilir
- Kampanyaları yönetebilir
- Teklifleri yönetebilir ve güncelleyebilir
- Kullanıcıları görüntüleyebilir
- Raporları görüntüleyebilir
- Fiyatlandırma yapabilir

---

## 3. Modül Detayları

### 3.1 Telegram Login
**Amaç**: Kullanıcının Telegram hesabıyla güvenli giriş yapması

**Gereksinimler**:
- Telegram WebApp initData HMAC-SHA256 ile doğrulanmalıdır
- İlk girişte otomatik hesap oluşturulmalıdır
- JWT token ile oturum yönetimi yapılmalıdır
- Refresh token ile token yenileme desteği olmalıdır

**Akış**:
1. Kullanıcı Telegram'da botu bulur
2. /start komutuyla botu başlatır
3. Mini App butonuna tıklar
4. Sistem Telegram initData'yı doğrular
5. Kullanıcı profili oluşturulur/güncellenir
6. Ana sayfaya yönlendirilir

**Teknik Detaylar**:
- Token süresi: 15 dakika (access), 7 gün (refresh)
- Saklama: HttpOnly cookie
- Doğrulama: HMAC-SHA256

### 3.2 Ürün Kataloğu
**Amaç**: Kalsan ürünlerinin dijital kataloğu

**Gereksinimler**:
- Ürün listesi sayfalama destekli olmalıdır
- Ürün detayında tüm bilgiler görüntülenmelidir
- Çoklu dil desteği olmalıdır (Özbekçe, Rusça)
- Ürün görselleri desteklenmelidir
- Stok durumu gösterilmelidir

**Ürün Bilgileri**:
- SKU kodu
- Ürün adı (Özbekçe, Rusça)
- Açıklama (Özbekçe, Rusça)
- Birim (adet, kg, litre, kutu, set)
- Minimum sipariş miktarı
- Stok durumu
- Kategori ve marka ilişkisi
- Fiyat bilgisi (kademeli)
- Görseller
- Teknik özellikler

**Arama ve Filtreleme**:
- Tam metin arama (ürün adı, SKU)
- Kategori bazlı filtreleme
- Marka bazlı filtreleme
- Fiyat aralığı filtresi (gelecek faz)
- Sıralama (fiyat, tarih, popülerlik)

### 3.3 Kategoriler
**Amaç**: Ürünlerin hiyerarşik organize edilmesi

**Gereksinimler**:
- Maksimum 2 seviye hiyerarşi
- Kategori ikonları desteklenmelidir
- Alt kategorilerde产品 listelenmelidir
- Sıralama admin tarafından ayarlanabilmelidir

**Örnek Yapı**:
```
Kimyasal Ürünler
├── Bulaşık Deterjanı
├── Yüzey Temizleyici
└── Dezenfektan

Kağıt Ürünler
├── Peçete
├── Tuvalet Kağıdı
└── Havlu

Tekstil
├── Nevresim
├── Havlu
└── Perde

Asbob-uskunalar
├── Mutfak Ekipmanları
└── Temizlik Ekipmanları
```

### 3.4 Marka Yönetimi
**Amaç**: Ürün markalarının yönetilmesi

**Gereksinimler**:
- Marka logoları desteklenmelidir
- Marka açıklaması olmalıdır
- Marka bazlı filtreleme yapılmalıdır
- Marka sayfasında tüm ürünler görüntülenmelidir

### 3.5 Dinamik Fiyatlandırma
**Amaç**: Kademeli ve esnek fiyatlandırma sistemi

**Gereksinimler**:
- Her ürün için bağımsız fiyatlandırma
- Alış maliyeti + ek maliyetler + kâr marjı = satış fiyatı
- Miktar kademeleri tanımlanabilmelidir
- Para birimi desteği (USD, UZS)
- Geçerlilik tarihi tanımlanabilmelidir

**Fiyat Hesaplama Formülü**:
```
Satış Fiyatı = (Alış Maliyeti + Ek Maliyetler) × (1 + Kâr Marjı / 100)
```

**Kademe Örneği**:
| Miktar Aralığı | Birim Fiyat | Kâr Marjı |
|-----------------|-------------|-----------|
| 1 - 10 | $2.50 | %25 |
| 11 - 50 | $2.30 | %20 |
| 51 - 100 | $2.15 | %15 |
| 101+ | $2.00 | %10 |

**Admin Girişi**:
- Alış maliyeti (zorunlu)
- Para birimi (varsayılan: USD)
- Ek maliyetler (opsiyonel)
- Kâr marjı yüzdesi (zorunlu)
- Fiyat kademeleri (opsiyonel)

### 3.6 Teklif Sepeti
**Amaç**: Birden fazla ürünü tek teklifte toplama

**Gereksinimler**:
- Ürün ekleme/çıkarma
- Miktar değiştirme
- Birim fiyat ve toplam fiyat gösterimi
- Ürün bazlı not ekleme
- Sepet saklama süresi: 7 gün
- Sepet özeti (toplam tutar, ürün sayısı)

**İş Kuralları**:
- Sepete eklenen ürünün fiyatı anlık olarak hesaplanmalıdır
- Stokta olmayan ürünler sepette gösterilmemelidir
- Fiyat değişiklikleri sepetteki mevcut fiyatları etkilememelidir

### 3.7 Teklif Sistemi
**Amaç**: Sepetteki ürünlerin Kalsan'a iletilmesi

**Akış**:
1. Kullanıcı sepeti görüntüler
2. Teklif notu ekler (opsiyonel)
3. Teklifi onaylar
4. Sistem teklif numarası oluşturur (QYYMMDD-XXXX)
5. Sistem Kalsan'a Telegram bildirimi gönderir
6. Kalsan teklifi inceler
7. Kalsan müşteriyle iletişime geçer
8. Kalsan teklif durumunu günceller
9. Sistem müşteriye durum bildirimi gönderir

**Teklif Durumları**:
- `pending` - Beklemede (varsayılan)
- `processing` - İşleniyor
- `completed` - Tamamlandı
- `rejected` - Reddedildi

**İş Kuralları**:
- Teklif minimum 1 ürün içermelidir
- Teklif maximum 50 ürün içerebilir
- Teklif gönderildikten sonra düzenlenemez
- Teklif durumu sadece Kalsan tarafından değiştirilebilir
- Günlük teklif limiti: 20

### 3.8 Teklif Geçmişi
**Amaç**: Kullanıcının önceki tekliflerini görüntülemesi

**Gereksinimler**:
- Tarih sıralı liste
- Durum filtresi
- Teklif detayı
- Tekrar teklif gönderme
- PDF indirme (opsiyonel)

### 3.9 Alternatif Ürünler
**Amaç**: Benzer ürünlerin önerilmesi

**Gereksinimler**:
- Aynı kategorideki ürünler
- Benzer fiyat aralığındaki ürünler
- Marka bazlı alternatifler
- Maksimum 6 alternatif gösterilmelidir

### 3.10 Favoriler
**Amaç**: Kullanıcının sık baktığı ürünleri kaydetmesi

**Gereksinimler**:
- Favorilere ekleme/çıkarma
- Favori listesi
- Fiyat değişikliği bildirimi (gelecek faz)
- Stok bildirimi (gelecek faz)
- Sınırsız favori sayısı

### 3.11 Kampanyalar
**Amaç**: Özel fiyat ve promosyonların duyurulması

**Gereksinimler**:
- Kampanya listesi (aktif kampanyalar)
- Kampanya detayı
- Geçerlilik tarihi
- Kampanya bazlı fiyat
- Bildirim entegrasyonu

**Kampanya Tipleri**:
- Yüzde indirim
- Sabit tutar indirim

### 3.12 Bildirimler
**Amaç**: Kullanıcının bilgilendirilmesi

**Bildirim Tipleri**:
- Teklif durum bildirimi
- Fiyat değişikliği bildirimi
- Yeni kampanya bildirimi
- Stok bildirimi
- Sistem bildirimleri

**Gereksinimler**:
- Bildirim listesi
- Okunmamış bildirim sayısı
- Tek bildirim okundu işaretleme
- Tümünü okundu işaretleme
- Bildirim tercihleri (gelecek faz)

### 3.13 Admin Paneli
**Amaç**: Kalsan ekibinin sistemi yönetmesi

**Sayfalar**:
- Dashboard (istatistikler)
- Teklif yönetimi
- Ürün yönetimi (CRUD)
- Kategori yönetimi
- Marka yönetimi
- Kampanya yönetimi
- Fiyatlandırma yönetimi
- Kullanıcı yönetimi
- Raporlar

**Dashboard İstatistikleri**:
- Toplam kullanıcı
- Aktif kullanıcı
- Toplam ürün
- Stokta olmayan ürünler
- Toplam teklif
- Bekleyen teklifler
- Tamamlanan teklifler
- Toplam teklif tutarı
- Aktif kampanyalar

---

## 4. API Gereksinimleri

### 4.1 Genel
- RESTful API tasarımı
- JSON formatında veri alışverişi
- HTTPS zorunlu
- Rate limiting (100 istek/dakika)
- Sayfalama destekli

### 4.2 Authentication
- JWT token tabanlı
- Telegram WebApp initData doğrulama
- Token yenileme mekanizması

### 4.3 Hata Yönetimi
- Standart hata kodları
- Anlamlı hata mesajları
- Logging

### 4.4 Yanıt Formatı
```json
{
  "data": {},
  "message": "Success",
  "success": true
}
```

### 4.5 Sayfalama
```json
{
  "items": [],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

## 5. UI/UX Gereksinimleri

### 5.1 Tasarım Prensipleri
- Mobil öncelikli tasarım
- Minimal ve temiz arayüz
- Hızlı yükleme süresi
- Kolay navigasyon
- Dokunma dostu (minimum 44px buton)

### 5.2 Renk Paleti
- Ana Renk: #007AFF (Mavi)
- Arka Plan: #F5F5F5 (Açık Gri)
- Metin: #000000 (Siyah)
- İkincil Metin: #666666 (Gri)
- Başarı: #34C753 (Yeşil)
- Uyarı: #FF9500 (Turuncu)
- Hata: #FF3B30 (Kırmızı)

### 5.3 Tipografi
- Font: Geist Sans
- Minimum boyut: 14px
- Satır yüksekliği: 1.5

### 5.4 Sayfa Yapıları

#### Ana Sayfa
- Arama çubuğu
- Hızlı erişim butonları (Favoriler, Sepet, Teklifler, Profil)
- Kategori grid'i
- Kampanya banner'ları (opsiyonel)

#### Ürün Detay Sayfası
- Ürün görseli (tam genişlik)
- Ürün adı ve açıklaması
- Fiyat bilgisi (kademeli)
- Miktar seçici
- Sepete ekle butonu
- İlgili ürünler

#### Sepet Sayfası
- Ürün listesi
- Miktar değiştirme
- Ürün silme
- Toplam tutar
- Teklif gönder butonu

#### Teklif Sayfası
- Teklif özeti
- Not ekleme
- Onay butonu
- Başarılı mesajı

---

## 6. Güvenlik Gereksinimleri

### 6.1 Kimlik Doğrulama
- Telegram WebApp initData HMAC-SHA256 doğrulama
- JWT token (15 dakika geçerli)
- Refresh token (7 gün geçerli)
- HttpOnly cookie

### 6.2 Yetkilendirme
- Rol bazlı erişim (admin, customer)
- Kullanıcı sadece kendi verilerine erişebilir
- Admin tüm verilere erişebilir

### 6.3 Veri Güvenliği
- HTTPS zorunlu
- SQL Injection koruması
- XSS koruması
- CSRF koruması
- Rate limiting

### 6.4 Hassas Veri
- Parola saklanmaz (Telegram auth)
- Kredi kartı bilgisi yok (Faz 1)
- Telefon numarası opsiyonel

---

## 7. Performans Gereksinimleri

### 7.1 Yanıt Süreleri
- API yanıt süresi: < 200ms (95. percentile)
- Sayfa yükleme süresi: < 2 saniye
- Arama sonuçları: < 500ms

### 7.2 Kapasite
- Eş zamanlı kullanıcı: 1000+
- Aylık aktif kullanıcı: 10.000+
- Günlük teklif: 500+

### 7.3 Optimizasyon
- Response caching (Redis)
- Database query optimization
- Image optimization
- Code splitting
- Lazy loading

---

## 8. Faz 2 Planları (Gelecek)

### 8.1 Ödeme Sistemi
- Kredi kartı entegrasyonu
- Banka havalesi
- Fatura yönetimi

### 8.2 Çoklu Satıcı
- Satıcı kaydı
- Komisyon yönetimi
- Ürün onay süreci

### 8.3 Mobil Uygulama
- iOS ve Android uygulamaları
- Push bildirimleri
- Offline destek

### 8.4 Gelişmiş Analitik
- Satış raporları
- Kullanıcı davranış analizi
- Tahmine dayalı analitik

---

## 9. Sprint Planı

### Sprint 1-2 (2 hafta)
- Proje kurulumu
- Veritabanı tasarımı
- Auth modülü
- Ürün modülü
- Kategori modülü

### Sprint 3-4 (2 hafta)
- Marka modülü
- Fiyatlandırma modülü
- Sepet modülü
- Teklif modülü

### Sprint 5-6 (2 hafta)
- Bildirim modülü
- Favori modülü
- Admin paneli
- Raporlar

### Sprint 7-8 (2 hafta)
- Telegram Bot entegrasyonu
- Test ve hata düzeltmeleri
- Performans optimizasyonu
- Deploy

### Sprint 9 (1 hafta)
- Final testler
- Kullanıcı eğitimleri
- Lansman

---

## 10. Riskler ve Azaltma Stratejileri

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| Telegram API değişikliği | Düşük | Yüksek | Abstraction layer |
| Düşük kullanıcı benimseme | Orta | Yüksek | MVP, feedback döngüsü |
| Performans sorunları | Orta | Orta | Cache, optimization |
| Güvenlik ihlali | Düşük | Yüksek | Audit, testing |

---

## 11. Başarı Kriterleri

### 11.1 Lansman Kriterleri
- Tüm Faz 1 modülleri çalışıyor
- %95 uptime
- Kullanıcı eğitimleri tamamlandı
- Admin paneli çalışıyor
- Telegram bot entegre

### 11.2 3 Aylık Kriterler
- 100+ aktif kullanıcı
- 500+ teklif gönderimi
- %80+ teklif yanıt oranı
- 4.0+ kullanıcı memnuniyeti

---

*Bu doküman HORECA Portal Faz 1 gereksinimlerini tanımlamaktadır.*
*Tarih: 2026-07-13*
*Versiyon: 1.0*