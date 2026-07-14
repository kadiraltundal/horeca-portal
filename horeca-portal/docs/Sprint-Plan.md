# Sprint Planı

## HORECA Portal - Faz 1

**Toplam Süre**: 9 Hafta (4.5 Sprint)
**Sprint Süresi**: 2 hafta
**Başlangıç**: 2026-07-14

---

## Genel Bakış

| Sprint | Tarih | Kapsam | Hedef |
|--------|-------|--------|-------|
| Sprint 1-2 | Hafta 1-2 | Temel Yapı | Auth, Ürün, Kategori |
| Sprint 3-4 | Hafta 3-4 | İş Akışı | Sepet, Teklif, Bildirim |
| Sprint 5-6 | Hafta 5-6 | Yönetim | Admin Panel, Raporlar |
| Sprint 7-8 | Hafta 7-8 | Entegrasyon | Telegram Bot, Test |
| Sprint 9 | Hafta 9 | Lansman | Final Test, Deploy |

---

## Sprint 1-2: Temel Yapı

**Tarih**: 14 Temmuz - 27 Temmuz 2026
**Hedef**: Proje altyapısı, kimlik doğrulama, ürün ve kategori yönetimi

### Sprint 1 (Hafta 1)

#### Backend
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Proje kurulumu ve yapılandırma | 1 gün | Yüksek | ✓ |
| Veritabanı şeması oluşturma | 1 gün | Yüksek | ✓ |
| TypeORM entity tanımları | 2 gün | Yüksek | ✓ |
| Auth modülü (Telegram login) | 2 gün | Yüksek | - |
| JWT yapılandırması | 1 gün | Yüksek | - |

#### Frontend
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Next.js proje kurulumu | 1 gün | Yüksek | ✓ |
| Telegram WebApp entegrasyonu | 1 gün | Yüksek | - |
 | Tailwind CSS yapılandırması | 0.5 gün | Yüksek | - |
| Ana sayfa tasarımı | 2 gün | Yüksek | - |
| Login sayfası | 1.5 gün | Yüksek | - |

#### DevOps
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Docker Compose yapılandırması | 1 gün | Yüksek | ✓ |
| PostgreSQL kurulumu | 0.5 gün | Yüksek | ✓ |
| Redis kurulumu | 0.5 gün | Yüksek | ✓ |
| pgAdmin yapılandırması | 0.5 gün | Yüksek | ✓ |

### Sprint 2 (Hafta 2)

#### Backend
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Products modülü (CRUD) | 2 gün | Yüksek | ✓ |
| Categories modülü (CRUD) | 1.5 gün | Yüksek | ✓ |
| Brands modülü (CRUD) | 1 gün | Yüksek | ✓ |
| Product search endpoint | 1 gün | Orta | - |
| Alternatif ürünler endpoint | 0.5 gün | Düşük | - |

#### Frontend
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Kategori sayfası | 1.5 gün | Yüksek | ✓ |
| Ürün listesi sayfası | 2 gün | Yüksek | - |
| Ürün detay sayfası | 2 gün | Yüksek | - |
| Arama fonksiyonu | 1 gün | Orta | - |

#### Test
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Auth modülü testleri | 1 gün | Yüksek | - |
| Products modülü testleri | 1 gün | Yüksek | - |
| Categories modülü testleri | 0.5 gün | Orta | - |

**Sprint 1-2 Çıktıları**:
- Kullanıcılar Telegram ile giriş yapabilir
- Ürünler listelenebilir ve detayları görüntülenebilir
- Kategoriler görüntülenebilir
- Arama yapılabilir

---

## Sprint 3-4: İş Akışı

**Tarih**: 28 Temmuz - 10 Ağustos 2026
**Hedef**: Sepet, teklif sistemi, bildirimler

### Sprint 3 (Hafta 3)

#### Backend
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Pricing modülü | 2 gün | Yüksek | ✓ |
| Cart modülü | 2 gün | Yüksek | - |
| Quotes modülü (temel) | 2 gün | Yüksek | - |

#### Frontend
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Sepet sayfası | 2 gün | Yüksek | ✓ |
| Sepete ekleme fonksiyonu | 1.5 gün | Yüksek | - |
| Miktar seçici bileşeni | 1 gün | Yüksek | - |
| Fiyat gösterimi | 0.5 gün | Orta | - |

### Sprint 4 (Hafta 4)

#### Backend
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Quotes modülü (tam) | 2 gün | Yüksek | - |
| Notifications modülü | 1.5 gün | Yüksek | - |
| Favorites modülü | 1 gün | Yüksek | - |
| Telegram bot bildirimleri | 1.5 gün | Yüksek | - |

#### Frontend
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Teklif gönderme sayfası | 1.5 gün | Yüksek | - |
| Teklif geçmişi sayfası | 1.5 gün | Yüksek | - |
| Teklif detay sayfası | 1 gün | Yüksek | - |
| Favoriler sayfası | 1 gün | Yüksek | - |
| Bildirimler sayfası | 1 gün | Orta | - |

#### Test
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Cart modülü testleri | 1 gün | Yüksek | - |
| Quotes modülü testleri | 1 gün | Yüksek | - |
| Notifications modülü testleri | 0.5 gün | Orta | - |

**Sprint 3-4 Çıktıları**:
- Sepete ürün eklenebilir ve düzenlenebilir
- Teklif gönderilebilir
- Teklif geçmişi görüntülenebilir
- Bildirimler alınabilir
- Favoriler yönetilebilir

---

## Sprint 5-6: Yönetim

**Tarih**: 11 Ağustos - 24 Ağustos 2026
**Hedef**: Admin paneli, raporlar, fiyatlandırma yönetimi

### Sprint 5 (Hafta 5)

#### Backend
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Admin modülü | 1 gün | Yüksek | ✓ |
| Dashboard endpoint | 1 gün | Yüksek | - |
| Admin yetkilendirmesi | 1 gün | Yüksek | - |
| Toplu ürün yükleme | 1.5 gün | Orta | - |

#### Frontend (Admin)
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Admin login sayfası | 0.5 gün | Yüksek | - |
| Dashboard sayfası | 2 gün | Yüksek | - |
| Ürün yönetimi sayfası | 2.5 gün | Yüksek | - |

### Sprint 6 (Hafta 6)

#### Backend
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Kategori yönetimi endpoint | 1 gün | Yüksek | - |
| Marka yönetimi endpoint | 1 gün | Yüksek | - |
| Kampanya yönetimi endpoint | 1.5 gün | Yüksek | - |
| Fiyatlandırma yönetimi endpoint | 1.5 gün | Yüksek | - |

#### Frontend (Admin)
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Kategori yönetimi sayfası | 1.5 gün | Yüksek | - |
| Marka yönetimi sayfası | 1 gün | Yüksek | - |
| Kampanya yönetimi sayfası | 1.5 gün | Yüksek | - |
| Fiyatlandırma yönetimi sayfası | 2 gün | Yüksek | - |
| Teklif yönetimi sayfası | 1.5 gün | Yüksek | - |

#### Test
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Admin modülü testleri | 1.5 gün | Yüksek | - |
| Dashboard testleri | 0.5 gün | Orta | - |

**Sprint 5-6 Çıktıları**:
- Admin paneli çalışıyor
- Ürün, kategori, marka yönetilebiliyor
- Kampanyalar oluşturulabiliyor
- Fiyatlandırma yapılabiliyor
- Teklifler yönetilebiliyor
- Dashboard istatistikleri görüntülenebiliyor

---

## Sprint 7-8: Entegrasyon

**Tarih**: 25 Ağustos - 7 Eylül 2026
**Hedef**: Telegram bot entegrasyonu, test, optimizasyon

### Sprint 7 (Hafta 7)

#### Backend
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Telegram bot komutları | 2 gün | Yüksek | - |
| Botwebhook entegrasyonu | 1.5 gün | Yüksek | - |
| Bildirim şablonları | 1 gün | Yüksek | - |
| Hata düzeltmeleri | 1.5 gün | Yüksek | - |

#### Frontend
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Telegram buton entegrasyonu | 1.5 gün | Yüksek | - |
| MainButton kullanımı | 1 gün | Yüksek | - |
| BackButton kullanımı | 0.5 gün | Yüksek | - |
| Tema entegrasyonu | 1 gün | Orta | - |
| Hata düzeltmeleri | 1 gün | Yüksek | - |

### Sprint 8 (Hafta 8)

#### Test
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Entegrasyon testleri | 2 gün | Yüksek | - |
| Kullanıcı kabul testleri | 1.5 gün | Yüksek | - |
| Performans testleri | 1 gün | Orta | - |
| Güvenlik testleri | 1 gün | Yüksek | - |

#### Optimizasyon
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Veritabanı optimizasyonu | 1 gün | Yüksek | - |
| API yanıt süresi optimizasyonu | 0.5 gün | Orta | - |
| Frontend performans optimizasyonu | 0.5 gün | Orta | - |

#### Deploy
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Production yapılandırması | 1 gün | Yüksek | - |
| SSL sertifikası | 0.5 gün | Yüksek | - |
| Nginx yapılandırması | 0.5 gün | Yüksek | - |
| PM2 yapılandırması | 0.5 gün | Yüksek | - |

**Sprint 7-8 Çıktıları**:
- Telegram botu çalışıyor
- Tüm bildirimler gönderilebiliyor
- Testler tamamlandı
- Performans optimize edildi
- Deploy hazır

---

## Sprint 9: Lansman

**Tarih**: 8 Eylül - 14 Eylül 2026
**Hedef**: Final testler, eğitim, lansman

### Hafta 9

#### Final Testler
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Son hata düzeltmeleri | 2 gün | Yüksek | - |
| Kullanıcı akışı testi | 1 gün | Yüksek | - |
| Uzun süreli test | 0.5 gün | Orta | - |

#### Eğitim
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Admin eğitim dokümanı | 1 gün | Yüksek | - |
| Kullanıcı kılavuzu | 1 gün | Yüksek | - |
| Video eğitimler | 0.5 gün | Orta | - |

#### Lansman
| Görev | Süre | Öncelik | Durum |
|-------|------|---------|-------|
| Production deploy | 0.5 gün | Yüksek | - |
| Monitoring yapılandırması | 0.5 gün | Yüksek | - |
| Backup yapılandırması | 0.5 gün | Yüksek | - |
| Lansman kontrol listesi | 0.5 gün | Yüksek | - |

**Sprint 9 Çıktıları**:
- Tüm testler tamamlandı
- Eğitim materyalleri hazır
- Production ortamı çalışıyor
- Monitoring aktif
- Backup alınıyor
- **LANSMAN YAPILDI**

---

## Backlog

### Faz 2 Önerileri
| Özellik | Öncelik | Tahmini Süre |
|---------|---------|--------------|
| Ödeme sistemi entegrasyonu | Yüksek | 3 sprint |
| Mobil uygulama (iOS/Android) | Orta | 4 sprint |
| Çoklu satıcı desteği | Düşük | 5 sprint |
| Gelişmiş raporlama | Orta | 2 sprint |
| Excel entegrasyonu | Orta | 1 sprint |
| PDF rapor oluşturma | Düşük | 1 sprint |
| Çoklu dil (İngilizce) | Düşük | 1 sprint |
| AI ürün önerileri | Düşük | 2 sprint |

---

## Riskler

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| Telegram API değişikliği | Düşük | Yüksek | Abstraction layer |
| Kalsan personel direnci | Orta | Yüksek | Eğitim, phased rollout |
| Düşük kullanıcı benimseme | Orta | Yüksek | MVP, feedback döngüsü |
| Hosting kesintisi | Düşük | Orta | Monitoring, backup |
| Güvenlik ihlali | Düşük | Yüksek | Audit, testing |

---

## Bağımlılıklar

### İç Bağımlılıklar
- Auth modülü → Tüm modüller
- Products modülü → Cart, Quotes
- Categories/Brands → Products
- Pricing → Cart, Quotes
- Cart → Quotes
- Notifications → Quotes, Admin

### Dış Bağımlılıklar
- Telegram Bot Token (Kalsan'dan)
- Hosting hesabı (Hetzner/Contabo)
- Alan adı (Kalsan'dan)
- Ürün görselleri (Kalsan'dan)
- Ürün verileri (Kalsan'dan)

---

## İletişim

### Haftalık Toplantılar
- **Pazartesi**: Sprint planlama (10:00)
- **Çarşamba**: Durum güncellemesi (14:00)
- **Cuma**: Sprint retrospektif (16:00)

### Araçlar
- **Proje Yönetimi**: GitHub Projects
- **İletişim**: Telegram grubu
- **Dokümantasyon**: Bu repo
- **Deploy**: VPS (Hetzner/Contabo)

---

*Bu doküman HORECA Portal geliştirme planını içermektedir.*
*Tarih: 2026-07-13*
*Versiyon: 1.0*