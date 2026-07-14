# Requirements Document

## Introduction

Bu sistem, Özbekistan'daki otellere B2B (işletmeden işletmeye) kimyasal ürün satışı yapan bir şirketin müşteri ilişkileri yönetim (CRM) platformudur. Sistem üç temel işlevi kapsar:

1. **Otel Veritabanı Yönetimi**: Özbekistan'daki tüm otellerin büyükten küçüğe sıralı, aranabilir ve güncel bir dizini
2. **Kimyasal Ürün Satış Takibi**: 3 farklı ürün grubunun otellere yapılan satışlarının kaydı ve yönetimi
3. **Otomatik Araştırma Motoru**: Yeni otelleri keşfeden, mevcut müşterileri takip eden ve sektör verisi toplayan arka plan servisi

Sistem, Özbek, Rus ve İngilizce kullanıcı arayüzü sunar ve Özbekistan pazarına özgü iş akışlarını destekler.

---

## Glossary

- **CRM_Sistemi**: Bu dokümanda tanımlanan Özbekistan Otel CRM yazılım platformu
- **Otel**: Özbekistan'da faaliyet gösteren, konaklama hizmeti sunan işletme (butik otel, büyük otel, hostel, resort vb.)
- **Müşteri_Otel**: CRM_Sistemi'nde kayıtlı ve şirketle aktif veya geçmiş iş ilişkisi bulunan Otel
- **Aday_Otel**: Satış sürecine henüz girilmemiş, potansiyel müşteri olan Otel
- **Kimyasal_Grup**: Şirketin sattığı 3 ana ürün kategorisinden biri (Grup A, Grup B, Grup C — içerik şirket tarafından belirlenir)
- **Urun**: Belirli bir Kimyasal_Grup altında satılan bireysel kimyasal ürün kalemi
- **Satis_Kaydi**: Bir Müşteri_Otel'e yapılan Urun satışının tarih, miktar ve tutar bilgilerini içeren kayıt
- **Arastirma_Servisi**: İnternet üzerinden otel verisi toplayan, sürekli çalışan arka plan bileşeni
- **Kapasite_Skoru**: Odaların toplam sayısına göre hesaplanan otelin büyüklük sıralaması değeri
- **Iletisim_Profili**: Otel yetkilileri için ad, telefon, e-posta, adres ve sosyal medya bilgilerini barındıran kayıt
- **Desteklenen_Diller**: Sistemin arayüz dilleri — Özbek (Latin alfabesi), Rus, Türkçe ve İngilizce

---

## Requirements

---

### Gereksinim 1: Otel Veritabanı ve Dizin Yönetimi

**Kullanıcı Hikayesi:** Satış temsilcisi olarak, Özbekistan'daki tüm otellerin büyükten küçüğe sıralı, filtrelenebilir bir listesini görmek istiyorum; böylece doğru müşteri adaylarına öncelik verebilir ve ziyaret planlarımı yapabilirim.

#### Kabul Kriterleri

1. THE CRM_Sistemi SHALL her Otel kaydı için şu zorunlu alanları saklayacak: otel adı, şehir, yıldız derecesi (1–5), oda sayısı, kategori (butik/şehir/resort/hostel), durum (Aday_Otel/Müşteri_Otel/Pasif) ve Kapasite_Skoru.
2. THE CRM_Sistemi SHALL Otel listesini varsayılan olarak Kapasite_Skoru değerine göre azalan sırada (büyükten küçüğe) gösterecek.
3. WHEN kullanıcı şehir, yıldız derecesi, kategori veya durum filtrelerini uyguladığında, THE CRM_Sistemi SHALL yalnızca seçilen kriterlere uyan Otel kayıtlarını listeleyecek ve her filtre kombinasyonu için sonuç sayısını gösterecek.
4. WHEN kullanıcı arama alanına en az 2 karakter girdiğinde, THE CRM_Sistemi SHALL otel adı ve şehir alanlarında büyük/küçük harfe duyarsız eşleşme yaparak 500 ms içinde sonuçları gösterecek.
5. IF bir Otel kaydında otel adı veya şehir alanı boşsa, THEN THE CRM_Sistemi SHALL kaydı redderecek ve hangi zorunlu alanın eksik olduğunu belirten bir hata mesajı döndürecek.
6. THE CRM_Sistemi SHALL Otel listesini CSV ve Excel (.xlsx) formatlarında dışa aktarma imkânı sunacak; dışa aktarılan dosya o anda uygulanan filtre ve sıralamayı yansıtacak.

---

### Gereksinim 2: İletişim Profili Yönetimi

**Kullanıcı Hikayesi:** Satış temsilcisi olarak, her otel için birden fazla yetkili kişinin iletişim bilgilerini kaydetmek ve güncellemek istiyorum; böylece doğru kişiyle iletişime geçebilir ve ziyaret notlarımı saklayabilirim.

#### Kabul Kriterleri

1. THE CRM_Sistemi SHALL her Otel kaydına sınırsız sayıda Iletisim_Profili eklenebilmesine izin verecek.
2. THE CRM_Sistemi SHALL her Iletisim_Profili için şu alanları saklayacak: ad-soyad, unvan/pozisyon, telefon numarası (en az bir tane zorunlu), e-posta adresi, tercih edilen iletişim dili (Özbek/Rus/İngilizce) ve notlar.
3. WHEN kullanıcı bir Iletisim_Profili'ni birincil (primary) olarak işaretlediğinde, THE CRM_Sistemi SHALL aynı Otel için daha önce birincil olarak işaretlenmiş profili otomatik olarak ikincile düşürecek.
4. WHEN kullanıcı telefon numarası alanına veri girdiğinde, THE CRM_Sistemi SHALL +998 (Özbekistan) ülke kodu formatını varsayılan olarak sunacak ve uluslararası formatlara da izin verecek.
5. IF bir Iletisim_Profili silinmek isteniyorsa ve bu profil tek kişiyse, THEN THE CRM_Sistemi SHALL silme işlemini engelleyecek ve kullanıcıya önce yeni bir profil eklemesini söyleyen bir uyarı gösterecek.
6. THE CRM_Sistemi SHALL iletişim geçmişini (çağrı, e-posta, ziyaret notları) Iletisim_Profili ile ilişkilendirecek ve tarihe göre azalan sırada görüntüleyecek.

---

### Gereksinim 3: Kimyasal Ürün Grubu Kataloğu

**Kullanıcı Hikayesi:** Satış yöneticisi olarak, 3 farklı kimyasal ürün grubunu ve her grup altındaki ürünleri sisteme tanımlamak istiyorum; böylece hangi otele hangi ürün grubundan satış yapıldığını izleyebilirim.

#### Kabul Kriterleri

1. THE CRM_Sistemi SHALL tam olarak 3 Kimyasal_Grup tanımlanmasına izin verecek; her Kimyasal_Grup için grup adı, açıklama ve durum (aktif/pasif) alanları bulunacak.
2. THE CRM_Sistemi SHALL her Kimyasal_Grup altına sınırsız sayıda Urun eklenebilmesine izin verecek; her Urun için ürün kodu, ürün adı, birim (litre/kg/adet), birim fiyat ve para birimi (UZS/USD) alanları zorunlu olacak.
3. WHEN bir Kimyasal_Grup pasif duruma alındığında, THE CRM_Sistemi SHALL bu gruba ait Urunleri de otomatik pasif yapacak ve mevcut açık Satis_Kaydi varsa kullanıcıyı uyaracak.
4. IF aynı ürün koduna sahip bir Urun eklenmeye çalışılırsa, THEN THE CRM_Sistemi SHALL eklemeyi reddedecek ve mevcut ürünün detaylarına yönlendiren bir bağlantı gösterecek.
5. THE CRM_Sistemi SHALL ürün fiyat geçmişini saklayacak; fiyat değişikliklerinde önceki fiyat, yeni fiyat, değişiklik tarihi ve değiştiren kullanıcı bilgileri log kaydına eklenecek.

---

### Gereksinim 4: Satış Kaydı ve Takibi

**Kullanıcı Hikayesi:** Satış temsilcisi olarak, bir otele yaptığım kimyasal ürün satışını kaydetmek ve o otelin satın alma geçmişini görüntülemek istiyorum; böylece hangi ürünlerin ne sıklıkla satıldığını anlayabilirim.

#### Kabul Kriterleri

1. WHEN kullanıcı yeni bir Satis_Kaydi oluşturduğunda, THE CRM_Sistemi SHALL hedef Müşteri_Otel, Urun, miktar, birim fiyat, toplam tutar, satış tarihi ve sorumlu satış temsilcisi alanlarını zorunlu kılacak.
2. THE CRM_Sistemi SHALL her Satis_Kaydi'nin durumunu (Teklif/Onaylandı/Teslim Edildi/İptal) takip edecek ve durum geçişlerini tarih damgasıyla birlikte kaydedecek.
3. WHEN bir Satis_Kaydi onaylandığında, THE CRM_Sistemi SHALL ilgili Aday_Otel'in durumunu otomatik olarak Müşteri_Otel'e yükseltecek.
4. THE CRM_Sistemi SHALL bir Müşteri_Otel'in tüm Satis_Kaydi geçmişini Kimyasal_Grup bazında gruplandırarak gösterecek; her grup için toplam satış tutarı ve son satış tarihi özetlenecek.
5. IF bir Satis_Kaydi iptal edilmek isteniyorsa ve durum "Teslim Edildi" ise, THEN THE CRM_Sistemi SHALL iptal işlemini kilitleyecek ve yalnızca yönetici rolündeki kullanıcıların bu kilidi kaldırabileceğini belirtecek.
6. THE CRM_Sistemi SHALL bir Müşteri_Otel'in son satın almasından bu yana geçen gün sayısını hesaplayacak ve 90 günden fazlaysa ilgili satış temsilcisine hatırlatma bildirimi gönderecek.

---

### Gereksinim 5: Otomatik Otel Keşif Servisi

**Kullanıcı Hikayesi:** Satış yöneticisi olarak, internette yeni açılan veya henüz veritabanımızda olmayan Özbekistan otellerinin otomatik olarak tespit edilmesini istiyorum; böylece satış fırsatlarını kaçırmadan potansiyel müşteri listem güncel kalsın.

#### Kabul Kriterleri

1. THE Arastirma_Servisi SHALL Özbekistan otel sektörüyle ilgili belirlenen veri kaynaklarını (otel rezervasyon platformları, turizm dizinleri, arama motoru sonuçları) düzenli aralıklarla tarayacak.
2. WHEN Arastirma_Servisi yeni bir Otel tespit ettiğinde, THE CRM_Sistemi SHALL bu oteli "Aday_Otel" statüsü ve "Otomatik Keşif" kaynağıyla birlikte karantina kuyruğuna ekleyecek.
3. WHEN yönetici karantina kuyruğunu incelediğinde, THE CRM_Sistemi SHALL her aday için otomatik toplanan veriyi (ad, adres, web sitesi, tahmini oda sayısı) ve veri kaynağını birlikte gösterecek.
4. WHEN yönetici bir karantina kaydını onayladığında, THE CRM_Sistemi SHALL kaydı aktif Aday_Otel olarak veritabanına taşıyacak ve keşif tarihini saklayacak.
5. IF Arastirma_Servisi mevcut bir Müşteri_Otel ile aynı ada ve adrese sahip bir kayıt tespit ederse, THEN THE CRM_Sistemi SHALL kaydı çakışma olarak işaretleyecek ve karantina kuyruğuna yönlendirerek otomatik eklemeyi engelleyecek.
6. THE Arastirma_Servisi SHALL her çalışma döngüsünün sonunda taranan kaynak sayısı, bulunan aday sayısı, çakışma sayısı ve çalışma süresini içeren bir log kaydı oluşturacak.

---

### Gereksinim 6: Müşteri Takip ve Sosyal Medya İzleme

**Kullanıcı Hikayesi:** Satış temsilcisi olarak, mevcut müşteri otellerin web sitelerindeki ve sosyal medyadaki güncellemelerden haberdar olmak istiyorum; böylece yenilik yapan veya büyüyen otellere zamanında ulaşabilirim.

#### Kabul Kriterleri

1. THE Arastirma_Servisi SHALL Müşteri_Otel kayıtlarında tanımlı web sitesi ve sosyal medya profil bağlantılarını haftada en az bir kez kontrol edecek.
2. WHEN Arastirma_Servisi bir Müşteri_Otel'in web sitesinde yeni oda veya tesis açılışı bilgisi tespit ettiğinde, THE CRM_Sistemi SHALL sorumlu satış temsilcisine bildirim gönderecek ve ilgili otelin faaliyet günlüğüne not düşecek.
3. THE CRM_Sistemi SHALL her Müşteri_Otel için web/sosyal takip durumunu (aktif/pasif), son kontrol tarihini ve son tespit edilen değişikliği gösterecek.
4. IF Arastirma_Servisi bir web sitesi adresine 3 ardışık kontrolde ulaşamazsa, THEN THE CRM_Sistemi SHALL ilgili Iletisim_Profili'ni "web sitesi erişilemiyor" olarak işaretleyecek ve sorumlu satış temsilcisini bilgilendirecek.
5. THE Arastirma_Servisi SHALL sosyal medya ve web izleme için üçüncü taraf hizmet kesintilerinde sistemin geri kalanını etkilemeden sessizce başarısız olacak ve hatayı log kaydına ekleyecek.

---

### Gereksinim 7: Sektör Veri Toplama ve Raporlama

**Kullanıcı Hikayesi:** Satış yöneticisi olarak, Özbekistan otel sektörüne ait güncel verilerin (doluluk trendleri, yeni otel açılışları, sektör haberleri) düzenli raporlar hâlinde sunulmasını istiyorum; böylece satış stratejimi veriyle destekleyebiliyim.

#### Kabul Kriterleri

1. THE Arastirma_Servisi SHALL Özbekistan turizm sektörüyle ilgili belirlenen haber kaynakları ve sektör sitelerini günlük olarak tarayacak ve yeni içerikleri özetleyerek sektör günlüğüne ekleyecek.
2. THE CRM_Sistemi SHALL haftalık özet raporu oluşturacak; bu rapor yeni Aday_Otel sayısını, bu hafta iletişime geçilen otel sayısını, kapanan satışları ve bir önceki haftayla karşılaştırmalı büyüme oranlarını içerecek.
3. THE CRM_Sistemi SHALL Kimyasal_Grup bazında aylık satış analizi sunacak; her grup için toplam satış tutarı, en çok satan 5 Müşteri_Otel ve satışı düşen otellerin listesi gösterilecek.
4. WHEN kullanıcı özel tarih aralığı seçtiğinde, THE CRM_Sistemi SHALL seçilen aralığa ait tüm raporları o tarih aralığıyla yeniden hesaplayacak ve 3 saniye içinde sonucu gösterecek.
5. THE CRM_Sistemi SHALL tüm raporları PDF ve Excel formatında dışa aktarma seçeneği sunacak; dışa aktarılan belge şirket logosunu ve oluşturulma tarihini içerecek.

---

### Gereksinim 8: Kullanıcı Rolleri ve Erişim Yönetimi

**Kullanıcı Hikayesi:** Sistem yöneticisi olarak, farklı çalışanların sisteme farklı düzeylerde erişimini kontrol etmek istiyorum; böylece hassas satış verileri ve sistem ayarları yalnızca yetkili kişilerce görüntülensin.

#### Kabul Kriterleri

1. THE CRM_Sistemi SHALL en az 3 rol tanımlayacak: Yönetici (tam erişim), Satış_Temsilcisi (kendi kayıtlarına tam erişim, diğerlerini yalnızca görüntüleme), Izleyici (tüm verileri yalnızca görüntüleme, düzenleme yapamaz).
2. WHEN bir Satış_Temsilcisi sisteme giriş yaptığında, THE CRM_Sistemi SHALL varsayılan olarak yalnızca o temsilciye atanmış Otel ve Satis_Kaydi listesini gösterecek; diğer kayıtları görmek için filtreyi değiştirmesi gerekecek.
3. THE CRM_Sistemi SHALL tüm veri oluşturma, güncelleme ve silme işlemlerini kullanıcı adı, zaman damgası ve değişiklik öncesi/sonrası değerlerle birlikte denetim günlüğüne kaydedecek.
4. IF bir kullanıcı yetkisiz bir işlem yapmaya çalışırsa, THEN THE CRM_Sistemi SHALL işlemi reddedecek, kullanıcıya yetkisizlik mesajı gösterecek ve girişimi denetim günlüğüne ekleyecek.
5. THE CRM_Sistemi SHALL kullanıcı oturumlarını 8 saat hareketsizlikten sonra otomatik sonlandıracak ve kullanıcıyı giriş sayfasına yönlendirecek.

---

### Gereksinim 9: Çok Dilli Kullanıcı Arayüzü

**Kullanıcı Hikayesi:** Özbekistan'da çalışan sistem kullanıcısı olarak, arayüzü kendi dilimde kullanmak istiyorum; böylece iş akışımı daha hızlı tamamlayabilirim.

#### Kabul Kriterleri

1. THE CRM_Sistemi SHALL kullanıcı arayüzünü Özbek (Latin alfabesi), Rus, Türkçe ve İngilizce dillerinde sunacak; yeni kullanıcılar için varsayılan dil İngilizce olacak.
2. WHEN kullanıcı dil tercihini değiştirdiğinde, THE CRM_Sistemi SHALL sayfa yenilenmesine gerek kalmadan arayüzü seçilen dilde gösterecek ve bu tercihi kullanıcı profiline kaydedecek; tercih oturum kapatılıp tekrar giriş yapıldığında da korunacak.
3. THE CRM_Sistemi SHALL otel adları, notlar ve iletişim bilgileri gibi kullanıcı tarafından girilen metin verilerini karakter bütünlüğünü koruyarak (UTF-8) dil bağımsız olarak saklayacak; çevirisi yapılmadan orijinal hâliyle gösterecek.
4. IF kullanıcı tarafından seçilen bir dilde belirli bir arayüz metni çevirisi eksikse, THEN THE CRM_Sistemi SHALL o metin için İngilizce karşılığını gösterecek ve eksik çeviriyi sistem günlüğüne ekleyecek; eğer İngilizce karşılık da eksikse anahtar adını (translation key) gösterecek.
5. WHEN kullanıcı sisteme giriş yaptığında, THE CRM_Sistemi SHALL kullanıcı profilinde kayıtlı dil tercihini otomatik olarak uygulayacak.

---

### Gereksinim 10: Veri Güvenliği ve Yedekleme

**Kullanıcı Hikayesi:** Sistem yöneticisi olarak, CRM verilerinin güvende olduğundan ve olası bir arıza durumunda kurtarılabildiğinden emin olmak istiyorum; böylece iş sürekliliğini koruyabilirim.

#### Kabul Kriterleri

1. THE CRM_Sistemi SHALL tüm kullanıcı şifrelerini bcrypt veya eşdeğer güçlü bir hash algoritmasıyla saklayacak; düz metin şifre hiçbir zaman veritabanına yazılmayacak.
2. THE CRM_Sistemi SHALL veritabanının tam yedeklemesini her gün gece otomatik olarak alacak ve yedekleri en az 30 gün boyunca saklayacak.
3. WHEN günlük yedekleme tamamlandığında, THE CRM_Sistemi SHALL yedekleme başarı durumunu, dosya boyutunu ve yedek konumunu sistem günlüğüne kaydedecek.
4. IF günlük yedekleme başarısız olursa, THEN THE CRM_Sistemi SHALL yönetici rolündeki tüm kullanıcılara e-posta ile bildirim gönderecek ve hata detayını sistem günlüğüne ekleyecek.
5. THE CRM_Sistemi SHALL Arastirma_Servisi'nden gelen dış verileri iç veritabanına yazmadan önce doğrulayacak; beklenmedik formatta veya boyutta veri geldiğinde karantina kuyruğuna alacak.
