# HORECA Portal - Telegram Mini App Uyumluluğu

## Yapılan Değişiklikler

### 1. useTelegram Hook'u (`src/hooks/useTelegram.ts`)
- **HapticFeedback** desteği eklendi (titreşim geri bildirimi)
- **colorScheme** desteği (light/dark mode)
- **platform** bilgisi
- **viewportHeight/viewportStableHeight** desteği
- **headerColor, backgroundColor, bottomBarColor** ayarları
- **enableClosingConfirmation/disableClosingConfirmation** desteği
- Callback'ler `useCallback` ile optimize edildi

### 2. Telegram CSS (`src/app/telegram.css`)
- Telegram tema renkleri için CSS değişkenleri
- Safe area padding (iPhone notch için)
- Telegram buton, kart, input stilleri
- Dark mode desteği
- Touch feedback animasyonları
- Scrollbar özelleştirme

### 3. Layout (`src/app/layout.tsx`)
- `telegram.css` import edildi
- `TelegramProvider` eklendi
- viewport `viewportFit: "cover"` olarak ayarlandı
- Apple Web App meta etiketleri eklendi

### 4. TelegramProvider (`src/components/providers/TelegramProvider.tsx`)
- Yeni bileşen: Telegram WebApp ayarlarını yönetir
- Header, background, bottom bar renklerini ayarlar
- Back button handler

### 5. AuthProvider (`src/components/providers/AuthProvider.tsx`)
- Telegram initData ile otomatik login
- Loading durumu gösterimi
- Token ile otomatik oturum açma

### 6. Ana Sayfa (`src/app/page.tsx`)
- Telegram tema renkleri ile tam uyumlu tasarım
- Kullanıcı bilgileri ve avatar gösterimi
- Haptic feedback ile etkileşim
- API'den kategori çekme
- Promo banner
- Cart badge

### 7. Sepet Sayfası (`src/app/(main)/cart/page.tsx`)
- UZS para birimi desteği
- Telegram MainButton "Teklif yuborish"
- BackButton ile geri dönüş
- Haptic feedback
- Telegram tema renkleri

## Telegram Mini App Özellikleri

### Tema Renkleri
```css
--tg-bg-color: #ffffff;
--tg-text-color: #000000;
--tg-hint-color: #999999;
--tg-link-color: #2481cc;
--tg-button-color: #2481cc;
--tg-button-text-color: #ffffff;
--tg-secondary-bg-color: #f1f1f1;
```

### Haptic Feedback Kullanımı
```typescript
hapticFeedback('impact', 'light');    // Hafif titreşim
hapticFeedback('impact', 'medium');   // Orta titreşim
hapticFeedback('impact', 'heavy');    // Güçlü titreşim
hapticFeedback('notification', 'success'); // Başarı bildirimi
hapticFeedback('notification', 'warning'); // Uyarı bildirimi
hapticFeedback('notification', 'error');   // Hata bildirimi
hapticFeedback('selection');          // Seçim değişikliği
```

### MainButton Kullanımı
```typescript
showMainButton('Teklif yuborish');    // Göster
hideMainButton();                      // Gizle
enableMainButton();                    // Aktif et
disableMainButton();                   // Pasifleştir
sendMainButtonClicked(() => { ... }); // Tıklama dinleyicisi
```

### BackButton Kullanımı
```typescript
showBackButton();                      // Göster
hideBackButton();                      // Gizle
sendBackButtonClicked(() => { ... }); // Tıklama dinleyicisi
```

## Telegram Bot Ayarları

### BotFather Komutları
```
/newbot - Yeni bot oluştur
/setmenubutton - Mini App URL'ini ayarla
/setcommands - Bot komutlarını ayarla
/setdescription - Bot açıklamasını ayarla
/setuserpic - Bot profil resmini ayarla
```

### Menu Button Ayarı
```
/setmenubutton
→ Bot seç
→ URL: https://horeca-portal.vercel.app
→ Button text: 🛍️ Xarid qilish
```

### Bot Komutları
```
start - Bosh sahifa
help - Yordam
```

## Deploy Sonrası Kontrol Listesi

- [ ] Telegram bot'u oluşturuldu
- [ ] Bot token'ı backend .env dosyasına eklendi
- [ ] Frontend Vercel'e deploy edildi
- [ ] Backend Render'a deploy edildi
- [ ] Telegram Menu Button ayarlandı
- [ ] Bot komutları ayarlandı
- [ ] Test edildi (Telegram'da /start)
- [ ] Kullanıcı girişi çalışıyor
- [ ] Ürün listesi yükleniyor
- [ ] Sepet çalışıyor
- [ ] Teklif gönderimi çalışıyor
- [ ] Bildirimler çalışıyor

## Sorun Giderme

### Mini App Açılmıyor
- URL'nin HTTPS olduğundan emin ol
- Vercel deploy'un başarılı olduğundan emin ol
- Telegram bot'un doğru ayarlandığından emin ol

### Tema Renkleri Uygulanmıyor
- `telegram.css'in import edildiğinden emin ol
- CSS değişkenlerinin doğru tanımlandığından emin ol

### BackButton Çalışmıyor
- `showBackButton()`'ın çağrıldığından emin ol
- `sendBackButtonClicked()` ile handler eklendiğinden emin ol

### MainButton Çalışmıyor
- `showMainButton()`'ın çağrıldığından emin ol
- `sendMainButtonClicked()` ile handler eklendiğinden emin ol

### HapticFeedback Çalışmıyor
- Telegram WebApp SDK'ın yüklendiğinden emin ol
- `window.Telegram?.WebApp`'ın var olduğundan emin ol
- Mobil cihazda test edildiğinden emin ol
