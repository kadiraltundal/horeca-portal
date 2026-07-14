# Design Document — Uzbekistan Hotel CRM

## Overview

Bu sistem, Özbekistan'daki otellere B2B kimyasal ürün satışı yapan bir şirket için geliştirilmiş, tam kapsamlı bir Müşteri İlişkileri Yönetimi (CRM) platformudur.

### Temel Hedefler

- **Otel Dizini**: Özbekistan'daki tüm otellerin kapasite bazlı sıralı, aranabilir veritabanı
- **Satış Takibi**: 3 kimyasal ürün grubu bazında satış kaydı, durum takibi ve geçmiş analizi
- **Otomatik Keşif**: Yeni otelleri ve müşteri güncellemelerini tespit eden arka plan servisi
- **Çok Dilli Arayüz**: Özbek (Latin), Rusça, Türkçe ve İngilizce desteği
- **Rol Tabanlı Erişim**: Yönetici, Satış Temsilcisi, İzleyici rolleriyle granüler yetki kontrolü

### Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Backend | Node.js + NestJS (TypeScript) |
| Veritabanı | PostgreSQL 15+ |
| ORM | Prisma |
| Frontend | React 18 + TypeScript + Vite |
| UI Bileşen | shadcn/ui + Tailwind CSS |
| i18n | i18next |
| Arka Plan Servisleri | BullMQ (Redis) |
| Web Scraping | Playwright + Cheerio |
| Kimlik Doğrulama | JWT (Access + Refresh Token) |
| Test (Property) | fast-check (TypeScript) |
| Test (Unit/Integration) | Jest + Supertest |
| Konteyner | Docker + Docker Compose |


---

## Architecture

### Katmanlı Mimari

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React SPA)                   │
│    Otel Dizini | Satış | Raporlar | Ayarlar             │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS / REST API
┌──────────────────────────▼──────────────────────────────┐
│               NestJS API Gateway                         │
│   Auth Module | Hotel | Sales | Product | Reports       │
│   User Module | i18n  | Audit | Notification           │
└──────────┬────────────────────────┬─────────────────────┘
           │                        │ BullMQ Jobs
           │                        │
┌──────────▼──────────┐   ┌─────────▼─────────────────────┐
│    PostgreSQL DB     │   │    Research Service (Worker)   │
│  Hotels, Contacts   │   │  Hotel Discovery | Web Monitor │
│  Sales, Products    │   │  Industry News | Social Media  │
│  Users, Audit Logs  │   └────────────┬──────────────────┘
└─────────────────────┘                │ Redis (BullMQ)
                                       │
                        ┌──────────────▼──────────────────┐
                        │    External Data Sources         │
                        │  Booking platforms | Tourism dir │
                        │  News sources | Social media     │
                        └─────────────────────────────────┘
```

### Modül Yapısı (NestJS)

```
src/
├── modules/
│   ├── auth/          # JWT, oturum, şifre hashleme
│   ├── users/         # Kullanıcı CRUD, rol yönetimi
│   ├── hotels/        # Otel veritabanı, kapasite skoru, dışa aktarma
│   ├── contacts/      # İletişim profilleri, geçmiş
│   ├── products/      # Kimyasal gruplar, ürün kataloğu, fiyat geçmişi
│   ├── sales/         # Satış kaydı, durum makinesi, bildirimler
│   ├── research/      # Keşif servisi, sosyal medya izleme
│   ├── reports/       # Haftalık/aylık raporlar, dışa aktarma
│   ├── notifications/ # E-posta/dahili bildirim
│   ├── audit/         # Denetim günlüğü
│   └── i18n/          # Çeviri yönetimi
├── common/
│   ├── guards/        # JWT guard, Roles guard
│   ├── decorators/    # @Roles(), @CurrentUser()
│   ├── interceptors/  # Audit interceptor, Response transform
│   └── pipes/         # Validation pipe
└── config/            # Env config, Prisma service
```


---

## Components and Interfaces

### 1. Hotel Module

**HotelService** — temel otel CRUD ve iş mantığı

```typescript
interface IHotelService {
  create(dto: CreateHotelDto): Promise<Hotel>;
  findAll(filters: HotelFilterDto, pagination: PaginationDto): Promise<PaginatedResult<Hotel>>;
  findById(id: string): Promise<Hotel>;
  update(id: string, dto: UpdateHotelDto): Promise<Hotel>;
  softDelete(id: string): Promise<void>;
  exportToCsv(filters: HotelFilterDto): Promise<Buffer>;
  exportToExcel(filters: HotelFilterDto): Promise<Buffer>;
  calculateCapacityScore(roomCount: number, starRating: number): number;
}
```

**HotelFilterDto**

```typescript
interface HotelFilterDto {
  city?: string;
  starRating?: 1 | 2 | 3 | 4 | 5;
  category?: 'boutique' | 'city' | 'resort' | 'hostel';
  status?: 'CANDIDATE' | 'CUSTOMER' | 'PASSIVE';
  search?: string;         // ad veya şehirde arama
  sortBy?: 'capacityScore' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
```

### 2. Contact Module

```typescript
interface IContactService {
  addContact(hotelId: string, dto: CreateContactDto): Promise<Contact>;
  setPrimary(hotelId: string, contactId: string): Promise<void>;
  deleteContact(hotelId: string, contactId: string): Promise<void>;
  addCommunicationLog(contactId: string, dto: CommunicationLogDto): Promise<CommunicationLog>;
  getHistory(contactId: string): Promise<CommunicationLog[]>;
}
```

### 3. Product Module

```typescript
interface IProductService {
  createGroup(dto: CreateChemicalGroupDto): Promise<ChemicalGroup>;
  deactivateGroup(groupId: string): Promise<DeactivationResult>;
  addProduct(groupId: string, dto: CreateProductDto): Promise<Product>;
  updatePrice(productId: string, newPrice: number, currency: Currency): Promise<PriceHistory>;
  getPriceHistory(productId: string): Promise<PriceHistory[]>;
}
```

### 4. Sales Module

**Durum Makinesi (State Machine)**

```
TEKLIF → ONAYLANDI → TESLIM_EDILDI
    ↓         ↓
  IPTAL     IPTAL (yalnızca Yönetici)
```

```typescript
interface ISalesService {
  createRecord(dto: CreateSalesRecordDto): Promise<SalesRecord>;
  transitionStatus(id: string, newStatus: SalesStatus, userId: string): Promise<SalesRecord>;
  getHotelSalesHistory(hotelId: string): Promise<GroupedSalesHistory>;
  checkAndSendReminders(): Promise<void>;  // cron job
}
```

### 5. Research Service

```typescript
interface IResearchService {
  runDiscoveryCycle(): Promise<DiscoveryReport>;
  runMonitoringCycle(): Promise<MonitoringReport>;
  reviewQuarantine(recordId: string, action: 'approve' | 'reject'): Promise<void>;
  getQuarantineQueue(pagination: PaginationDto): Promise<PaginatedResult<QuarantineRecord>>;
}
```

### 6. Reports Module

```typescript
interface IReportsService {
  getWeeklySummary(weekDate: Date): Promise<WeeklySummaryReport>;
  getMonthlySalesByGroup(month: Date): Promise<MonthlyGroupReport[]>;
  getCustomRangeReport(from: Date, to: Date): Promise<CustomRangeReport>;
  exportToPdf(reportData: ReportData): Promise<Buffer>;
  exportToExcel(reportData: ReportData): Promise<Buffer>;
}
```

### 7. Auth Module

```typescript
interface IAuthService {
  login(credentials: LoginDto): Promise<TokenPair>;
  refreshToken(refreshToken: string): Promise<TokenPair>;
  logout(userId: string): Promise<void>;
  hashPassword(plain: string): Promise<string>;
  verifyPassword(plain: string, hash: string): Promise<boolean>;
}
```


---

## Data Models

### Prisma Schema (Ana Tablolar)

```prisma
model Hotel {
  id             String        @id @default(uuid())
  name           String
  city           String
  starRating     Int           // 1–5
  roomCount      Int
  category       HotelCategory
  status         HotelStatus   @default(CANDIDATE)
  capacityScore  Float         // hesaplanmış alan
  discoverySource String?      // "MANUAL" | "AUTO_DISCOVERY"
  discoveredAt   DateTime?
  websiteUrl     String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  deletedAt      DateTime?     // soft delete

  contacts       Contact[]
  salesRecords   SalesRecord[]
  activityLogs   ActivityLog[]
  monitoringStatus WebMonitorStatus?
}

enum HotelCategory { BOUTIQUE CITY RESORT HOSTEL }
enum HotelStatus   { CANDIDATE CUSTOMER PASSIVE }

model Contact {
  id               String    @id @default(uuid())
  hotelId          String
  fullName         String
  title            String?
  phone            String    // zorunlu, en az 1
  email            String?
  preferredLang    Lang      @default(EN)
  notes            String?
  isPrimary        Boolean   @default(false)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  hotel            Hotel     @relation(fields: [hotelId], references: [id])
  communicationLogs CommunicationLog[]
}

enum Lang { UZ RU TR EN }

model CommunicationLog {
  id        String          @id @default(uuid())
  contactId String
  type      CommType        // CALL | EMAIL | VISIT
  note      String
  createdAt DateTime        @default(now())
  createdBy String

  contact   Contact         @relation(fields: [contactId], references: [id])
}

enum CommType { CALL EMAIL VISIT }

model ChemicalGroup {
  id          String    @id @default(uuid())
  name        String
  description String?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  products    Product[]
}

model Product {
  id          String       @id @default(uuid())
  groupId     String
  code        String       @unique
  name        String
  unit        ProductUnit
  currentPrice Decimal
  currency    Currency     @default(UZS)
  isActive    Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  group       ChemicalGroup @relation(fields: [groupId], references: [id])
  priceHistory PriceHistory[]
  salesRecords SalesRecord[]
}

enum ProductUnit { LITER KG PIECE }
enum Currency    { UZS USD }

model PriceHistory {
  id          String    @id @default(uuid())
  productId   String
  oldPrice    Decimal
  newPrice    Decimal
  currency    Currency
  changedAt   DateTime  @default(now())
  changedById String

  product     Product   @relation(fields: [productId], references: [id])
  changedBy   User      @relation(fields: [changedById], references: [id])
}

model SalesRecord {
  id            String      @id @default(uuid())
  hotelId       String
  productId     String
  quantity      Decimal
  unitPrice     Decimal
  totalAmount   Decimal
  currency      Currency
  saleDate      DateTime
  assignedToId  String
  status        SalesStatus @default(TEKLIF)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  hotel         Hotel       @relation(fields: [hotelId], references: [id])
  product       Product     @relation(fields: [productId], references: [id])
  assignedTo    User        @relation(fields: [assignedToId], references: [id])
  statusHistory SalesStatusHistory[]
}

enum SalesStatus { TEKLIF ONAYLANDI TESLIM_EDILDI IPTAL }

model SalesStatusHistory {
  id           String      @id @default(uuid())
  salesId      String
  fromStatus   SalesStatus?
  toStatus     SalesStatus
  changedAt    DateTime    @default(now())
  changedById  String

  salesRecord  SalesRecord @relation(fields: [salesId], references: [id])
}

model User {
  id         String   @id @default(uuid())
  email      String   @unique
  password   String   // bcrypt hash
  fullName   String
  role       UserRole @default(SALES_REP)
  language   Lang     @default(EN)
  createdAt  DateTime @default(now())
  lastLogin  DateTime?
  isActive   Boolean  @default(true)
}

enum UserRole { ADMIN SALES_REP VIEWER }

model AuditLog {
  id         String   @id @default(uuid())
  userId     String
  action     String
  entity     String
  entityId   String
  oldValue   Json?
  newValue   Json?
  ip         String?
  createdAt  DateTime @default(now())
}

model QuarantineRecord {
  id          String           @id @default(uuid())
  rawData     Json
  source      String
  status      QuarantineStatus @default(PENDING)
  isConflict  Boolean          @default(false)
  conflictRef String?
  discoveredAt DateTime        @default(now())
  reviewedAt  DateTime?
  reviewedById String?
}

enum QuarantineStatus { PENDING APPROVED REJECTED }

model WebMonitorStatus {
  hotelId        String   @id
  isActive       Boolean  @default(true)
  lastCheckedAt  DateTime?
  lastChangeNote String?
  failedAttempts Int      @default(0)
  isUnreachable  Boolean  @default(false)

  hotel          Hotel    @relation(fields: [hotelId], references: [id])
}

model ActivityLog {
  id          String   @id @default(uuid())
  hotelId     String
  note        String
  source      String   // "SYSTEM" | "SALES_REP" | "RESEARCH_SERVICE"
  createdAt   DateTime @default(now())

  hotel       Hotel    @relation(fields: [hotelId], references: [id])
}
```


---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Otel Listesi Sıralama Invariantı

*For any* otel listesi, Kapasite_Skoru'na göre azalan sırada sıralandığında, listede bitişik herhangi iki öğe için birincinin kapasite skoru ikincinin kapasite skorundan büyük veya eşit olmalıdır.

**Validates: Requirements 1.2**

---

### Property 2: Filtre Tutarlılığı

*For any* otel listesi ve herhangi bir filtre kombinasyonu (şehir, yıldız, kategori, durum), filtreleme sonucu dönen tüm oteller seçilen filtre kriterlerini eksiksiz sağlamalıdır; filtre kriterini sağlamayan hiçbir otel sonuçlarda yer almamalıdır.

**Validates: Requirements 1.3**

---

### Property 3: Arama Büyük/Küçük Harf Duyarsızlığı

*For any* otel ismi ve bu ismin herhangi bir büyük/küçük harf varyasyonu (örn. "HILTON", "hilton", "HiLtOn"), arama sorgusu her iki formu da eşit şekilde bulmalıdır; eşleşme sonucu küçük/büyük harf durumundan bağımsız olmalıdır.

**Validates: Requirements 1.4**

---

### Property 4: Zorunlu Alan Doğrulama Bütünlüğü

*For any* otel adı veya şehir alanı boş ya da null olan girdi, sistem tarafından reddedilmeli ve hangi alanın eksik olduğunu açıklayan bir hata mesajı döndürülmelidir; hiçbir eksik-alanlı otel kaydı veritabanına yazılmamalıdır.

**Validates: Requirements 1.5**

---

### Property 5: CSV/Excel Dışa Aktarma Round-Trip

*For any* aktif filtre ve sıralama uygulanmış otel listesi, CSV veya Excel olarak dışa aktarıldığında, dışa aktarılan dosya içindeki kayıtlar o an ekranda görünen kayıtlarla birebir eşleşmelidir; dışa aktarma format değiştirmez, ekler veya çıkarmaz.

**Validates: Requirements 1.6**

---

### Property 6: Tek Birincil Profil Invariantı

*For any* otel ve o otele ait iletişim profilleri listesi, herhangi bir profil birincil (primary) olarak işaretlendiğinde, o otele ait profiller arasında tam olarak bir adet birincil profil bulunmalıdır; iki profilin aynı anda birincil olması mümkün olmamalıdır.

**Validates: Requirements 2.3**

---

### Property 7: İletişim Geçmişi Zaman Sırası Invariantı

*For any* iletişim profili ve ona ait iletişim geçmişi kayıtları, geçmiş tarihe göre azalan sırada listelendiğinde bitişik herhangi iki kayıt için birincinin tarihi ikincinin tarihine eşit veya daha sonra olmalıdır.

**Validates: Requirements 2.6**

---

### Property 8: Ürün Kodu Tekliği (Uniqueness)

*For any* mevcut ürün kodu ve o kodla aynı değeri taşıyan yeni bir ürün ekleme girişimi, sistem tarafından reddedilmeli; veritabanında aynı koda sahip iki veya daha fazla ürün bulunmamalıdır.

**Validates: Requirements 3.4**

---

### Property 9: Grup Pasifleştirme Cascade Invariantı

*For any* aktif kimyasal grup ve altındaki ürünler, grup pasife alındığında gruba ait tüm ürünler de pasife alınmalıdır; pasifleştirme sonrası grupta aktif kalan ürün sayısı sıfır olmalıdır.

**Validates: Requirements 3.3**

---

### Property 10: Fiyat Geçmişi Eksiksizliği

*For any* ürün ve yapılan fiyat değişikliği serisi, her değişiklik sonrasında fiyat geçmişindeki kayıt sayısı değişiklik sayısıyla eşleşmeli; hiçbir değişiklik geçmişten kaybolmamalıdır.

**Validates: Requirements 3.5**

---

### Property 11: Satış Kaydı Durum Geçişi Tarih Damgası Invariantı

*For any* satış kaydı ve uygulanan durum geçişleri serisi, her durum geçişi tarih damgasını içeren bir geçmiş kaydı oluşturmalıdır; geçmişteki kayıt sayısı toplam durum geçiş sayısına eşit olmalıdır.

**Validates: Requirements 4.2**

---

### Property 12: Aday Otel Otomatik Yükseltme

*For any* "Aday_Otel" statüsündeki otel üzerinde onaylanan (ONAYLANDI durumuna geçen) satış kaydı, o otelin durumu otomatik olarak "Müşteri_Otel"e yükseltilmelidir; onay sonrası otel hiçbir zaman "Aday" statüsünde kalmamalıdır.

**Validates: Requirements 4.3**

---

### Property 13: 90 Gün Hatırlatma Hesaplama Doğruluğu

*For any* son satış tarihi bilinen müşteri otel, sistemin hesapladığı "son satıştan bu yana geçen gün" değeri, gerçek tarih farkıyla tam olarak eşleşmeli; 90 günü aşan durumlarda hatırlatma bayrağı aktif, 90 gün veya altında ise pasif olmalıdır.

**Validates: Requirements 4.6**

---

### Property 14: Rapor Hesaplama Matematiksel Tutarlılık

*For any* tarih aralığı ve o aralığa ait satış kayıtları, haftalık ve aylık raporlarda gösterilen toplam satış tutarları ilgili satış kayıtlarının tek tek toplanmasıyla elde edilen değerle eşleşmeli; raporlama hesaplama hatası içermemelidir.

**Validates: Requirements 7.2, 7.3, 7.4**

---

### Property 15: Rol Tabanlı Erişim Kontrolü

*For any* kullanıcı-işlem çifti, kullanıcının rolü o işleme izin vermiyorsa istek reddedilmeli ve denetim günlüğüne kaydedilmelidir; yetkisiz bir kullanıcı hiçbir koşulda kısıtlı bir işlemi başarıyla gerçekleştirememelidir.

**Validates: Requirements 8.1, 8.4**

---

### Property 16: UTF-8 Veri Bütünlüğü Round-Trip

*For any* UTF-8 karakter kümesinden oluşan kullanıcı girişi (Özbek Kiril/Latin, Rusça, Türkçe, emoji, özel karakterler), veritabanına kaydedilip tekrar okunduğunda içerik bit-için-bit aynı kalmalıdır; karakter kayıpları veya bozulmaları olmamalıdır.

**Validates: Requirements 9.3**

---

### Property 17: Şifre Hashleme Güvenliği

*For any* düz metin şifre, sisteme kaydedildiğinde veritabanında yalnızca bcrypt hash değeri saklanmalıdır; düz metin şifrenin veritabanındaki herhangi bir alanda görünmemesi, ve aynı şifrenin iki farklı kaydedilişinin farklı hash üretmesi (salt nedeniyle) gerekir.

**Validates: Requirements 10.1**


---

## Error Handling

### Hata Sınıflandırması

| Hata Tipi | HTTP Kodu | Uygulama |
|-----------|-----------|----------|
| Doğrulama hatası (eksik/geçersiz alan) | 400 | Tüm create/update endpoint'leri |
| Kimlik doğrulama başarısız | 401 | Auth endpoint'leri |
| Yetkisiz işlem | 403 | Rol kontrolü |
| Kayıt bulunamadı | 404 | ID bazlı sorgular |
| Çakışma (duplicate key) | 409 | Ürün kodu, kullanıcı e-postası |
| İş kuralı ihlali | 422 | Durum geçişi, silme engeli |
| Sunucu hatası | 500 | Beklenmedik hatalar |

### Hata Yanıt Formatı

```typescript
interface ApiError {
  statusCode: number;
  message: string;         // kullanıcıya gösterilecek mesaj (i18n key)
  error: string;           // hata tipi
  field?: string;          // hangi alanda hata var
  details?: unknown;       // ek detay (geliştirme modunda)
  timestamp: string;
  path: string;
}
```

### Research Service Hata İzolasyonu

Dış servis hataları ana sistemi etkilememelidir:

```typescript
class ResearchService {
  async runDiscoveryCycle(): Promise<DiscoveryReport> {
    try {
      // Her kaynak bağımsız try-catch bloğunda
      const results = await Promise.allSettled([
        this.scrapeBookingPlatform().catch(e => this.logFailure('booking', e)),
        this.scrapeTourismDir().catch(e => this.logFailure('tourism', e)),
      ]);
      return this.buildReport(results);
    } catch (e) {
      // Tüm döngü çökse bile log'la ve devam et
      await this.systemLogger.error('discovery_cycle_failed', e);
      return this.buildEmptyReport();
    }
  }
}
```

### Dışa Veri Doğrulama (Karantina)

Araştırma servisinden gelen her veri `ExternalDataValidator` üzerinden geçer:

```typescript
interface ExternalDataValidator {
  validate(rawData: unknown): ValidationResult;
  // Beklenmedik format veya boyut → QUARANTINE
  // Geçerli format → APPROVED_FOR_IMPORT
  // Duplicate tespit → CONFLICT
}
```


---

## Testing Strategy

### Genel Yaklaşım

Bu sistem hem **örnek tabanlı (unit/integration)** hem de **property-based** testlerle kapsamlı şekilde test edilir. Property-based testler evrensel kuralları, unit testler spesifik senaryoları doğrular.

---

### Property-Based Testing (fast-check)

Property testleri `fast-check` kütüphanesiyle yazılır. Her test minimum **100 iterasyon** çalıştırır.

**Kütüphane**: [fast-check](https://github.com/dubzzz/fast-check) (TypeScript/JavaScript için en olgun PBT kütüphanesi)

**Tag Formatı**: Her test başına yorum satırı eklenir:
```
// Feature: uzbekistan-hotel-crm, Property {N}: {property_text}
```

**Örnek Property Testi**:

```typescript
import fc from 'fast-check';
import { sortHotelsByCapacityScore } from '../hotels/hotel.utils';

describe('Hotel Sorting Properties', () => {
  it('should maintain descending order for any hotel list', () => {
    // Feature: uzbekistan-hotel-crm, Property 1: Otel Listesi Sıralama Invariantı
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1 }),
            capacityScore: fc.float({ min: 0, max: 10000 }),
          }),
          { minLength: 0, maxLength: 200 }
        ),
        (hotels) => {
          const sorted = sortHotelsByCapacityScore(hotels);
          for (let i = 0; i < sorted.length - 1; i++) {
            expect(sorted[i].capacityScore).toBeGreaterThanOrEqual(sorted[i + 1].capacityScore);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

---

### Property Test Dosya Yapısı

```
src/
└── modules/
    ├── hotels/
    │   └── __tests__/
    │       ├── hotel.service.spec.ts        # Unit testler
    │       └── hotel.properties.spec.ts     # Property testler (P1-P5)
    ├── contacts/
    │   └── __tests__/
    │       └── contact.properties.spec.ts   # Property testler (P6-P7)
    ├── products/
    │   └── __tests__/
    │       └── product.properties.spec.ts   # Property testler (P8-P10)
    ├── sales/
    │   └── __tests__/
    │       └── sales.properties.spec.ts     # Property testler (P11-P13)
    ├── reports/
    │   └── __tests__/
    │       └── reports.properties.spec.ts   # Property testler (P14)
    ├── auth/
    │   └── __tests__/
    │       └── auth.properties.spec.ts      # Property testler (P17)
    └── users/
        └── __tests__/
            └── rbac.properties.spec.ts      # Property testler (P15)
```

---

### Unit Test Kapsamı (Örnek Tabanlı)

| Modül | Test Senaryoları |
|-------|-----------------|
| hotels | Zorunlu alan eksikliği, şehir filtresi, export format |
| contacts | Tek profil silme engeli, telefon formatı (+998) |
| products | Grup limiti (max 3), duplicate kod, pasifleştirme cascade |
| sales | Durum makinesi geçişleri, "Teslim Edildi" iptal kilidi |
| auth | Giriş başarısız, token yenileme, oturum zaman aşımı |
| research | Karantina onay/red, çakışma tespiti |
| i18n | Eksik çeviri fallback (İngilizce → anahtar adı) |

---

### Integration Testleri

Dış servislere bağımlı senaryolar için 1–3 örnek içeren integration testler:

```typescript
describe('Research Service Integration', () => {
  it('should quarantine malformed external data', async () => {
    // Feature: uzbekistan-hotel-crm, Integration: External data validation
    const malformedData = { unexpected_field: true, size: 'very_large_payload'.repeat(10000) };
    const result = await researchService.processExternalRecord(malformedData);
    expect(result.status).toBe('QUARANTINED');
  });
});
```

---

### Smoke Testleri

Altyapı kurulum kontrolleri:

- Veritabanı bağlantısı aktif
- Redis bağlantısı aktif (BullMQ)
- Yedekleme cron job kayıtlı
- Araştırma servisi çalışma döngüsü kayıtlı
- JWT anahtar çifti geçerli

---

### Test Konfigürasyonu

```json
// jest.config.js
{
  "testTimeout": 30000,
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 85,
      "lines": 85,
      "statements": 85
    }
  }
}
```

```typescript
// fast-check global config (jest.setup.ts)
import fc from 'fast-check';
fc.configureGlobal({ numRuns: 100, verbose: true });
```

---

### Frontend Test Stratejisi

- **Snapshot testleri**: Bileşen render çıktılarının beklenmedik şekilde değişmemesi
- **i18n testleri**: Tüm dillerde anahtar çevirilerinin mevcut olduğunun kontrolü
- **Visual regression**: Temel ekranlar için screenshot karşılaştırması (Playwright)
- **E2E**: Kritik iş akışları (otel ekleme, satış kayıt, dil değişimi)

