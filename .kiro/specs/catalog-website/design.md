# Tasarım Belgesi

## Genel Bakış

Katalog web sitesi, Next.js 14 kullanılarak geliştirilecek modern bir portfolyo uygulamasıdır. Statik site oluşturma (SSG) yaklaşımı ile yüksek performans ve SEO optimizasyonu sağlanacaktır. Tasarım, minimalist ve temiz bir estetik ile projeleri görsel olarak sergilemeye odaklanır.

### Teknoloji Yığını

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **İçerik**: JSON/Markdown dosyaları
- **Görsel Optimizasyonu**: Next.js Image component
- **Deployment**: Vercel (önerilir) veya statik hosting
- **Dil**: TypeScript

## Mimari

### Genel Mimari

Sistem, JAMstack mimarisini takip eder - JavaScript, APIs, ve Markup. Build zamanında tüm içerik statik HTML'e dönüştürülür.

```
┌─────────────────────────────────────────┐
│         Content Layer                    │
│  (JSON/Markdown dosyaları)              │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│      Build Process (Next.js)            │
│  - İçerik parse                          │
│  - Doğrulama                             │
│  - Statik sayfa oluşturma               │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│       Static Output                      │
│  - HTML sayfaları                        │
│  - Optimize edilmiş görseller           │
│  - CSS/JS bundle                         │
└─────────────────────────────────────────┘
```

### Dizin Yapısı

```
catalog-website/
├── app/
│   ├── page.tsx              # Ana katalog sayfası
│   ├── layout.tsx            # Root layout
│   ├── projects/
│   │   └── [slug]/
│   │       └── page.tsx      # Proje detay sayfası
│   └── globals.css           # Global stiller
├── components/
│   ├── ProjectGrid.tsx       # Proje grid bileşeni
│   ├── ProjectCard.tsx       # Tek proje kartı
│   ├── ProjectDetail.tsx     # Proje detay görünümü
│   └── ImageGallery.tsx      # Görsel galeri
├── lib/
│   ├── projects.ts           # Proje verisi yükleme
│   └── types.ts              # TypeScript tipleri
├── content/
│   └── projects/
│       ├── project-1.json
│       ├── project-2.json
│       └── ...
├── public/
│   └── images/
│       ├── project-1/
│       ├── project-2/
│       └── ...
└── package.json
```

## Bileşenler ve Arayüzler

### Veri Modelleri

```typescript
interface Project {
  slug: string;           // URL için unique identifier
  title: string;          // Proje başlığı
  description: string;    // Kısa açıklama
  fullDescription: string; // Detaylı açıklama
  coverImage: string;     // Ana görsel path
  images: string[];       // Tüm görsellerin path'leri
  date: string;           // ISO 8601 format
  tags?: string[];        // Opsiyonel etiketler
}

interface ProjectsData {
  projects: Project[];
}
```

### Ana Bileşenler

#### 1. ProjectGrid Component

Ana katalog sayfasında projeleri responsive grid düzeninde gösteren bileşen.

```typescript
interface ProjectGridProps {
  projects: Project[];
}

// Davranış:
// - CSS Grid kullanarak responsive düzen
// - Mobil: 1 sütun
// - Tablet: 2 sütun
// - Desktop: 3-4 sütun
// - Her proje için ProjectCard render eder
```

#### 2. ProjectCard Component

Grid'de görünen tek bir proje kartı.

```typescript
interface ProjectCardProps {
  project: Project;
}

// Davranış:
// - Cover image gösterir (Next.js Image ile optimize)
// - Proje başlığını gösterir
// - Hover efekti (scale ve overlay)
// - Tıklanabilir, proje detay sayfasına link
```

#### 3. ProjectDetail Component

Proje detay sayfasında gösterilen içerik.

```typescript
interface ProjectDetailProps {
  project: Project;
}

// Davranış:
// - Başlık ve full description
// - ImageGallery ile tüm görselleri gösterir
// - "Geri" butonu katalog sayfasına döner
```

#### 4. ImageGallery Component

Proje detayında birden fazla görseli gösteren galeri.

```typescript
interface ImageGalleryProps {
  images: string[];
  alt: string;
}

// Davranış:
// - Grid düzeninde görseller
// - Lazy loading
// - Responsive boyutlandırma
// - Opsiyonel: lightbox özelliği
```

### Utility Functions

#### Content Loader (`lib/projects.ts`)

```typescript
// İçerik dosyalarını okur ve parse eder
export async function getAllProjects(): Promise<Project[]>

// Slug'a göre tek bir proje döner
export async function getProjectBySlug(slug: string): Promise<Project | null>

// İçerik doğrulama
function validateProject(project: any): boolean
```

## Veri Modelleri

### İçerik Dosya Formatı (JSON)

```json
{
  "slug": "modern-branding",
  "title": "Modern Branding Projesi",
  "description": "Bir teknoloji şirketi için kapsamlı marka kimliği çalışması",
  "fullDescription": "Bu proje, yeni kurulan bir teknoloji şirketi için komple marka kimliği oluşturulmasını içeriyordu. Logo tasarımı, renk paleti, tipografi seçimi ve marka rehberi hazırlandı.",
  "coverImage": "/images/modern-branding/cover.jpg",
  "images": [
    "/images/modern-branding/cover.jpg",
    "/images/modern-branding/logo.jpg",
    "/images/modern-branding/colors.jpg",
    "/images/modern-branding/mockups.jpg"
  ],
  "date": "2024-01-15",
  "tags": ["branding", "logo", "identity"]
}
```

### Doğrulama Kuralları

Build zamanında her proje dosyası şu kurallara göre doğrulanır:

- `slug`: Zorunlu, benzersiz, URL-safe string
- `title`: Zorunlu, boş olmayan string
- `description`: Zorunlu, boş olmayan string
- `fullDescription`: Zorunlu, boş olmayan string
- `coverImage`: Zorunlu, geçerli path, dosya mevcut olmalı
- `images`: Zorunlu array, en az 1 eleman, tüm pathler geçerli olmalı
- `date`: Zorunlu, geçerli ISO 8601 format
- `tags`: Opsiyonel array


## Doğruluk Özellikleri (Correctness Properties)

*Bir property (özellik), sistemin tüm geçerli çalıştırmalarında doğru olması gereken bir karakteristik veya davranıştır - temelde, sistemin ne yapması gerektiği hakkında formal bir ifade. Property'ler, insan tarafından okunabilir spesifikasyonlar ile makine tarafından doğrulanabilir doğruluk garantileri arasında köprü görevi görür.*

### Property 1: Grid Tüm Projeleri Gösterir

*Herhangi bir* proje listesi için, katalog sayfası render edildiğinde, çıktıdaki proje sayısı input listesindeki proje sayısına eşit olmalıdır.

**Doğrular: Gereksinim 1.1**

### Property 2: Her Proje Kartı Gerekli İçeriği Gösterir

*Herhangi bir* proje için, ProjectCard bileşeni render edildiğinde, çıktı hem cover image hem de title içermelidir.

**Doğrular: Gereksinim 1.2**

### Property 3: Responsive Grid Davranışı

*Herhangi bir* viewport genişliği için:
- 320-767px aralığında: grid 1 sütun olmalı
- 768-1023px aralığında: grid 2 sütun olmalı  
- 1024px ve üzeri: grid 3 veya 4 sütun olmalı

**Doğrular: Gereksinim 1.3, 1.4, 1.5**

### Property 4: Proje Detayları Tam İçerik Gösterir

*Herhangi bir* proje için, detay sayfası render edildiğinde, çıktı title, fullDescription ve project.images dizisindeki tüm görselleri içermelidir.

**Doğrular: Gereksinim 2.2**

### Property 5: Viewport Değişikliği Reload Gerektirmez

*Herhangi bir* viewport boyut değişikliğinde, sayfa yeniden yüklenmemeli (client-side re-render olmalı).

**Doğrular: Gereksinim 3.4**

### Property 6: Tutarlı Tipografi

*Tüm* sayfa bileşenleri için, render edilen CSS computed style'da aynı font-family değeri kullanılmalıdır.

**Doğrular: Gereksinim 4.1**

### Property 7: Görsel Yükleme Durumu

*Herhangi bir* görsel yüklenirken, loading state göstergesi (skeleton, spinner vb.) DOM'da bulunmalıdır.

**Doğrular: Gereksinim 4.3**

### Property 8: Hover Geri Bildirimi

*Herhangi bir* etkileşimli öğe (button, link, card) için, hover state CSS rule'u tanımlanmış olmalıdır.

**Doğrular: Gereksinim 4.5**

### Property 9: Lazy Loading Kullanımı

*Herhangi bir* fold altı görsel için, img veya Image componentinde loading="lazy" attribute'u bulunmalıdır.

**Doğrular: Gereksinim 5.2**

### Property 10: Görsel Optimizasyonu

*Tüm* görseller için, Next.js Image component kullanılmalıdır (raw img tag yerine).

**Doğrular: Gereksinim 5.3**

### Property 11: Client-Side Navigation

*Tüm* internal linkler için, Next.js Link component kullanılmalıdır (anchor tag yerine).

**Doğrular: Gereksinim 5.4**

### Property 12: İçerik Dosyalarından Yükleme

*Herhangi bir* geçerli JSON/Markdown proje dosyası için, getAllProjects() fonksiyonu bu dosyayı okuyup parse edebilmeli ve Project tipine dönüştürmelidir.

**Doğrular: Gereksinim 6.1**

### Property 13: İçerik Validasyonu

*Herhangi bir* proje verisi için, validateProject() fonksiyonu tüm zorunlu alanları (slug, title, description, fullDescription, coverImage, images, date) kontrol etmelidir.

**Doğrular: Gereksinim 6.3**

### Property 14: Validasyon Hataları

*Herhangi bir* geçersiz proje verisi (eksik alan, yanlış tip) için, validateProject() fonksiyonu false döndürmeli ve açıklayıcı hata mesajı loglanmalıdır.

**Doğrular: Gereksinim 6.4**

### Property 15: SEO Meta Tags

*Herhangi bir* sayfa için, render edilen HTML head'inde title, description ve canonical meta tag'leri bulunmalıdır.

**Doğrular: Gereksinim 7.2**

### Property 16: Open Graph Tags

*Herhangi bir* proje detay sayfası için, render edilen HTML head'inde og:title, og:description, og:image tag'leri bulunmalıdır ve proje verisinden doldurulmuş olmalıdır.

**Doğrular: Gereksinim 7.3, 7.4**

### Property 17: Semantik HTML

*Tüm* sayfa bileşenleri için, render edilen HTML'de semantik elementler (header, main, nav, article, section) kullanılmalıdır (sadece div yerine).

**Doğrular: Gereksinim 8.1**

### Property 18: Görsel Alt Metinleri

*Herhangi bir* görsel için, alt attribute'u bulunmalı ve boş string olmamalıdır.

**Doğrular: Gereksinim 8.2**

### Property 19: Klavye Navigasyonu

*Herhangi bir* etkileşimli öğe için, tab ile focus edilebilir olmalıdır (tabindex veya native focusable element).

**Doğrular: Gereksinim 8.3**

### Property 20: Renk Kontrastı

*Herhangi bir* text elementi için, background ile arasındaki kontrast oranı minimum WCAG AA standardını (4.5:1 normal text için) karşılamalıdır.

**Doğrular: Gereksinim 8.4**

### Property 21: ARIA Etiketleri

*Herhangi bir* etkileşimli öğe için, uygun ARIA attribute'ları (aria-label, aria-describedby vb.) bulunmalıdır veya açıklayıcı text içeriğe sahip olmalıdır.

**Doğrular: Gereksinim 8.5**

## Hata Yönetimi

### Build-Time Hataları

1. **İçerik Validasyon Hataları**
   - Eksik zorunlu alanlar
   - Yanlış veri tipleri
   - Geçersiz tarih formatı
   - Mevcut olmayan görsel dosyaları
   
   **Ele Alma**: Build process fail olur, detaylı hata mesajı console'da gösterilir, hatanın dosya ve satır bilgisi verilir.

2. **Dosya Sistemi Hataları**
   - İçerik dizini bulunamadı
   - JSON parse hataları
   - Dosya okuma yetki hataları
   
   **Ele Alma**: Açıklayıcı hata mesajı ve çözüm önerisi ile build fail.

### Runtime Hataları

1. **Görsel Yükleme Hataları**
   - Görsel bulunamadı
   - Network timeout
   
   **Ele Alma**: Placeholder görsel göster, fallback UI render et, hata silent log.

2. **Navigation Hataları**
   - 404 - Proje bulunamadı
   
   **Ele Alma**: Custom 404 sayfası, katalog sayfasına dön linki.

### Error Boundaries

React Error Boundary'ler sayfa ve component seviyesinde implement edilir:

```typescript
// Hata yakalama ve fallback UI
<ErrorBoundary fallback={<ErrorFallback />}>
  <ProjectGrid projects={projects} />
</ErrorBoundary>
```

## Test Stratejisi

### İkili Test Yaklaşımı

Kapsamlı doğruluk için hem unit testler hem de property-based testler gereklidir:

- **Unit testler**: Spesifik örnekleri, edge case'leri ve hata durumlarını test eder
- **Property testler**: Evrensel özellikleri tüm inputlarda doğrular
- Birlikte: Kapsamlı kapsama (unit testler somut bugları yakalar, property testler genel doğruluğu doğrular)

### Test Frameworkleri

- **Unit Testing**: Jest + React Testing Library
- **Property-Based Testing**: fast-check (TypeScript için)
- **E2E Testing**: Playwright (opsiyonel, deployment sonrası)

### Property-Based Test Konfigürasyonu

- Her property test minimum 100 iterasyon çalıştırılır
- Her test, tasarım belgesindeki property'ye referans verir
- Tag formatı: **Feature: catalog-website, Property {numara}: {property metni}**

### Test Örnekleri

#### Unit Test Örneği

```typescript
describe('ProjectCard Component', () => {
  it('renders project title and cover image', () => {
    const project = {
      slug: 'test-project',
      title: 'Test Project',
      coverImage: '/test.jpg',
      // ... diğer alanlar
    };
    
    const { getByText, getByAltText } = render(
      <ProjectCard project={project} />
    );
    
    expect(getByText('Test Project')).toBeInTheDocument();
    expect(getByAltText('Test Project')).toHaveAttribute('src', '/test.jpg');
  });
});
```

#### Property-Based Test Örneği

```typescript
import fc from 'fast-check';

// Feature: catalog-website, Property 1: Grid Tüm Projeleri Gösterir
describe('ProjectGrid Property Tests', () => {
  it('renders all projects in the list', () => {
    fc.assert(
      fc.property(
        fc.array(projectArbitrary, { minLength: 1, maxLength: 20 }),
        (projects) => {
          const { container } = render(<ProjectGrid projects={projects} />);
          const renderedCards = container.querySelectorAll('[data-testid="project-card"]');
          expect(renderedCards).toHaveLength(projects.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Arbitrary generator for Project type
const projectArbitrary = fc.record({
  slug: fc.string(),
  title: fc.string(),
  description: fc.string(),
  fullDescription: fc.string(),
  coverImage: fc.constant('/test.jpg'),
  images: fc.array(fc.constant('/test.jpg')),
  date: fc.date().map(d => d.toISOString()),
});
```

### Test Kapsamı Hedefleri

- **Component testleri**: %90+ coverage
- **Utility fonksiyonları**: %100% coverage
- **Property testler**: Tüm 21 property için implementasyon
- **Integration testler**: Ana kullanıcı akışları (katalog→detay→geri)
