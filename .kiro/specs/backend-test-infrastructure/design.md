# Backend Test Infrastructure Bugfix Design

## Overview

Market QR backend uygulaması için eksik olan test altyapısının eksiksiz şekilde kurulması. 29 NestJS modülü için unit testler (service + controller) ve e2e testler oluşturulacak, Jest konfigürasyonu yapılandırılacak ve %80+ test coverage hedefine ulaşılacak. Bu düzeltme, kod kalitesi kontrolünü sağlayacak, regresyon tespitini mümkün kılacak ve CI/CD pipeline'da test aşamasının başarıyla çalışmasını garantileyecek.

## Glossary

- **Bug_Condition (C)**: Test altyapısının olmadığı durum - Jest config eksik, test dosyaları yok, test scriptleri çalışmıyor
- **Property (P)**: Test altyapısının tam olarak çalışır halde olması - tüm testler geçmeli, coverage %80+ olmalı
- **Preservation**: Mevcut backend işlevselliğinin (API endpoints, authentication, database operations, build process) değişmeden korunması
- **Unit Test**: Service ve controller'ların izole şekilde test edilmesi (@nestjs/testing ile mock dependencies)
- **E2E Test**: API endpoint'lerinin entegrasyon testleri (gerçek HTTP request'ler ile)
- **Jest**: JavaScript testing framework (NestJS'in varsayılan test aracı)
- **@nestjs/testing**: NestJS için test utilities (Test modülü oluşturma, dependency injection)
- **Test Coverage**: Kodun ne kadarının testlerle kapsandığı (satır, branch, fonksiyon coverage)
- **29 Modül**: auth, users, products, categories, stores, inventory, orders, payments, analytics, notifications, qr, organizations, batches, pricing, promotions, loyalty, customers, media, cms, scan, audit, scheduler, dashboard, suppliers, stock-movement, purchase-order, refund, cash-drawer, z-report

## Bug Details

### Bug Condition

Test altyapısı tamamen eksik olduğunda bug ortaya çıkıyor. Backend uygulamasında 29 modül bulunmasına rağmen hiçbir test dosyası (.spec.ts) yok, Jest konfigürasyonu tanımlı değil ve test komutları çalışmıyor. Bu durum, kod değişikliklerinde regresyon tespitini imkansız hale getiriyor ve üretim ortamına hatalı kod deploy edilme riskini artırıyor.

**Formal Specification:**
```
FUNCTION isBugCondition(backendProject)
  INPUT: backendProject of type NestJSProject
  OUTPUT: boolean
  
  RETURN NOT fileExists(backendProject.root + "/jest.config.js")
         AND testFileCount(backendProject.root + "/src/modules/**/*.spec.ts") == 0
         AND NOT directoryExists(backendProject.root + "/test")
         AND runCommand("npm test").exitCode != 0
         AND testCoverage(backendProject) == 0
END FUNCTION
```

### Examples

- **Örnek 1**: `npm test` komutu çalıştırıldığında → "No tests found, exiting with code 1" hatası alınıyor (beklenen: testler çalışmalı)
- **Örnek 2**: `backend/src/modules/auth/` dizini kontrol edildiğinde → auth.service.spec.ts ve auth.controller.spec.ts dosyaları yok (beklenen: test dosyaları mevcut olmalı)
- **Örnek 3**: `npm run test:e2e` çalıştırıldığında → test/jest-e2e.json bulunamıyor hatası (beklenen: e2e testler çalışmalı)
- **Örnek 4**: CI/CD pipeline test aşaması → test stage fail ediyor (beklenen: tüm testler pass etmeli)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Tüm API endpoint'leri aynı şekilde çalışmaya devam etmeli (auth, CRUD operations, business logic)
- Prisma + SQLite database entegrasyonu etkilenmemeli
- JWT authentication ve authorization mekanizmaları değişmemeli
- Production build süreci (`npm run build`) başarıyla çalışmalı
- Development mode hot-reload (`npm run dev`) korunmalı
- Diğer npm scriptleri (lint, start, start:prod) etkilenmemeli

**Scope:**
Test altyapısı kurulumu yapılırken, mevcut backend kodunda (service'ler, controller'lar, guard'lar, interceptor'lar) hiçbir mantık değişikliği yapılmamalı. Test dosyaları ve konfigürasyonlar sadece yeni dosyalar olarak eklenmelidir.

## Hypothesized Root Cause

Test altyapısının eksik olmasının nedenleri:

1. **Jest Configuration Eksik**: Proje başlangıcında jest.config.js dosyası oluşturulmamış
   - TypeScript path mapping yapılandırması eksik
   - Coverage threshold tanımları yok
   - Test environment ayarları tanımlı değil

2. **Test Dosyaları Oluşturulmamış**: 29 modül için hiçbir .spec.ts dosyası yazılmamış
   - Service testleri eksik (business logic test edilemiyor)
   - Controller testleri eksik (endpoint testleri yok)
   - Her modül için ~2 test dosyası gerekli (58 dosya eksik)

3. **E2E Test Infrastructure Yok**: test/ klasörü ve jest-e2e.json config'i mevcut değil
   - API endpoint integration testleri yapılamıyor
   - End-to-end flow testleri eksik

4. **Package.json Test Scripts Hatalı**: Test komutları jest ile çalışmıyor
   - @nestjs/testing kurulu ama kullanılmıyor
   - jest ve ts-jest bağımlılıkları eksik olabilir

## Correctness Properties

Property 1: Bug Condition - Test Infrastructure Fully Operational

_For any_ backend projesi where test altyapısı kurulmuş ve yapılandırılmış olduğunda, `npm test` komutu çalıştırıldığında tüm unit testler başarıyla execute edilmeli, her modül için test coverage hesaplanmalı ve %80+ coverage hedefine ulaşılmalı. Ayrıca `npm run test:e2e` komutu e2e testleri başarıyla çalıştırmalı ve test sonuçları raporlanmalıdır.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8**

Property 2: Preservation - Backend Functionality Unchanged

_For any_ backend işlevselliği (API endpoints, authentication, database operations, build scripts) where test altyapısı kurulmadan önce çalışır durumdaysa, test altyapısı kurulduktan sonra aynı işlevsellikler aynı şekilde çalışmaya devam etmelidir. Hiçbir API endpoint'inin davranışı değişmemeli, production build başarıyla oluşturulmalı ve development mode düzgün çalışmalıdır.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

## Fix Implementation

### Changes Required

Test altyapısının eksiksiz şekilde kurulması için aşağıdaki değişiklikler yapılmalıdır:

**1. Jest Configuration Setup**

**File**: `apps/backend/jest.config.js`

**Specific Changes**:
1. **Jest Config Oluşturma**: Root seviyesinde jest.config.js dosyası oluşturulmalı
   - moduleNameMapper: TypeScript path alias'ları tanımlanmalı (@modules, @common, @config)
   - testRegex: .spec.ts dosyalarını tespit edecek şekilde ayarlanmalı
   - collectCoverageFrom: src/**/*.ts dosyaları için coverage toplanmalı
   - coverageThreshold: global %80 threshold tanımlanmalı
   - testEnvironment: node olarak ayarlanmalı

2. **TypeScript Path Mapping**: tsconfig.json paths ile uyumlu mapping yapılmalı
   - '@modules/(.*)': '<rootDir>/src/modules/$1'
   - '@common/(.*)': '<rootDir>/src/common/$1'
   - '@config/(.*)': '<rootDir>/src/config/$1'

**2. E2E Test Infrastructure**

**Directory**: `apps/backend/test/`

**Specific Changes**:
1. **test/ Klasörü Oluşturma**: E2E testler için ayrı klasör yapısı
   - test/jest-e2e.json: E2E testler için ayrı Jest config
   - test/app.e2e-spec.ts: Ana uygulama health check e2e testi
   - test/auth.e2e-spec.ts: Authentication flow e2e testleri

2. **E2E Test Config**: jest-e2e.json özel ayarları
   - testRegex: .e2e-spec.ts pattern'i
   - maxWorkers: 1 (database isolation için)
   - testTimeout: 30000 (API request'ler için yeterli süre)

**3. Unit Test Files for All Modules**

**Pattern**: `apps/backend/src/modules/{module-name}/{file}.spec.ts`

**Specific Changes**:
1. **Service Test Files**: Her modülün service'i için .spec.ts dosyası
   - Mock PrismaService dependency injection
   - CRUD operations test coverage
   - Business logic edge cases testleri
   - Error handling scenarios

2. **Controller Test Files**: Her modülün controller'ı için .spec.ts dosyası
   - Mock Service dependency injection
   - HTTP request/response testleri
   - Guard ve decorator testleri
   - DTO validation testleri

3. **29 Modül İçin Test Dosyaları**:
   - auth: auth.service.spec.ts, auth.controller.spec.ts, jwt.strategy.spec.ts
   - users: users.service.spec.ts, users.controller.spec.ts
   - products: products.service.spec.ts, products.controller.spec.ts
   - categories: categories.service.spec.ts, categories.controller.spec.ts
   - stores: stores.service.spec.ts, stores.controller.spec.ts
   - inventory: inventory.service.spec.ts, inventory.controller.spec.ts
   - orders: orders.service.spec.ts, orders.controller.spec.ts
   - payments: payments.service.spec.ts, payments.controller.spec.ts
   - analytics: analytics.service.spec.ts (controller yoksa sadece service)
   - notifications: notifications.service.spec.ts, notifications.controller.spec.ts
   - qr: qr.service.spec.ts, qr.controller.spec.ts
   - organizations: organizations.service.spec.ts, organizations.controller.spec.ts
   - batches: batches.service.spec.ts, batches.controller.spec.ts
   - pricing: pricing.service.spec.ts, pricing.controller.spec.ts
   - promotions: promotions.service.spec.ts, promotions.controller.spec.ts
   - loyalty: loyalty.service.spec.ts, loyalty.controller.spec.ts
   - customers: customers.service.spec.ts, customers.controller.spec.ts
   - media: media.service.spec.ts, media.controller.spec.ts
   - cms: cms.service.spec.ts, cms.controller.spec.ts
   - scan: scan.service.spec.ts, scan.controller.spec.ts
   - audit: audit.service.spec.ts, audit.controller.spec.ts
   - scheduler: scheduler.service.spec.ts (controller yoksa sadece service)
   - dashboard: dashboard.service.spec.ts, dashboard.controller.spec.ts
   - suppliers: suppliers.service.spec.ts, suppliers.controller.spec.ts
   - stock-movement: stock-movement.service.spec.ts, stock-movement.controller.spec.ts
   - purchase-order: purchase-order.service.spec.ts, purchase-order.controller.spec.ts
   - refund: refund.service.spec.ts, refund.controller.spec.ts
   - cash-drawer: cash-drawer.service.spec.ts, cash-drawer.controller.spec.ts
   - z-report: z-report.service.spec.ts, z-report.controller.spec.ts

**4. Package.json Dependencies**

**File**: `apps/backend/package.json`

**Specific Changes**:
1. **DevDependencies Ekleme**: Test için gerekli paketler
   - jest: ^29.7.0 (zaten varsa versiyon kontrolü)
   - ts-jest: ^29.1.0 (TypeScript desteği için)
   - @types/jest: ^29.5.0 (TypeScript type definitions)

2. **Test Scripts Güncelleme**: package.json scripts bölümü
   - "test": "jest" (unit testler)
   - "test:watch": "jest --watch" (development için)
   - "test:cov": "jest --coverage" (coverage report)
   - "test:e2e": "jest --config ./test/jest-e2e.json" (e2e testler)

**5. Common Test Utilities**

**File**: `apps/backend/src/common/test/test-utils.ts`

**Specific Changes**:
1. **Mock Factory Functions**: Yeniden kullanılabilir mock'lar
   - createMockPrismaService(): PrismaService mock factory
   - createMockConfigService(): ConfigService mock factory
   - createMockJwtService(): JwtService mock factory

2. **Test Data Builders**: Test data oluşturma helper'ları
   - createTestUser(): Test user nesnesi
   - createTestProduct(): Test product nesnesi
   - createTestOrder(): Test order nesnesi

## Testing Strategy

### Validation Approach

Test altyapısı kurulumu iki aşamalı bir validation stratejisi izleyecek: önce mevcut backend işlevselliğini koruyarak (preservation) test infrastructure'ı kuracak, ardından tüm modüller için comprehensive testler yazarak %80+ coverage hedefine ulaşacak.

### Exploratory Bug Condition Checking

**Goal**: Test altyapısı kurulmadan ÖNCE mevcut backend kodunun durumunu tespit etmek. Hangi modüllerde service/controller var, hangi business logic test edilmesi gerekiyor, hangi API endpoint'leri aktif olduğunu belirlemek.

**Test Plan**: 
1. Her modülü manuel olarak inspect et (service + controller dosyalarını kontrol et)
2. API endpoint'lerini listele (controller decorator'larından route'ları çıkar)
3. Database schema'yı analiz et (Prisma schema'dan entity'leri tespit et)
4. Mock dependencies listesini çıkar (her service'in constructor'ındaki dependencies)

**Test Cases**:
1. **Module Structure Analysis**: Her modül için service + controller kombinasyonunu tespit et
2. **Dependency Mapping**: Her service'in hangi dependency'lere ihtiyacı olduğunu listele (PrismaService, ConfigService, vb.)
3. **Route Inventory**: Tüm HTTP endpoint'lerini ve method'larını (GET, POST, PUT, DELETE) kaydet
4. **Business Logic Identification**: Her service'teki kritik method'ları belirle (CRUD + business logic)

**Expected Findings**:
- 29 modülün her birinde en az 1 service, çoğunda 1 controller olduğu görülecek
- PrismaService'in hemen hemen tüm service'lerde dependency olduğu tespit edilecek
- Auth modülünde JwtStrategy, guards ve decorator'lar olduğu görülecek
- Her modülde DTO'lar olduğu ve validation kullanıldığı anlaşılacak

### Fix Checking

**Goal**: Test altyapısı kurulduktan sonra, tüm testlerin başarıyla çalıştığını ve coverage hedefine ulaşıldığını doğrulamak.

**Pseudocode:**
```
FOR ALL module IN backend.modules DO
  testFiles := findTestFiles(module)
  ASSERT testFiles.count >= 1  // En az bir test dosyası olmalı
  
  testResults := runTests(testFiles)
  ASSERT testResults.allPassed == true
  
  coverage := calculateCoverage(module)
  ASSERT coverage >= 80  // %80+ coverage hedefi
END FOR

e2eResults := runE2ETests()
ASSERT e2eResults.allPassed == true

jestConfig := readFile("jest.config.js")
ASSERT jestConfig.exists == true
ASSERT jestConfig.coverageThreshold.global.statements >= 80
```

**Validation Steps**:
1. `npm test` çalıştır → tüm unit testler pass etmeli
2. `npm run test:cov` çalıştır → coverage %80+ olmalı
3. `npm run test:e2e` çalıştır → e2e testler pass etmeli
4. Coverage report kontrol et → her modül için individual coverage görülmeli

### Preservation Checking

**Goal**: Test altyapısı kurulurken, mevcut backend işlevselliğinin hiçbir şekilde değişmediğini doğrulamak.

**Pseudocode:**
```
// Backend çalıştırma testleri
ASSERT runCommand("npm run dev").startsSuccessfully == true
ASSERT runCommand("npm run build").exitCode == 0
ASSERT runCommand("npm run start:prod").startsSuccessfully == true

// API endpoint testleri (test altyapısı öncesi ve sonrası karşılaştırma)
FOR ALL endpoint IN apiEndpoints DO
  responseBefore := callEndpoint_Before(endpoint)
  responseAfter := callEndpoint_After(endpoint)
  ASSERT responseBefore.statusCode == responseAfter.statusCode
  ASSERT responseBefore.body == responseAfter.body
END FOR

// Database operations testleri
FOR ALL entity IN databaseEntities DO
  ASSERT crudOperations(entity).workAsExpected == true
END FOR

// Authentication testleri
ASSERT jwtTokenGeneration().works == true
ASSERT jwtTokenValidation().works == true
ASSERT authGuards().workAsExpected == true
```

**Testing Approach**: Property-based testing önerilmez çünkü preservation checking'de manuel verification daha güvenilir. Bunun yerine:
- Backend'i test altyapısı kurmadan önce local'de çalıştır ve tüm endpoint'leri Postman/Insomnia ile test et
- Test altyapısı kurduktan sonra aynı testleri tekrar çalıştır ve response'ları karşılaştır
- CI/CD pipeline'da build sürecinin başarılı olduğunu doğrula

**Test Plan**: 
1. **Pre-Implementation Baseline**: Test altyapısı kurmadan önce
   - Backend'i başlat (`npm run dev`)
   - Health check endpoint'ini çağır (GET /health)
   - Sample API endpoint'lerini test et (auth/login, products, orders)
   - Response'ları kaydet (snapshot)

2. **Post-Implementation Validation**: Test altyapısı kurduktan sonra
   - Backend'i tekrar başlat
   - Aynı endpoint'leri çağır
   - Response'ları karşılaştır (snapshot match kontrolü)
   - Build process'i çalıştır (`npm run build`)
   - Production mode'da başlat (`npm run start:prod`)

**Test Cases**:
1. **Development Mode Preservation**: `npm run dev` komutu hot-reload ile çalışmaya devam etmeli
2. **Production Build Preservation**: `npm run build` başarıyla dist/ klasörü oluşturmalı
3. **API Endpoint Preservation**: Tüm endpoint'ler aynı response'ları dönmeli
4. **Authentication Preservation**: JWT token üretimi ve validation çalışmalı
5. **Database Operations Preservation**: CRUD işlemleri aynı şekilde çalışmalı
6. **Lint Script Preservation**: `npm run lint` komutu etkilenmemeli

### Unit Tests

Her modül için unit testler aşağıdaki kategorilerde yazılacak:

**Service Tests**:
- **CRUD Operations**: create, findAll, findOne, update, delete method'larının testleri
- **Business Logic**: Her service'e özel business logic method'larının testleri
- **Error Handling**: Exception scenarios (not found, validation error, database error)
- **Edge Cases**: Empty results, null values, boundary conditions

**Controller Tests**:
- **HTTP Endpoints**: Her route'un (GET, POST, PUT, DELETE) test edilmesi
- **Request Validation**: DTO validation'ların test edilmesi
- **Guard Tests**: Authentication/authorization guard'ların test edilmesi
- **Response Formatting**: Response DTO'ların doğru formatta dönmesi

**Mock Strategy**:
- PrismaService: findUnique, findMany, create, update, delete method'ları mock'lanacak
- External Services: Email, notification, payment gateway gibi external service'ler mock'lanacak
- ConfigService: Environment variables mock'lanacak

### Property-Based Tests

Property-based testing bu bugfix için önerilmez çünkü:
- Test infrastructure kurulumu deterministik bir süreç (property-based testing stochastic input'lar için uygun)
- Her modülün unit testleri explicit test case'lerle daha net test edilebilir
- Coverage hedefi (%80+) deterministic unit testlerle daha kolay achieve edilir

Ancak future work olarak, bazı business logic method'larında property-based testing kullanılabilir:
- Pricing calculations: fiyat hesaplamalarında çeşitli input kombinasyonları
- Inventory calculations: stok hareketlerinde random operation sequence'ları
- Order totals: sipariş toplamlarında çeşitli ürün kombinasyonları

### Integration Tests

E2E testler aşağıdaki kategorilerde yazılacak:

**Authentication Flow**:
- User registration → login → JWT token alma → authenticated endpoint'e istek
- Invalid credentials → error response
- Token expiration → refresh token flow

**CRUD Flow Tests**:
- Product management: create product → list products → update product → delete product
- Order management: create order → add items → calculate total → payment → order completion
- Inventory management: receive stock → allocate to order → track movements

**API Endpoint Integration**:
- Multiple modules interaction: Order oluştururken product, inventory, customer module'lerinin birlikte çalışması
- Database transaction testing: Rollback scenarios
- Error propagation: Bir module'de hata olduğunda diğerlerinin nasıl etkilendiği

**CI/CD Integration**:
- Test stage'in pipeline'da başarıyla çalışması
- Coverage report'un artifact olarak kaydedilmesi
- Test failure durumunda pipeline'ın fail etmesi
