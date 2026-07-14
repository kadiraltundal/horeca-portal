# UI/UX Design Specification

## HORECA Portal - Telegram Mini App

**Versiyon**: 1.0
**Tarih**: 2026-07-13
**Platform**: Telegram Mini App (Mobil)

---

## 1. Design System

### 1.1 Renk Paleti

#### Ana Renkler
| Renk | Kod | Kullanım |
|------|-----|----------|
| Primary | #007AFF | Ana butonlar, linkler, aktif durumlar |
| Primary Dark | #0056CC | Hover durumları |
| Primary Light | #E3F2FD | Arka plan vurguları |

#### Yardımcı Renkler
| Renk | Kod | Kullanım |
|------|-----|----------|
| Success | #34C753 | Başarılı işlemler, stokta var |
| Warning | #FF9500 | Uyarılar, bekleyen teklifler |
| Error | #FF3B30 | Hatalar, stokta yok |
| Info | #5856D6 | Bilgi mesajları |

#### Nötr Renkler
| Renk | Kod | Kullanım |
|------|-----|----------|
| Black | #000000 | Başlıklar, ana metin |
| Dark Gray | #333333 | İkincil metin |
| Gray | #666666 | Açıklayıcı metin |
| Light Gray | #999996 | Placeholder, ikonlar |
| Border | #E5E5EA | Çerçeveler, ayıraçlar |
| Background | #F2F2F7 | Sayfa arka planı |
| White | #FFFFFF | Kartlar, modallar |

### 1.2 Tipografi

#### Font Ailesi
```
Font Family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
```

#### Font Boyutları
| Kullanım | Boyut | Weight | Satır Yüksekliği |
|----------|-------|--------|------------------|
| H1 (Sayfa Başlığı) | 24px | Bold (700) | 32px |
| H2 (Bölüm Başlığı) | 20px | SemiBold (600) | 28px |
| H3 (Kart Başlığı) | 17px | SemiBold (600) | 24px |
| Body (Ana Metin) | 16px | Regular (400) | 24px |
| Body Small | 14px | Regular (400) | 20px |
| Caption | 12px | Regular (400) | 16px |
| Button | 16px | SemiBold (600) | 24px |

### 1.3 Boşluk Sistemi

#### Temel Birim: 4px
| Token | Değer | Kullanım |
|-------|-------|----------|
| xs | 4px | İkon arası minimal boşluk |
| sm | 8px | Küçük elemanlar arası |
| md | 16px | Standart iç boşluk |
| lg | 24px | Bölüm arası |
| xl | 32px | Büyük bölümler arası |
| 2xl | 48px | Sayfa kenar boşlukları |

### 1.4 Köşe Yuvarlaklığı
| Token | Değer | Kullanım |
|-------|-------|----------|
| none | 0px | Köşe yok |
| sm | 8px | Butonlar, input'lar |
| md | 12px | Kartlar |
| lg | 16px | Modal'lar |
| full | 9999px | Avatar'lar, badge'ler |

### 1.5 Gölge
| Token | Değer | Kullanım |
|-------|-------|----------|
| sm | 0 1px 2px rgba(0,0,0,0.05) | Hafif kaldırma |
| md | 0 4px 6px rgba(0,0,0,0.1) | Kartlar |
| lg | 0 10px 15px rgba(0,0,0,0.1) | Modal'lar |

---

## 2. Bileşen Kütüphanesi

### 2.1 Butonlar

#### Primary Button
```
Yükseklik: 48px
Padding: 0 24px
Arka Plan: #007AFF
Metin: #FFFFFF, 16px, SemiBold
Köşe: 8px
Durumlar: Normal, Hover (#0056CC), Disabled (#B0B0B0)
```

#### Secondary Button
```
Yükseklik: 48px
Padding: 0 24px
Arka Plan: #FFFFFF
Border: 1px solid #007AFF
Metin: #007AFF, 16px, SemiBold
Köşe: 8px
```

#### Danger Button
```
Yükseklik: 48px
Padding: 0 24px
Arka Plan: #FF3B30
Metin: #FFFFFF, 16px, SemiBold
Köşe: 8px
```

#### Icon Button
```
Boyut: 44px x 44px
İkon Boyutu: 24px
Arka Plan: Transparent
Border: Yok
```

### 2.2 Input'lar

#### Text Input
```
Yükseklik: 48px
Padding: 0 16px
Border: 1px solid #E5E5EA
Arka Plan: #FFFFFF
Metin: #000000, 16px
Placeholder: #999996
Focus Border: #007AFF
Köşe: 8px
```

#### Search Input
```
Yükseklik: 44px
Padding: 0 16px 0 40px
Arka Plan: #F2F2F7
Border: Yok
İkon: Sol tarafta, #999996
Köşe: 8px
```

### 2.3 Kartlar

#### Product Card
```
Genişlik: 100% (Liste) veya 50% (Grid)
Padding: 12px
Arka Plan: #FFFFFF
Border: 1px solid #E5E5EA
Köşe: 12px
Gölge: sm

İçerik:
- Görsel: 100% genişlik, 120px yükseklik, object-fit: cover
- Başlık: 14px, SemiBold, siyah, max 2 satır
- Fiyat: 16px, Bold, #007AFF
- Badge (isteğe bağlı): Sol üst köşe
```

#### Category Card
```
Boyut: 100% genişlik
Padding: 16px
Arka Plan: #FFFFFF
Border: 1px solid #E5E5EA
Köşe: 12px

İçerik:
- İkon: 32px, ortada
- Başlık: 14px, SemiBold, ortada
- Alt başlık (isteğe bağlı): 12px, Gray
```

### 2.4 Badge'ler

#### Status Badge
```
Padding: 4px 8px
Köşe: 9999px
Font: 12px, Medium

Durumlar:
- pending: #FFF3CD arka plan, #856404 metin
- processing: #D1ECF1 arka plan, #0C5460 metin
- completed: #D4EDDA arka plan, #155724 metin
- rejected: #F8D7DA arka plan, #721C24 metin
```

### 2.5 Bottom Navigation

```
Yükseklik: 83px (iPhone X için)
Padding-bottom: 34px (Safe area)
Arka Plan: #FFFFFF
Border-top: 1px solid #E5E5EA

Öğe:
- Genişlik: 25%
- Padding: 8px 0
- İkon: 24px
- Metin: 10px, Regular
- Aktif Renk: #007AFF
- Pasif Renk: #999996
```

---

## 3. Sayfa Tasarımları

### 3.1 Ana Sayfa

```
┌─────────────────────────────────────┐
│ ☰  HORECA Portal        🔔 (3)  👤 │  ← Header (56px)
├─────────────────────────────────────┤
│ 🔍 Mahsulot qidirish...            │  ← Search Bar (44px)
├─────────────────────────────────────┤
│                                     │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐│
│  │ ❤️  │  │ 🛒  │  │ 📋  │  │ 👤  ││  ← Quick Actions
│  │Sev. │  │Savat│  │Tekl.│  │Profil││    (4 items grid)
│  └─────┘  └─────┘  └─────┘  └─────┘│
│                                     │
│  Kategoriyalar                      │  ← Section Title
│  ┌─────────────────────────────────┐│
│  │ 🧴 Kimyasal    │ 📄 Kağıt      ││  ← Categories
│  │    Mahsulotlar │    Mahsulotlar││    (2 columns grid)
│  ├─────────────────────────────────┤│
│  │ 🧵 Tekstil    │ 🔧 Asboblar   ││
│  └─────────────────────────────────┘│
│                                     │
│  Yangi Mahsulotlar                  │  ← Section Title
│  ┌─────────┐ ┌─────────┐           │
│  │ [Img]   │ │ [Img]   │           │  ← Products
│  │ Det.    │ │ Det.    │           │    (Horizontal scroll)
│  │ $2.50   │ │ $3.00   │           │
│  └─────────┘ └─────────┘           │
│                                     │
├─────────────────────────────────────┤
│  🏠      📂      🛒      👤       │  ← Bottom Nav
│  Bosh    Kateg.  Savat   Profil    │
└─────────────────────────────────────┘
```

**Bileşen Detayları**:
- Header: Sabit üst, scroll'da gizlenmez
- Search: Herhangi bir yere tıklanınca arama sayfasına yönlendirir
- Quick Actions: 2x2 grid, tıklanınca ilgili sayfaya gider
- Categories: 2 sütunlu grid, her biri ikon + başlık
- Products: Yatay scroll, her kart 140px genişliğinde
- Bottom Nav: 4 ana sayfa, aktif olan mavi

### 3.2 Arama Sayfası

```
┌─────────────────────────────────────┐
│ ←  🔍 Mahsulot qidirish...   Temizle│  ← Search Header
├─────────────────────────────────────┤
│                                     │
│  Oxirgi qidiruvlar                  │  ← Recent Searches
│  ┌─────────────────────────────────┐│
│  │ 🔍 Deterjan                     ││
│  │ 🔍 Kağıt peçete                 ││
│  │ 🔍 Dezenfektan                  ││
│  └─────────────────────────────────┘│
│                                     │
│  Mashhur qidiruvlar                 │  ← Popular Searches
│  ┌─────────────────────────────────┐│
│  │ [Deterjan] [Peçete] [Havlu]    ││
│  │ [Nevresim] [Sabun]             ││
│  └─────────────────────────────────┘│
│                                     │
│  ─── Arama sonuçları ───           │  ← Results (if searching)
│                                     │
│  ┌─────────────────────────────────┐│
│  │ [Img] Premium Deterjan     $2.50││
│  │       Kalsan • Stokta var      ││
│  ├─────────────────────────────────┤│
│  │ [Img] Bulaşık Deterjanı    $1.80││
│  │       Kalsan • Stokta var      ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### 3.3 Kategori Sayfası

```
┌─────────────────────────────────────┐
│ ←  Kategoriyalar                   │  ← Header
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🧴 Kimyasal Mahsulotlar        ││  ← Category Card
│  │    45 ta mahsulot               ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 📄 Kağıt Mahsulotlar           ││
│  │    32 ta mahsulot               ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🧵 Tekstil                     ││
│  │    28 ta mahsulot               ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🔧 Asbob-uskunalar             ││
│  │    15 ta mahsulot               ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│  🏠      📂      🛒      👤       │
└─────────────────────────────────────┘
```

### 3.4 Kategori Detay Sayfası

```
┌─────────────────────────────────────┐
│ ←  Kimyasal Mahsulotlar            │  ← Header
├─────────────────────────────────────┤
│                                     │
│  Alt kategoriyalar                  │  ← Subcategories (horizontal)
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │Bulaş│ │Yüzey│ │Deze.│ │Diğer│  │
│  │ık   │ │Tem. │ │nfk. │ │     │  │
│  └─────┘ └─────┘ └─────┘ └─────┘  │
│                                     │
│  45 ta mahsulot          Sırala ▼  │  ← Filter/Sort
│  ─────────────────────────────────  │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ [Img] Premium Deterjan     $2.50││  ← Product List
│  │       Kalsan • Stokta var      ││
│  ├─────────────────────────────────┤│
│  │ [Img] Bulaşık Deterjanı    $1.80││
│  │       Kalsan • Stokta var      ││
│  ├─────────────────────────────────┤│
│  │ [Img] Yüzey Temizleyici    $3.20││
│  │       Kalsan • Stokta yok      ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│  🏠      📂      🛒      👤       │
└─────────────────────────────────────┘
```

### 3.5 Ürün Detay Sayfası

```
┌─────────────────────────────────────┐
│ ←  Ürün Detayı                 ❤️   │  ← Header
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │         [ÜRÜN GÖRSELİ]         ││  ← Product Image
│  │         (Tam genişlik)          ││    (Aspect ratio 1:1)
│  │                                 ││
│  └─────────────────────────────────┘│
│  ○ ○ ○ ○                           │  ← Image Dots
│                                     │
│  Premium Deterjan                   │  ← Product Name (H1)
│  Премиум Детергент                  │  ← Russian Name (H3)
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 💰 $2.50 / dona                 ││  ← Price Card
│  │                                 ││
│  │ Miktar kademeleri:              ││
│  │ ┌─────────────────────────────┐ ││
│  │ │ 1-10 dona     $2.50        │ ││  ← Price Tiers
│  │ │ 11-50 dona    $2.30 (8% off)│ ││
│  │ │ 51-100 dona   $2.15 (14% off)│││
│  │ │ 100+ dona     $2.00 (20% off)│││
│  │ └─────────────────────────────┘ ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 📦 Miqdor                       ││  ← Quantity Selector
│  │    ┌───┐ ┌─────┐ ┌───┐         ││
│  │    │ - │ │  5  │ │ + │         ││
│  │    └───┘ └─────┘ └───┘         ││
│  │                                 ││
│  │ Jami: $12.50                    ││  ← Total Price
│  └─────────────────────────────────┘│
│                                     │
│  Tavsif                             │  ← Description Section
│  Yuqori sifatli deterjan mahsuloti. │
│  Barcha turdagi idishlar uchun mos. │
│                                     │
│  Xususiyatlar                       │  ← Attributes
│  ┌─────────────────────────────────┐│
│  │ Hacim        │ 1L              ││
│  │ Rang         │ Ko'k            ││
│  │ Ishlab chiq. │ O'zbekiston     ││
│  └─────────────────────────────────┘│
│                                     │
│  Igili mahsulotlar                  │  ← Related Products
│  ┌─────────┐ ┌─────────┐           │
│  │ [Img]   │ │ [Img]   │           │
│  │ Boshq.  │ │ Boshq.  │           │
│  │ $3.00   │ │ $2.80   │           │
│  └─────────┘ └─────────┘           │
│                                     │
├─────────────────────────────────────┤
│  🛒 Savatga qo'shish               │  ← Telegram MainButton
└─────────────────────────────────────┘
```

### 3.6 Sepet Sayfası

```
┌─────────────────────────────────────┐
│ ←  Teklif Savati              🗑️    │  ← Header
├─────────────────────────────────────┤
│                                     │
│  3 ta mahsulot                      │  ← Item Count
│                                     │
│  ┌─────────────────────────────────┐│
│  │ [Img] Premium Deterjan     $12.50│  ← Cart Item
│  │       $2.50 x 5                 │
│  │       ┌───┐ ┌───┐ ┌───┐    ✕   ││  ← Quantity Controls
│  │       │ - │ │ 5 │ │ + │        ││
│  │       └───┘ └───┘ └───┘        ││
│  │       Not: Acil teslimat        ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ [Img] Bulaşık Deterjanı    $9.00││  ← Cart Item
│  │       $1.80 x 5                 │
│  │       ┌───┐ ┌───┐ ┌───┐    ✕   ││
│  │       │ - │ │ 5 │ │ + │        ││
│  │       └───┘ └───┘ └───┘        ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ [Img] Yüzey Temizleyici   $16.00││  ← Cart Item
│  │       $3.20 x 5                 │
│  │       ┌───┐ ┌───┐ ┌───┐    ✕   ││
│  │       │ - │ │ 5 │ │ + │        ││
│  │       └───┘ └───┘ └───┘        ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│  Jami:                    $37.50   │  ← Total
│                                     │
├─────────────────────────────────────┤
│  📋 Teklif yuborish ($37.50)       │  ← Telegram MainButton
└─────────────────────────────────────┘
```

### 3.7 Teklif Gönderme Sayfası

```
┌─────────────────────────────────────┐
│ ←  Teklif Yuborish                 │  ← Header
├─────────────────────────────────────┤
│                                     │
│  Teklif ma'lumotlari                │  ← Quote Summary
│  ┌─────────────────────────────────┐│
│  │ Mahsulotlar: 3 ta               ││
│  │ Jami summa: $37.50              ││
│  │ Valyuta: USD                    ││
│  └─────────────────────────────────┘│
│                                     │
│  Teklif ro'yxati                    │  ← Items List
│  ┌─────────────────────────────────┐│
│  │ • Premium Deterjan      5 x $2.50││
│  │ • Bulaşık Deterjanı     5 x $1.80││
│  │ • Yüzey Temizleyici     5 x $3.20││
│  └─────────────────────────────────┘│
│                                     │
│  Qo'shimcha ma'lumot                │  ← Customer Note
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │ Lütfen pazartesi gününa kadar  ││
│  │ teslim edin.                     ││
│  │                                 ││
│  └─────────────────────────────────┘│
│  0/500                              │  ← Character Count
│                                     │
│  ⚠️ Teklif yuborilgandan keyin     │  ← Warning
│  o'zgartirib bo'lmaydi.             │
│                                     │
├─────────────────────────────────────┤
│  ✅ Teklifni tasdiqlash             │  ← Telegram MainButton
└─────────────────────────────────────┘
```

### 3.8 Başarılı Teklif Sayfası

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│              ✅                     │  ← Success Icon
│                                     │    (animated)
│       Teklif muvaffaqiyatli        │  ← Success Title
│          yuborildi!                 │
│                                     │
│    Teklif raqamingiz:               │  ← Quote Number
│    ┌─────────────────────┐          │
│    │   Q260713-0001      │          │
│    └─────────────────────┘          │
│                                     │
│    Kalsan siz bilan tez orada      │  ← Info Message
│    bog'lanadi.                      │
│                                     │
│    ┌─────────────────────────────┐  │
│    │    Tekliflarni ko'rish      │  │  ← View Quotes Button
│    └─────────────────────────────┘  │
│                                     │
│    ┌─────────────────────────────┐  │
│    │    Bosh sahifaga qaytish     │  │  ← Home Button
│    └─────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### 3.9 Teklif Geçmişi Sayfası

```
┌─────────────────────────────────────┐
│ ←  Tekliflarim                     │  ← Header
├─────────────────────────────────────┤
│                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │  ← Status Filter
│  │Barcha│ │Kutil.│ │Tayyor│ │Bekor │  │    (Horizontal tabs)
│  └─────┘ └─────┘ └─────┘ └─────┘  │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Q260713-0001          Kutilmoqda││  ← Quote Card
│  │ 13.07.2026                       ││
│  │ 3 ta mahsulot      $37.50      ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Q260712-0003          Tayyor    ││  ← Quote Card
│  │ 12.07.2026                       ││
│  │ 5 ta mahsulot      $89.00      ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Q260710-0002          Bekor     ││  ← Quote Card
│  │ 10.07.2026                       ││
│  │ 2 ta mahsulot      $15.00      ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│  🏠      📂      🛒      👤       │
└─────────────────────────────────────┘
```

### 3.10 Teklif Detay Sayfası

```
┌─────────────────────────────────────┐
│ ←  Teklif #Q260713-0001            │  ← Header
├─────────────────────────────────────┤
│                                     │
│  Durum: ⏳ Kutilmoqda               │  ← Status Badge
│                                     │
│  Yaratilgan: 13.07.2026, 14:30     │  ← Date Info
│                                     │
│  ─── Mahsulotlar ───               │  ← Items Section
│  ┌─────────────────────────────────┐│
│  │ Premium Deterjan                ││
│  │ 5 dona x $2.50 = $12.50       ││
│  ├─────────────────────────────────┤│
│  │ Bulaşık Deterjanı               ││
│  │ 5 dona x $1.80 = $9.00        ││
│  ├─────────────────────────────────┤│
│  │ Yüzey Temizleyici              ││
│  │ 5 dona x $3.20 = $16.00       ││
│  └─────────────────────────────────┘│
│                                     │
│  Jami: $37.50 USD                   │  ← Total
│                                     │
│  ─── Eslatma ───                   │  ← Customer Note
│  Lütfen pazartesi gününa kadar     │
│  teslim edin.                       │
│                                     │
│  ─── Kalsan eslatmasi ───          │  ← Admin Note (if any)
│  Siz bilan ertaga bog'lanamiz.     │
│                                     │
│  ┌─────────────────────────────────┐│
│  │    🔄 Qayta yuborish            ││  ← Repeat Button
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### 3.11 Favoriler Sayfası

```
┌─────────────────────────────────────┐
│ ←  Sevimlilar                      │  ← Header
├─────────────────────────────────────┤
│                                     │
│  5 ta mahsulot                      │  ← Item Count
│                                     │
│  ┌─────────────────────────────────┐│
│  │ [Img] Premium Deterjan     $2.50││  ← Favorite Item
│  │       Kalsan                     ││
│  │       [Savatga] [O'chirish]     ││  ← Action Buttons
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ [Img] Bulaşık Deterjanı    $1.80││  ← Favorite Item
│  │       Kalsan                     ││
│  │       [Savatga] [O'chirish]     ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ [Img] Yüzey Temizleyici    $3.20││  ← Favorite Item
│  │       Kalsan                     ││
│  │       [Savatga] [O'chirish]     ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│  🏠      📂      🛒      👤       │
└─────────────────────────────────────┘
```

### 3.12 Bildirimler Sayfası

```
┌─────────────────────────────────────┐
│ ←  Bildirishnomalar    Barchasini  │  ← Header
│                        o'qilgan ♡  │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🔵 Teklif Durumu              2dk││  ← Unread Notification
│  │ Teklif #Q260713-0001 yangilandi ││
│  │ Durum: Tayyorlanmoqda           ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ ⚪ Yangi Kampanya             1s ││  ← Read Notification
│  │ Maxsus taklif: 20% chegirma!   ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ ⚪ Fiyat O'zgarishi          3k ││  ← Read Notification
│  │ Premium Deterjan narxi yangi   ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│  🏠      📂      🛒      👤       │
└─────────────────────────────────────┘
```

### 3.13 Profil Sayfası

```
┌─────────────────────────────────────┐
│ ←  Profil                          │  ← Header
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │      ┌───────┐                  ││  ← User Info
│  │      │  AK   │ Ahmad Karimov    ││    (Avatar + Name)
│  │      └───────┘ Hotel Tashkent   ││
│  └─────────────────────────────────┘│
│                                     │
│  Bildirishnomalar         🔴 3     │  ← Notifications
│                                     │
│  ─── Sozlamalar ───               │  ← Settings Section
│  ┌─────────────────────────────────┐│
│  │ 🌐 Tilni o'zgartirish    O'z > ││
│  ├─────────────────────────────────┤│
│  │ 🔔 Bildirishnomalar         >  ││
│  ├─────────────────────────────────┤│
│  │ 📱 Kontakt ma'lumotlari    >   ││
│  └─────────────────────────────────┘│
│                                     │
│  ─── Yordam ───                   │  ← Help Section
│  ┌─────────────────────────────────┐│
│  │ ❓ Yordam va qo'llab-quvvatlash││
│  ├─────────────────────────────────┤│
│  │ 📋 Foydalanish shartlari       ││
│  ├─────────────────────────────────┤│
│  │ ℹ️ Ilova haqida           v1.0 ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │          Chiqish                ││  ← Logout Button
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│  🏠      📂      🛒      👤       │
└─────────────────────────────────────┘
```

---

## 4. Animasyonlar ve Geçişler

### 4.1 Sayfa Geçişleri
- **Push**: Sağdan sola kayarak açılır (0.3s ease-out)
- **Pop**: Sola kayarak kapanır (0.3s ease-in)
- **Modal**: Alttan yukarı kayarak açılır (0.3s ease-out)

### 4.2 Mikro Etkileşimler
- **Buton Basma**: 0.95x scale (0.1s)
- **Favori Ekleme**: Kalp animasyonu (0.3s)
- **Sepete Ekleme**: Ürün küçük resmi sepete uçar (0.4s)
- **Yükleme**: Skeleton loading shimmer

### 4.3 Hata Durumları
- **Toast Message**: Alttan 2 saniye görünür
- **Error State**: Retry butonu ile

---

## 5. Responsive Davranış

### 5.1 Telegram Mini App Kısıtlamaları
- **Maksimum Genişlik**: 500px
- **Minimum Genişlik**: 320px
- **Safe Area**: iPhone X ve sonrası için

### 5.2 Breakpoints
| breakpoint | Genişlik | Davranış |
|------------|----------|----------|
| mobil | < 375px | Tek sütun |
| standart | 375-414px | Tek sütun, optimal |
| geniş | > 414px | Maksimum 500px |

---

## 6. Erişilebilirlik

### 6.1 Renk Kontrastı
- Metin: Minimum 4.5:1 kontrast oranı
- Büyük metin: Minimum 3:1 kontrast oranı

### 6.2 Dokunma Boyutu
- Minimum dokunma alanı: 44x44px
- Elemanlar arası minimum boşluk: 8px

### 6.3 Okunabilirlik
- Minimum font boyutu: 12px
- Satır aralığı: 1.5x font boyutu
- Maksimum satır genişliği: 60 karakter

---

## 7. Tasarım Dosyaları

### 7.1 Figma Prototipi
- Ana sayfa akışı
- Tüm sayfa tasarımları
- Bileşen kütüphanesi
- Prototip linki: [Eklenecek]

### 7.2 Icon Set
- Ionicons (varsayılan)
- Özel ikonlar: Kalsan logosu, kategori ikonları

### 7.3 Görseller
- Placeholder görselleri
- Empty state görselleri
- Error state görselleri

---

*Bu doküman HORECA Portal UI/UX tasarım spesifikasyonunu içermektedir.*
*Tarih: 2026-07-13*
*Versiyon: 1.0*