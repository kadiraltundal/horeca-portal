# Uygulama Planı: Katalog Web Sitesi

## Genel Bakış

Bu uygulama planı, portfolyo tarzı katalog web sitesini Next.js 14, TypeScript ve Tailwind CSS kullanarak oluşturmak için adım adım görevleri içerir. Her görev bir öncekinin üzerine inşa edilir ve tüm özellikler entegre bir şekilde çalışır.

## Görevler

- [x] 1. Proje kurulumu ve temel yapılandırma
  - Next.js 14 projesi oluştur (App Router ile)
  - TypeScript ve Tailwind CSS yapılandır
  - Dizin yapısını oluştur (app/, components/, lib/, content/, public/images/)
  - Test framework kurulumu (Jest, React Testing Library, fast-check)
  - _Gereksinimler: Tüm proje için temel_

- [ ] 2. Tip tanımları ve veri modelleri
  - [x] 2.1 TypeScript interface'lerini oluştur (lib/types.ts)
    - Project, ProjectsData interface'leri
    - _Gereksinimler: 6.1_
  
  - [ ]* 2.2 Veri modeli için property test yaz
    - **Property 13: İçerik Validasyonu**
    - **Doğrular: Gereksinim 6.3**

- [ ] 3. İçerik yönetimi ve validasyon
  - [x] 3.1 İçerik loader fonksiyonları implement et (lib/projects.ts)
    - getAllProjects(): JSON dosyalarını okur ve parse eder
    - getProjectBySlug(): Tek bir proje döner
    - validateProject(): İçerik yapısını doğrular
    - _Gereksinimler: 6.1, 6.3, 6.4_
  
  - [ ]* 3.2 İçerik yükleme için property test yaz
    - **Property 12: İçerik Dosyalarından Yükleme**
    - **Doğrular: Gereksinim 6.1**
  
  - [ ]* 3.3 Validasyon hataları için property test yaz
    - **Property 14: Validasyon Hataları**
    - **Doğrular: Gereksinim 6.4**
  
  - [ ]* 3.4 Unit testler yaz
    - getAllProjects edge case'leri (boş dizin, invalid JSON)
    - getProjectBySlug null dönüşü
    - validateProject farklı hata senaryoları
    - _Gereksinimler: 6.1, 6.3, 6.4_

- [x] 4. Örnek içerik dosyaları oluştur
  - content/projects/ dizininde 3-4 örnek JSON dosyası oluştur
  - public/images/ dizininde placeholder görseller ekle
  - _Gereksinimler: 6.1_

- [ ] 5. Checkpoint - İçerik sistemi testi
  - Tüm testlerin geçtiğinden emin ol, sorun varsa kullanıcıya sor

- [ ] 6. Temel UI bileşenleri
  - [x] 6.1 ProjectCard bileşeni oluştur (components/ProjectCard.tsx)
    - Cover image ve title gösterimi
    - Next.js Image component kullanımı
    - Hover efektleri
    - Link ile proje detayına yönlendirme
    - Alt text ve ARIA label'ları
    - _Gereksinimler: 1.2, 2.1, 5.3, 5.4, 8.2, 8.5_
  
  - [ ]* 6.2 ProjectCard için property testler
    - **Property 2: Her Proje Kartı Gerekli İçeriği Gösterir**
    - **Property 10: Görsel Optimizasyonu**
    - **Property 18: Görsel Alt Metinleri**
    - **Doğrular: Gereksinim 1.2, 5.3, 8.2**
  
  - [ ]* 6.3 ProjectCard için unit testler
    - Hover state davranışı
    - Link href doğruluğu
    - _Gereksinimler: 1.2, 2.1_

- [ ] 7. Grid layout bileşeni
  - [x] 7.1 ProjectGrid bileşeni oluştur (components/ProjectGrid.tsx)
    - CSS Grid ile responsive layout
    - Mobil: 1 sütun, Tablet: 2 sütun, Desktop: 3-4 sütun
    - Proje listesini map ile ProjectCard'lara dönüştür
    - _Gereksinimler: 1.1, 1.3, 1.4, 1.5_
  
  - [ ]* 7.2 ProjectGrid için property testler
    - **Property 1: Grid Tüm Projeleri Gösterir**
    - **Property 3: Responsive Grid Davranışı**
    - **Doğrular: Gereksinim 1.1, 1.3, 1.4, 1.5**
  
  - [ ]* 7.3 ProjectGrid için unit testler
    - Boş liste durumu
    - Tek proje durumu
    - _Gereksinimler: 1.1_

- [ ] 8. Görsel galeri bileşeni
  - [x] 8.1 ImageGallery bileşeni oluştur (components/ImageGallery.tsx)
    - Grid düzeninde çoklu görseller
    - Lazy loading implementasyonu
    - Next.js Image component
    - Responsive boyutlandırma
    - Alt text
    - _Gereksinimler: 2.2, 5.2, 5.3, 8.2_
  
  - [ ]* 8.2 ImageGallery için property testler
    - **Property 9: Lazy Loading Kullanımı**
    - **Property 18: Görsel Alt Metinleri**
    - **Doğrular: Gereksinim 5.2, 8.2**

- [ ] 9. Proje detay bileşeni
  - [x] 9.1 ProjectDetail bileşeni oluştur (components/ProjectDetail.tsx)
    - Başlık, full description gösterimi
    - ImageGallery entegrasyonu
    - "Geri" butonu ile katalog sayfasına dönüş
    - _Gereksinimler: 2.2, 2.3_
  
  - [ ]* 9.2 ProjectDetail için property test
    - **Property 4: Proje Detayları Tam İçerik Gösterir**
    - **Doğrular: Gereksinim 2.2**
  
  - [ ]* 9.3 ProjectDetail için unit testler
    - Geri butonu varlığı ve href
    - _Gereksinimler: 2.3_

- [ ] 10. Ana katalog sayfası
  - [x] 10.1 app/page.tsx oluştur
    - getAllProjects() ile veri yükle
    - ProjectGrid'i render et
    - Semantik HTML (main, header)
    - SEO meta tags
    - _Gereksinimler: 1.1, 7.2, 8.1_
  
  - [ ]* 10.2 Ana sayfa için property testler
    - **Property 15: SEO Meta Tags**
    - **Property 17: Semantik HTML**
    - **Doğrular: Gereksinim 7.2, 8.1**

- [ ] 11. Proje detay sayfası
  - [x] 11.1 app/projects/[slug]/page.tsx oluştur
    - Dynamic route parametresi kullan
    - getProjectBySlug() ile veri yükle
    - generateStaticParams() ile tüm proje sayfalarını static oluştur
    - ProjectDetail bileşenini render et
    - SEO meta tags (proje bilgileriyle)
    - Open Graph tags
    - 404 handling
    - _Gereksinimler: 2.1, 2.2, 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 11.2 Detay sayfası için property testler
    - **Property 16: Open Graph Tags**
    - **Doğrular: Gereksinim 7.3, 7.4**

- [ ] 12. Checkpoint - Temel özellikler testi
  - Tüm testlerin geçtiğinden emin ol, sorun varsa kullanıcıya sor

- [ ] 13. Global layout ve styling
  - [x] 13.1 app/layout.tsx oluştur
    - Root layout tanımla
    - Global font tanımlamaları (tutarlı tipografi)
    - Metadata export
    - _Gereksinimler: 4.1, 7.2_
  
  - [x] 13.2 app/globals.css oluştur
    - Tailwind directives
    - Custom CSS variables (colors, spacing)
    - Transition tanımlamaları
    - Focus styles (klavye navigasyonu için)
    - _Gereksinimler: 4.1, 4.2, 8.3_
  
  - [ ]* 13.3 Styling için property testler
    - **Property 6: Tutarlı Tipografi**
    - **Property 8: Hover Geri Bildirimi**
    - **Property 19: Klavye Navigasyonu**
    - **Property 20: Renk Kontrastı**
    - **Doğrular: Gereksinim 4.1, 4.5, 8.3, 8.4**

- [ ] 14. Loading states ve error handling
  - [x] 14.1 Loading bileşenleri ekle
    - Görsel yükleme için skeleton/spinner
    - Sayfa loading.tsx dosyaları
    - _Gereksinimler: 4.3_
  
  - [x] 14.2 Error boundary oluştur
    - components/ErrorBoundary.tsx
    - Fallback UI
    - _Gereksinimler: Hata yönetimi_
  
  - [x] 14.3 app/not-found.tsx oluştur
    - Custom 404 sayfası
    - Katalog sayfasına dönüş linki
    - _Gereksinimler: Hata yönetimi_
  
  - [ ]* 14.4 Loading state için property test
    - **Property 7: Görsel Yükleme Durumu**
    - **Doğrular: Gereksinim 4.3**

- [ ] 15. Client-side navigation ve performans
  - [ ]* 15.1 Navigation için property testler
    - **Property 11: Client-Side Navigation**
    - **Property 5: Viewport Değişikliği Reload Gerektirmez**
    - **Doğrular: Gereksinim 5.4, 3.4**

- [ ] 16. Erişilebilirlik testi ve iyileştirmeler
  - [ ]* 16.1 Erişilebilirlik için property testler
    - **Property 21: ARIA Etiketleri**
    - **Doğrular: Gereksinim 8.5**
  
  - [ ]* 16.2 Unit testler ile erişilebilirlik kontrolleri
    - Tab navigasyonu testi
    - Screen reader testleri (aria-label varlığı)
    - _Gereksinimler: 8.3, 8.5_

- [ ] 17. Build ve deployment konfigürasyonu
  - [x] 17.1 next.config.js optimize et
    - Image optimization ayarları
    - Static export konfigürasyonu
    - _Gereksinimler: 5.3, 7.1_
  
  - [x] 17.2 package.json scripts ekle
    - build, dev, start, test, lint scripts
    - _Gereksinimler: 6.2_

- [ ] 18. Final checkpoint - Tüm sistem testi
  - Tüm testlerin geçtiğinden emin ol
  - Build'i çalıştır ve hata olmadığını doğrula
  - Statik sayfaların oluşturulduğunu kontrol et
  - Sorun varsa kullanıcıya sor

## Notlar

- `*` ile işaretli görevler opsiyoneldir ve daha hızlı MVP için atlanabilir
- Her görev spesifik gereksinimlere referans verir
- Checkpoint'ler kademeli doğrulama sağlar
- Property testler evrensel doğruluk özelliklerini doğrular
- Unit testler spesifik örnekleri ve edge case'leri doğrular
