# HORECA Portal - Deploy Rehberi

## 1. Vercel'e Frontend Deploy

### Adım 1: Vercel Hesabı Oluştur
1. https://vercel.com adresine git
2. "Sign Up" ile GitHub hesabınla kayıt ol
3. "Import Project" seç
4. `horeca-portal/frontend` klasörünü seç

### Adım 2: Environment Variables Ekle
Vercel dashboard'unda projeyi seç → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://api.horeca-portal.uz/api
NEXT_PUBLIC_TELEGRAM_BOT_URL=https://t.me/your_bot_username
```

### Adım 3: Deploy
- "Deploy" butonuna bas
- Vercel otomatik olarak build edecek ve deploy edecek
- Size bir URL verecek: `https://horeca-portal.vercel.app`

---

## 2. Backend Deploy (VPS)

### Seçenek A: DigitalOcean VPS
1. DigitalOcean'da droplet oluştur (Ubuntu 22.04, $5/ay)
2. SSH ile bağlan
3. Gerekli paketleri kur:

```bash
# Node.js kur
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Docker kur
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Git kur
sudo apt-get install -y git
```

4. Kodu clone et:
```bash
git clone https://github.com/your-repo/horeca-portal.git
cd horeca-portal
```

5. Docker ile çalıştır:
```bash
docker-compose up -d postgres redis
cd backend
npm install
npm run start:prod
```

### Seçenek B: Hetzner VPS
Aynı adımlar, daha ucuz ($4/ay).

---

## 3. Telegram Bot Oluşturma

### Adım 1: BotFather'a Git
1. Telegram'da `@BotFather`'ı ara
2. `/newbot` yaz
3. Bot adını gir: `HORECA Portal`
4. Username gir: `horeca_portal_bot`

### Adım 2: Bot Token'ı Al
BotFather sana bir token verecek:
```
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```
Bunu sakla!

### Adım 3: Mini App'i Ayarla
BotFather'a `/setmenubutton` yaz:
1. Bot seç
2. URL gir: `https://horeca-portal.vercel.app`
3. Button text: "🛍️ Xarid qilish"

### Adım 4: Bot Komutlarını Ayarla
BotFather'a `/setcommands` yaz:
```
start - Bosh sahifa
help - Yordam
```

---

## 4. Backend .env Dosyası

Backend'de `.env` dosyasını oluştur:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=horeca_admin
DB_PASSWORD=your_secure_password
DB_DATABASE=horeca_portal

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Telegram
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=your_chat_id
ADMIN_TELEGRAM_IDS=[your_telegram_id]

# App
APP_PORT=3001
CORS_ORIGIN=https://horeca-portal.vercel.app
```

---

## 5. Telegram Chat ID Nasıl Bulunur?

1. Telegram'da `@userinfobot`'u ara
2. `/start` yaz
3. Sana `chat_id` verecek

---

## 6. Test

1. Telegram'da bot'a `/start` yaz
2. Mini App açılmalı
3. Ürünleri görebilmelisin
4. Teklif gönderebilmelisin

---

## Sorun Giderme

### Mini App Açılmıyor
- URL'nin HTTPS olduğundan emin ol
- Vercel deploy'un başarılı olduğundan emin ol

### Backend'e Bağlanamıyor
- Backend'in çalıştığından emin ol
- CORS ayarlarını kontrol et
- Firewall port 3001'i açmış mı kontrol et

### Veritabanı Hatası
- PostgreSQL'in çalıştığından emin ol
- Tabloların oluştuğundan emin ol (init.sql)
