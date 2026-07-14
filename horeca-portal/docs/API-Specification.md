# API Specification

## HORECA Portal - REST API

**Base URL**: `http://localhost:3001/api`
**Version**: 1.0
**Format**: JSON

---

## Genel Bilgiler

### Authentication
Tüm korumalı endpoint'ler `Authorization` header'ı gerektirir:
```
Authorization: Bearer <jwt_token>
```

### Hata Formatı
```json
{
  "statusCode": 400,
  "message": ["Hata mesajı"],
  "error": "Bad Request"
}
```

### Standart Hata Kodları
| Kod | Anlam |
|-----|-------|
| 200 | Başarılı |
| 201 | Oluşturuldu |
| 400 | Geçersiz istek |
| 401 | Yetkilendirme hatası |
| 403 | Yasak |
| 404 | Bulunamadı |
| 409 | Çakışma |
| 500 | Sunucu hatası |

---

## 1. Authentication

### POST /auth/telegram-login
Telegram ile giriş yapma.

**Request Body**:
```json
{
  "initData": "string" // Telegram WebApp initData
}
```

**Response (200)**:
```json
{
  "user": {
    "id": "uuid",
    "telegramId": 123456789,
    "username": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "customer",
    "language": "uz"
  },
  "accessToken": "string",
  "refreshToken": "string"
}
```

### POST /auth/refresh
Token yenileme.

**Request Body**:
```json
{
  "refreshToken": "string"
}
```

**Response (200)**:
```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

### GET /auth/me
Mevcut kullanıcı bilgisi. (Kimlik doğrulaması gerekli)

**Response (200)**:
```json
{
  "id": "uuid",
  "telegramId": 123456789,
  "username": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "company": "string",
  "role": "customer",
  "language": "uz",
  "isActive": true,
  "createdAt": "2026-07-13T00:00:00Z"
}
```

---

## 2. Products

### GET /products
Ürün listesi.

**Query Parameters**:
| Parametre | Tip | Varsayılan | Açıklama |
|-----------|-----|------------|----------|
| page | number | 1 | Sayfa numarası |
| limit | number | 20 | Sayfa başına kayıt |
| search | string | - | Arama terimi |
| categoryId | uuid | - | Kategori filtresi |
| brandId | uuid | - | Marka filtresi |
| sortBy | string | createdAt | Sıralama alanı |
| sortOrder | string | DESC | Sıralama yönü |

**Response (200)**:
```json
{
  "items": [
    {
      "id": "uuid",
      "sku": "DET-001",
      "nameUz": "Premium Deterjan",
      "nameRu": "Премиум Детергент",
      "unit": "piece",
      "minQuantity": 1,
      "stockStatus": "in_stock",
      "category": {
        "id": "uuid",
        "nameUz": "Kimyasal Ürünler",
        "slug": "kimyasal"
      },
      "brand": {
        "id": "uuid",
        "name": "Kalsan",
        "logoUrl": "string"
      },
      "images": [
        {
          "id": "uuid",
          "imageUrl": "string",
          "isPrimary": true
        }
      ],
      "pricing": [
        {
          "id": "uuid",
          "sellingPrice": 2.50,
          "currency": "USD"
        }
      ]
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### GET /products/:id
Ürün detayı.

**Response (200)**:
```json
{
  "id": "uuid",
  "sku": "DET-001",
  "nameUz": "Premium Deterjan",
  "nameRu": "Премиум Детергент",
  "descriptionUz": "Yuqori sifatli deterjan",
  "descriptionRu": "Высококачественный детергент",
  "unit": "piece",
  "minQuantity": 1,
  "stockStatus": "in_stock",
  "category": {
    "id": "uuid",
    "nameUz": "Kimyasal Ürünler",
    "slug": "kimyasal"
  },
  "brand": {
    "id": "uuid",
    "name": "Kalsan",
    "logoUrl": "string"
  },
  "images": [
    {
      "id": "uuid",
      "imageUrl": "string",
      "altText": "Premium Deterjan",
      "isPrimary": true,
      "sortOrder": 0
    }
  ],
  "attributes": [
    {
      "id": "uuid",
      "attributeName": "Hacim",
      "attributeValue": "1L"
    }
  ],
  "pricing": [
    {
      "id": "uuid",
      "costPrice": 1.50,
      "currency": "USD",
      "additionalCosts": 0,
      "marginPercentage": 25,
      "sellingPrice": 2.50,
      "tiers": [
        {
          "id": "uuid",
          "minQuantity": 1,
          "maxQuantity": 10,
          "unitPrice": 2.50
        },
        {
          "id": "uuid",
          "minQuantity": 11,
          "maxQuantity": 50,
          "unitPrice": 2.30
        },
        {
          "id": "uuid",
          "minQuantity": 51,
          "maxQuantity": null,
          "unitPrice": 2.15
        }
      ]
    }
  ]
}
```

### GET /products/search
Ürün arama.

**Query Parameters**:
| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| q | string | Evet | Arama terimi |
| limit | number | Hayır | Sonuç limiti (varsayılan: 20) |

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "nameUz": "Premium Deterjan",
    "sku": "DET-001",
    "images": [...],
    "pricing": [...]
  }
]
```

### GET /products/:id/alternatives
Alternatif ürünler.

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "nameUz": "Alternatif Ürün",
    "images": [...],
    "pricing": [...]
  }
]
```

---

## 3. Categories

### GET /categories
Kategori listesi (hiyerarşik).

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "nameUz": "Kimyasal Ürünler",
    "nameRu": "Химические продукты",
    "slug": "kimyasal",
    "icon": "🧴",
    "sortOrder": 0,
    "children": [
      {
        "id": "uuid",
        "nameUz": "Bulaşık Deterjanı",
        "slug": "bulasik-deterjani",
        "icon": "🍽️"
      }
    ]
  }
]
```

### GET /categories/:slug
Kategori detayı ve ürünleri.

**Response (200)**:
```json
{
  "id": "uuid",
  "nameUz": "Kimyasal Ürünler",
  "slug": "kimyasal",
  "products": [...],
  "children": [...]
}
```

---

## 4. Brands

### GET /brands
Marka listesi.

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "name": "Kalsan",
    "slug": "kalsan",
    "logoUrl": "string",
    "description": "Yüksek kaliteli temizlik ürünleri"
  }
]
```

### GET /brands/:slug
Marka detayı ve ürünleri.

**Response (200)**:
```json
{
  "id": "uuid",
  "name": "Kalsan",
  "slug": "kalsan",
  "logoUrl": "string",
  "products": [...]
}
```

---

## 5. Cart

### GET /cart
Sepet içeriği. (Kimlik doğrulaması gerekli)

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "productId": "uuid",
    "quantity": 5,
    "unitPrice": 2.50,
    "totalPrice": 12.50,
    "note": "Acil teslimat",
    "product": {
      "id": "uuid",
      "nameUz": "Premium Deterjan",
      "images": [...]
    }
  }
]
```

### POST /cart
Sepete ürün ekle. (Kimlik doğrulaması gerekli)

**Request Body**:
```json
{
  "productId": "uuid",
  "quantity": 5,
  "note": "string"
}
```

**Response (201)**:
```json
{
  "id": "uuid",
  "productId": "uuid",
  "quantity": 5,
  "unitPrice": 2.50,
  "totalPrice": 12.50
}
```

### PUT /cart/:id
Sepet öğesini güncelle. (Kimlik doğrulaması gerekli)

**Request Body**:
```json
{
  "quantity": 10,
  "note": "Güncellenmiş not"
}
```

**Response (200)**:
```json
{
  "id": "uuid",
  "quantity": 10,
  "unitPrice": 2.50,
  "totalPrice": 25.00
}
```

### DELETE /cart/:id
Sepetten ürün çıkar. (Kimlik doğrulaması gerekli)

**Response (200)**:
```json
{
  "message": "Item removed from cart"
}
```

### DELETE /cart
Sepeti temizle. (Kimlik doğrulaması gerekli)

**Response (200)**:
```json
{
  "message": "Cart cleared"
}
```

---

## 6. Quotes

### GET /quotes
Kullanıcının teklifleri. (Kimlik doğrulaması gerekli)

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "quoteNumber": "Q260713-0001",
    "status": "pending",
    "totalAmount": 125.00,
    "currency": "USD",
    "customerNote": "Acil teslimat",
    "createdAt": "2026-07-13T10:00:00Z",
    "items": [
      {
        "id": "uuid",
        "productId": "uuid",
        "quantity": 50,
        "unitPrice": 2.50,
        "totalPrice": 125.00,
        "product": {
          "nameUz": "Premium Deterjan"
        }
      }
    ]
  }
]
```

### POST /quotes
Teklif oluştur ve gönder. (Kimlik doğrulaması gerekli)

**Request Body**:
```json
{
  "customerNote": "Lütfen pazartesi gününe kadar teslim edin"
}
```

**Response (201)**:
```json
{
  "id": "uuid",
  "quoteNumber": "Q260713-0001",
  "status": "pending",
  "totalAmount": 125.00,
  "items": [...]
}
```

### GET /quotes/:id
Teklif detayı. (Kimlik doğrulaması gerekli)

**Response (200)**:
```json
{
  "id": "uuid",
  "quoteNumber": "Q260713-0001",
  "status": "pending",
  "totalAmount": 125.00,
  "customerNote": "string",
  "adminNote": "string",
  "createdAt": "2026-07-13T10:00:00Z",
  "items": [...],
  "user": {
    "firstName": "Ahmad",
    "lastName": "Karimov",
    "company": "Hotel Tashkent"
  }
}
```

### POST /quotes/:id/repeat
Teklifi tekrarla. (Kimlik doğrulaması gerekli)

**Response (201)**:
```json
{
  "id": "uuid",
  "quoteNumber": "Q260713-0002",
  "status": "pending",
  "items": [...]
}
```

### PUT /quotes/:id/status
Teklif durumunu güncelle. (Admin, Kimlik doğrulaması gerekli)

**Request Body**:
```json
{
  "status": "processing",
  "adminNote": "Müşteriyle iletişime geçildi"
}
```

**Response (200)**:
```json
{
  "id": "uuid",
  "status": "processing",
  "adminNote": "string"
}
```

---

## 7. Favorites

### GET /favorites
Favori listesi. (Kimlik doğrulaması gerekli)

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "productId": "uuid",
    "product": {
      "id": "uuid",
      "nameUz": "Premium Deterjan",
      "images": [...],
      "pricing": [...]
    },
    "createdAt": "2026-07-13T10:00:00Z"
  }
]
```

### POST /favorites/:productId
Favoriye ekle. (Kimlik doğrulaması gerekli)

**Response (201)**:
```json
{
  "id": "uuid",
  "productId": "uuid"
}
```

### DELETE /favorites/:productId
Favoriden çıkar. (Kimlik doğrulaması gerekli)

**Response (200)**:
```json
{
  "message": "Removed from favorites"
}
```

---

## 8. Notifications

### GET /notifications
Bildirim listesi. (Kimlik doğrulaması gerekli)

**Query Parameters**:
| Parametre | Tip | Varsayılan | Açıklama |
|-----------|-----|------------|----------|
| unreadOnly | boolean | false | Sadece okunmamışlar |

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "type": "quote_status",
    "title": "Teklif Durumu Güncellendi",
    "message": "Teklif #Q260713-0001 durumu: İşleniyor",
    "isRead": false,
    "createdAt": "2026-07-13T10:00:00Z"
  }
]
```

### GET /notifications/unread-count
Okunmamış bildirim sayısı. (Kimlik doğrulaması gerekli)

**Response (200)**:
```json
{
  "count": 5
}
```

### PUT /notifications/:id/read
Bildirimi okundu işaretle. (Kimlik doğrulaması gerekli)

**Response (200)**:
```json
{
  "message": "Marked as read"
}
```

### PUT /notifications/read-all
Tümünü okundu işaretle. (Kimlik doğrulaması gerekli)

**Response (200)**:
```json
{
  "message": "All marked as read"
}
```

---

## 9. User

### GET /users/profile
Profil bilgisi. (Kimlik doğrulaması gerekli)

**Response (200)**:
```json
{
  "id": "uuid",
  "telegramId": 123456789,
  "firstName": "Ahmad",
  "lastName": "Karimov",
  "phone": "+998901234567",
  "company": "Hotel Tashkent",
  "language": "uz"
}
```

### PUT /users/profile
Profil güncelleme. (Kimlik doğrulaması gerekli)

**Request Body**:
```json
{
  "phone": "+998901234567",
  "company": "Hotel Tashkent",
  "language": "ru"
}
```

**Response (200)**:
```json
{
  "id": "uuid",
  "phone": "+998901234567",
  "company": "Hotel Tashkent",
  "language": "ru"
}
```

---

## 10. Admin

### GET /admin/dashboard
Dashboard istatistikleri. (Admin, Kimlik doğrulaması gerekli)

**Response (200)**:
```json
{
  "users": {
    "totalUsers": 150,
    "activeUsers": 120,
    "adminCount": 3
  },
  "products": {
    "totalProducts": 500,
    "activeProducts": 480,
    "outOfStock": 20
  },
  "categories": {
    "totalCategories": 25,
    "activeCategories": 25
  },
  "brands": {
    "totalBrands": 15,
    "activeBrands": 15
  },
  "quotes": {
    "totalQuotes": 300,
    "pendingQuotes": 25,
    "completedQuotes": 250,
    "totalAmount": 15000.00
  }
}
```

### GET /admin/quotes
Tüm teklifler. (Admin, Kimlik doğrulaması gerekli)

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "quoteNumber": "Q260713-0001",
    "status": "pending",
    "totalAmount": 125.00,
    "user": {
      "firstName": "Ahmad",
      "company": "Hotel Tashkent"
    },
    "createdAt": "2026-07-13T10:00:00Z"
  }
]
```

### PUT /admin/quotes/:id
Teklif durumunu güncelle. (Admin, Kimlik doğrulaması gerekli)

**Request Body**:
```json
{
  "status": "completed",
  "adminNote": "Ürünler teslim edildi"
}
```

**Response (200)**:
```json
{
  "id": "uuid",
  "status": "completed",
  "adminNote": "string"
}
```

---

## Rate Limiting

Tüm endpoint'ler için rate limiting uygulanır:
- **Limit**: 100 istek/dakika
- **Window**: 60 saniye

Aşıldığında hata yanıtı:
```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "error": "Too Many Requests"
}
```

---

## Pagination

Sayfalama gerektiren endpoint'ler için standart format:

**Query Parameters**:
| Parametre | Tip | Varsayılan | Açıklama |
|-----------|-----|------------|----------|
| page | number | 1 | Sayfa numarası |
| limit | number | 20 | Sayfa başına kayıt |

**Response**:
```json
{
  "items": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

*Bu doküman HORECA Portal API spesifikasyonunu tanımlamaktadır.*
*Tarih: 2026-07-13*
*Versiyon: 1.0*