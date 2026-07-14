const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ===== CURRENCIES =====
  const currencies = [
    { id: 'TRY', code: 'TRY', name: 'Türk Lirası', symbol: '₺', decimalPlaces: 2 },
    { id: 'USD', code: 'USD', name: 'ABD Doları', symbol: '$', decimalPlaces: 2 },
    { id: 'EUR', code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2 },
    { id: 'UZS', code: 'UZS', name: 'Özbekistan Somu', symbol: 'soʻm', decimalPlaces: 2 },
    { id: 'RUB', code: 'RUB', name: 'Rus Rublesi', symbol: '₽', decimalPlaces: 2 },
    { id: 'GBP', code: 'GBP', name: 'İngiliz Sterlini', symbol: '£', decimalPlaces: 2 },
    { id: 'JPY', code: 'JPY', name: 'Japon Yeni', symbol: '¥', decimalPlaces: 0 },
    { id: 'CNY', code: 'CNY', name: 'Çin Yuanı', symbol: '¥', decimalPlaces: 2 },
    { id: 'SAR', code: 'SAR', name: 'Suudi Riyali', symbol: '﷼', decimalPlaces: 2 },
    { id: 'AED', code: 'AED', name: 'Birleşik Arap Emirlikleri Dirhemi', symbol: 'د.إ', decimalPlaces: 2 },
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { id: currency.id },
      update: {},
      create: currency,
    });
  }
  console.log('Created currencies:', currencies.length);

  const store = await prisma.store.upsert({
    where: { id: 'default-store' },
    update: {},
    create: {
      id: 'default-store',
      name: 'Ana Market',
      address: 'İstanbul, Türkiye',
      phone: '+90 212 000 00 00',
      isActive: true,
    },
  });
  console.log('Created store:', store.name);

  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@marketqr.com' },
    update: {},
    create: {
      email: 'admin@marketqr.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      storeId: store.id,
    },
  });
  console.log('Created admin:', admin.email);

  const staffPassword = await bcrypt.hash('staff123', 10);
  const staff = await prisma.user.upsert({
    where: { email: 'staff@marketqr.com' },
    update: {},
    create: {
      email: 'staff@marketqr.com',
      password: staffPassword,
      firstName: 'Personel',
      lastName: 'Kullanıcı',
      role: 'STAFF',
      storeId: store.id,
    },
  });
  console.log('Created staff:', staff.email);

  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@marketqr.com' },
    update: {},
    create: {
      email: 'customer@marketqr.com',
      password: customerPassword,
      firstName: 'Müşteri',
      lastName: 'Kullanıcı',
      role: 'CUSTOMER',
    },
  });
  console.log('Created customer:', customer.email);

  // Ana Kategoriler
  const catGida = await prisma.category.upsert({
    where: { id: 'cat-gida' },
    update: {},
    create: { id: 'cat-gida', name: 'Gıda', sortOrder: 1 },
  });
  const catIcecek = await prisma.category.upsert({
    where: { id: 'cat-icecek' },
    update: {},
    create: { id: 'cat-icecek', name: 'İçecek', sortOrder: 2 },
  });
  const catTemizlik = await prisma.category.upsert({
    where: { id: 'cat-temizlik' },
    update: {},
    create: { id: 'cat-temizlik', name: 'Temizlik', sortOrder: 3 },
  });
  const catMeyve = await prisma.category.upsert({
    where: { id: 'cat-meyve' },
    update: {},
    create: { id: 'cat-meyve', name: 'Meyve & Sebze', sortOrder: 4 },
  });
  const catEt = await prisma.category.upsert({
    where: { id: 'cat-et' },
    update: {},
    create: { id: 'cat-et', name: 'Et & Et Ürünleri', sortOrder: 5 },
  });
  const catSut = await prisma.category.upsert({
    where: { id: 'cat-sut' },
    update: {},
    create: { id: 'cat-sut', name: 'Süt Ürünleri', sortOrder: 6 },
  });
  const catBaklagil = await prisma.category.upsert({
    where: { id: 'cat-baklagil' },
    update: {},
    create: { id: 'cat-baklagil', name: 'Baklagil & Tahıl', sortOrder: 7 },
  });
  const catAtistirmalik = await prisma.category.upsert({
    where: { id: 'cat-atistirmalik' },
    update: {},
    create: { id: 'cat-atistirmalik', name: 'Atıştırmalık', sortOrder: 8 },
  });
  const catKisisel = await prisma.category.upsert({
    where: { id: 'cat-kisisel' },
    update: {},
    create: { id: 'cat-kisisel', name: 'Kişisel Bakım', sortOrder: 9 },
  });
  const catBebek = await prisma.category.upsert({
    where: { id: 'cat-bebek' },
    update: {},
    create: { id: 'cat-bebek', name: 'Bebek Ürünleri', sortOrder: 10 },
  });
  console.log('Created categories: 10');

  // ===== ALT KATEGORİLER =====

  // Gıda Alt Kategorileri
  const catGidaUn = await prisma.category.upsert({
    where: { id: 'cat-gida-un' },
    update: {},
    create: { id: 'cat-gida-un', name: 'Un & Nişasta', parentId: 'cat-gida', sortOrder: 1 },
  });
  const catGidaSeker = await prisma.category.upsert({
    where: { id: 'cat-gida-seker' },
    update: {},
    create: { id: 'cat-gida-seker', name: 'Şeker & Tatlandırıcı', parentId: 'cat-gida', sortOrder: 2 },
  });
  const catGidaTuz = await prisma.category.upsert({
    where: { id: 'cat-gida-tuz' },
    update: {},
    create: { id: 'cat-gida-tuz', name: 'Tuz & Baharat', parentId: 'cat-gida', sortOrder: 3 },
  });
  const catGidaYag = await prisma.category.upsert({
    where: { id: 'cat-gida-yag' },
    update: {},
    create: { id: 'cat-gida-yag', name: 'Yağ & Sos', parentId: 'cat-gida', sortOrder: 4 },
  });
  const catGidaMakarna = await prisma.category.upsert({
    where: { id: 'cat-gida-makarna' },
    update: {},
    create: { id: 'cat-gida-makarna', name: 'Makarna & Pirinç', parentId: 'cat-gida', sortOrder: 5 },
  });
  const catGidaKahvalti = await prisma.category.upsert({
    where: { id: 'cat-gida-kahvalti' },
    update: {},
    create: { id: 'cat-gida-kahvalti', name: 'Kahvaltılık', parentId: 'cat-gida', sortOrder: 6 },
  });

  // İçecek Alt Kategorileri
  const catIcecekSu = await prisma.category.upsert({
    where: { id: 'cat-icecek-su' },
    update: {},
    create: { id: 'cat-icecek-su', name: 'Su & Maden Suyu', parentId: 'cat-icecek', sortOrder: 1 },
  });
  const catIcecekMeyve = await prisma.category.upsert({
    where: { id: 'cat-icecek-meyve' },
    update: {},
    create: { id: 'cat-icecek-meyve', name: 'Meyve Suyu', parentId: 'cat-icecek', sortOrder: 2 },
  });
  const catIcecekGazli = await prisma.category.upsert({
    where: { id: 'cat-icecek-gazli' },
    update: {},
    create: { id: 'cat-icecek-gazli', name: 'Gazlı İçecek', parentId: 'cat-icecek', sortOrder: 3 },
  });
  const catIcecekCay = await prisma.category.upsert({
    where: { id: 'cat-icecek-cay' },
    update: {},
    create: { id: 'cat-icecek-cay', name: 'Çay & Kahve', parentId: 'cat-icecek', sortOrder: 4 },
  });
  const catIcecekSut = await prisma.category.upsert({
    where: { id: 'cat-icecek-sut' },
    update: {},
    create: { id: 'cat-icecek-sut', name: 'Süt İçecek', parentId: 'cat-icecek', sortOrder: 5 },
  });

  // Meyve & Sebze Alt Kategorileri
  const catMeyveMeyve = await prisma.category.upsert({
    where: { id: 'cat-meyve-meyve' },
    update: {},
    create: { id: 'cat-meyve-meyve', name: 'Taze Meyve', parentId: 'cat-meyve', sortOrder: 1 },
  });
  const catMeyveSebze = await prisma.category.upsert({
    where: { id: 'cat-meyve-sebze' },
    update: {},
    create: { id: 'cat-meyve-sebze', name: 'Taze Sebze', parentId: 'cat-meyve', sortOrder: 2 },
  });
  const catMeyveDondurulmus = await prisma.category.upsert({
    where: { id: 'cat-meyve-dondurulmus' },
    update: {},
    create: { id: 'cat-meyve-dondurulmus', name: 'Dondurulmuş Gıda', parentId: 'cat-meyve', sortOrder: 3 },
  });
  const catMeyveKurutulmus = await prisma.category.upsert({
    where: { id: 'cat-meyve-kurutulmus' },
    update: {},
    create: { id: 'cat-meyve-kurutulmus', name: 'Kurutulmuş Meyve', parentId: 'cat-meyve', sortOrder: 4 },
  });

  // Et & Et Ürünleri Alt Kategorileri
  const catEtKirmizi = await prisma.category.upsert({
    where: { id: 'cat-et-kirmizi' },
    update: {},
    create: { id: 'cat-et-kirmizi', name: 'Kırmızı Et', parentId: 'cat-et', sortOrder: 1 },
  });
  const catEtTavuk = await prisma.category.upsert({
    where: { id: 'cat-et-tavuk' },
    update: {},
    create: { id: 'cat-et-tavuk', name: 'Tavuk Ürünleri', parentId: 'cat-et', sortOrder: 2 },
  });
  const catEtBalik = await prisma.category.upsert({
    where: { id: 'cat-et-balik' },
    update: {},
    create: { id: 'cat-et-balik', name: 'Balık & Deniz Ürünleri', parentId: 'cat-et', sortOrder: 3 },
  });
  const catEtSosis = await prisma.category.upsert({
    where: { id: 'cat-et-sosis' },
    update: {},
    create: { id: 'cat-et-sosis', name: 'Sosis & Sucuk', parentId: 'cat-et', sortOrder: 4 },
  });
  const catEtHazir = await prisma.category.upsert({
    where: { id: 'cat-et-hazir' },
    update: {},
    create: { id: 'cat-et-hazir', name: 'Hazır Yemek', parentId: 'cat-et', sortOrder: 5 },
  });

  // Süt Ürünleri Alt Kategorileri
  const catSutYogurt = await prisma.category.upsert({
    where: { id: 'cat-sut-yogurt' },
    update: {},
    create: { id: 'cat-sut-yogurt', name: 'Yoğurt', parentId: 'cat-sut', sortOrder: 1 },
  });
  const catSutPeynir = await prisma.category.upsert({
    where: { id: 'cat-sut-peynir' },
    update: {},
    create: { id: 'cat-sut-peynir', name: 'Peynir', parentId: 'cat-sut', sortOrder: 2 },
  });
  const catSutTereyagi = await prisma.category.upsert({
    where: { id: 'cat-sut-tereyagi' },
    update: {},
    create: { id: 'cat-sut-tereyagi', name: 'Tereyağı & Margarin', parentId: 'cat-sut', sortOrder: 3 },
  });
  const catSutYumurta = await prisma.category.upsert({
    where: { id: 'cat-sut-yumurta' },
    update: {},
    create: { id: 'cat-sut-yumurta', name: 'Yumurta', parentId: 'cat-sut', sortOrder: 4 },
  });

  // Baklagil & Tahıl Alt Kategorileri
  const catBaklagilKuru = await prisma.category.upsert({
    where: { id: 'cat-baklagil-kuru' },
    update: {},
    create: { id: 'cat-baklagil-kuru', name: 'Kuru Baklagil', parentId: 'cat-baklagil', sortOrder: 1 },
  });
  const catBaklagilTahil = await prisma.category.upsert({
    where: { id: 'cat-baklagil-tahil' },
    update: {},
    create: { id: 'cat-baklagil-tahil', name: 'Tahıl Ürünleri', parentId: 'cat-baklagil', sortOrder: 2 },
  });
  const catBaklagilYulaf = await prisma.category.upsert({
    where: { id: 'cat-baklagil-yulaf' },
    update: {},
    create: { id: 'cat-baklagil-yulaf', name: 'Yulaf & Müsli', parentId: 'cat-baklagil', sortOrder: 3 },
  });

  // Atıştırmalık Alt Kategorileri
  const catAtisCikolata = await prisma.category.upsert({
    where: { id: 'cat-atis-cikolata' },
    update: {},
    create: { id: 'cat-atis-cikolata', name: 'Çikolata & Şekerleme', parentId: 'cat-atistirmalik', sortOrder: 1 },
  });
  const catAtisBiskuvi = await prisma.category.upsert({
    where: { id: 'cat-atis-biskuvi' },
    update: {},
    create: { id: 'cat-atis-biskuvi', name: 'Bisküvi & Kurabiye', parentId: 'cat-atistirmalik', sortOrder: 2 },
  });
  const catAtisKuruyemis = await prisma.category.upsert({
    where: { id: 'cat-atis-kuruyemis' },
    update: {},
    create: { id: 'cat-atis-kuruyemis', name: 'Kuruyemiş & Çerez', parentId: 'cat-atistirmalik', sortOrder: 3 },
  });
  const catAtisCips = await prisma.category.upsert({
    where: { id: 'cat-atis-cips' },
    update: {},
    create: { id: 'cat-atis-cips', name: 'Cips & Kraker', parentId: 'cat-atistirmalik', sortOrder: 4 },
  });

  // Temizlik Alt Kategorileri
  const catTemizlikBulasik = await prisma.category.upsert({
    where: { id: 'cat-temizlik-bulasik' },
    update: {},
    create: { id: 'cat-temizlik-bulasik', name: 'Bulaşık Ürünleri', parentId: 'cat-temizlik', sortOrder: 1 },
  });
  const catTemizlikCamasir = await prisma.category.upsert({
    where: { id: 'cat-temizlik-camasir' },
    update: {},
    create: { id: 'cat-temizlik-camasir', name: 'Çamaşır Ürünleri', parentId: 'cat-temizlik', sortOrder: 2 },
  });
  const catTemizlikYuzey = await prisma.category.upsert({
    where: { id: 'cat-temizlik-yuzey' },
    update: {},
    create: { id: 'cat-temizlik-yuzey', name: 'Yüzey Temizleyici', parentId: 'cat-temizlik', sortOrder: 3 },
  });
  const catTemizlikKagit = await prisma.category.upsert({
    where: { id: 'cat-temizlik-kagit' },
    update: {},
    create: { id: 'cat-temizlik-kagit', name: 'Kağıt Ürünleri', parentId: 'cat-temizlik', sortOrder: 4 },
  });
  const catTemizlikCop = await prisma.category.upsert({
    where: { id: 'cat-temizlik-cop' },
    update: {},
    create: { id: 'cat-temizlik-cop', name: 'Çöp Torbası', parentId: 'cat-temizlik', sortOrder: 5 },
  });

  // Kişisel Bakım Alt Kategorileri
  const catKisiselSampuan = await prisma.category.upsert({
    where: { id: 'cat-kisisel-sampuan' },
    update: {},
    create: { id: 'cat-kisisel-sampuan', name: 'Şampuan & Saç Bakımı', parentId: 'cat-kisisel', sortOrder: 1 },
  });
  const catKisiselDis = await prisma.category.upsert({
    where: { id: 'cat-kisisel-dis' },
    update: {},
    create: { id: 'cat-kisisel-dis', name: 'Diş Bakımı', parentId: 'cat-kisisel', sortOrder: 2 },
  });
  const catKisiselDeo = await prisma.category.upsert({
    where: { id: 'cat-kisisel-deo' },
    update: {},
    create: { id: 'cat-kisisel-deo', name: 'Deodorant & Parfüm', parentId: 'cat-kisisel', sortOrder: 3 },
  });
  const catKisiselSabun = await prisma.category.upsert({
    where: { id: 'cat-kisisel-sabun' },
    update: {},
    create: { id: 'cat-kisisel-sabun', name: 'Sabun & Duş Jeli', parentId: 'cat-kisisel', sortOrder: 4 },
  });
  const catKisiselMakyaj = await prisma.category.upsert({
    where: { id: 'cat-kisisel-makyaj' },
    update: {},
    create: { id: 'cat-kisisel-makyaj', name: 'Makyaj', parentId: 'cat-kisisel', sortOrder: 5 },
  });

  // Bebek Ürünleri Alt Kategorileri
  const catBebekBebek = await prisma.category.upsert({
    where: { id: 'cat-bebek-bebek' },
    update: {},
    create: { id: 'cat-bebek-bebek', name: 'Bebek Bezi', parentId: 'cat-bebek', sortOrder: 1 },
  });
  const catBebekBiberon = await prisma.category.upsert({
    where: { id: 'cat-bebek-biberon' },
    update: {},
    create: { id: 'cat-bebek-biberon', name: 'Biberon & Emzik', parentId: 'cat-bebek', sortOrder: 2 },
  });
  const catBebekMama = await prisma.category.upsert({
    where: { id: 'cat-bebek-mama' },
    update: {},
    create: { id: 'cat-bebek-mama', name: 'Bebek Maması', parentId: 'cat-bebek', sortOrder: 3 },
  });
  const catBebekBakim = await prisma.category.upsert({
    where: { id: 'cat-bebek-bakim' },
    update: {},
    create: { id: 'cat-bebek-bakim', name: 'Bebek Bakımı', parentId: 'cat-bebek', sortOrder: 4 },
  });

  console.log('Created subcategories: 45');

  // Eski ürünleri temizle (ilişkili tablolar önce)
  await prisma.productTag.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productPrice.deleteMany();
  await prisma.productQR.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.storeProduct.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.ecommerceProduct.deleteMany();
  await prisma.returnItem.deleteMany();
  await prisma.warehouseTransfer.deleteMany();
  await prisma.warehouseStock.deleteMany();
  await prisma.scanLog.deleteMany();
  await prisma.userFavorite.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.product.deleteMany();
  console.log('Cleared old products');

  // ===== KORZINKA ÜRÜNLERİ (Özbekistan Pazarı - UZS) =====
  const products = [
    // === GIDA - Un & Nişasta ===
    await prisma.product.upsert({
      where: { sku: 'KZ-001' },
      update: {},
      create: {
        sku: 'KZ-001', name: 'Makaron Makfa 500g', description: 'Makfa makaron 500g',
        price: 8500, currency: 'UZS', vatRate: 0, barcode: '4780012345001', categoryId: 'cat-gida-makarna',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-002' },
      update: {},
      create: {
        sku: 'KZ-002', name: 'Guruch Oq 1kg', description: 'Oq guruch tozalangan',
        price: 18500, currency: 'UZS', vatRate: 0, barcode: '4780012345002', categoryId: 'cat-gida-makarna',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-003' },
      update: {},
      create: {
        sku: 'KZ-003', name: 'Bulgur 1kg', description: 'Tozlangan bulgur',
        price: 12000, currency: 'UZS', vatRate: 0, barcode: '4780012345003', categoryId: 'cat-baklagil-tahil',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-004' },
      update: {},
      create: {
        sku: 'KZ-004', name: 'Un "Izzat" 2kg', description: 'Yuqori sifatli un 2kg',
        price: 14500, currency: 'UZS', vatRate: 0, barcode: '4780012345004', categoryId: 'cat-gida-un',
      },
    }),

    // === GIDA - Tuz & Baharat ===
    await prisma.product.upsert({
      where: { sku: 'KZ-005' },
      update: {},
      create: {
        sku: 'KZ-005', name: 'Tuz 1kg', description: 'Iodli sofrasi tuzi',
        price: 3500, currency: 'UZS', vatRate: 0, barcode: '4780012345005', categoryId: 'cat-gida-tuz',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-006' },
      update: {},
      create: {
        sku: 'KZ-006', name: 'Zira', description: 'Zira 50g',
        price: 4500, currency: 'UZS', vatRate: 0, barcode: '4780012345006', categoryId: 'cat-gida-tuz',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-007' },
      update: {},
      create: {
        sku: 'KZ-007', name: 'Qizil mirin', description: 'Qizil mirin 50g',
        price: 5500, currency: 'UZS', vatRate: 0, barcode: '4780012345007', categoryId: 'cat-gida-tuz',
      },
    }),

    // === GIDA - Yağ & Sos ===
    await prisma.product.upsert({
      where: { sku: 'KZ-008' },
      update: {},
      create: {
        sku: 'KZ-008', name: 'Kungaboqar yog\'i 1L', description: 'Kungaboqar yog\'i refined',
        price: 16500, currency: 'UZS', vatRate: 0, barcode: '4780012345008', categoryId: 'cat-gida-yag',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-009' },
      update: {},
      create: {
        sku: 'KZ-009', name: 'Zeytinyagi 500ml', description: 'Zeytinyagi natural',
        price: 42000, currency: 'UZS', vatRate: 0, barcode: '4780012345009', categoryId: 'cat-gida-yag',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-010' },
      update: {},
      create: {
        sku: 'KZ-010', name: 'Soya sousi 250ml', description: 'Soya sousi',
        price: 12000, currency: 'UZS', vatRate: 0, barcode: '4780012345010', categoryId: 'cat-gida-yag',
      },
    }),

    // === GIDA - Kahvaltılık ===
    await prisma.product.upsert({
      where: { sku: 'KZ-011' },
      update: {},
      create: {
        sku: 'KZ-011', name: 'Asal 500g', description: 'Tabiiy asal',
        price: 65000, currency: 'UZS', vatRate: 0, barcode: '4780012345011', categoryId: 'cat-gida-kahvalti',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-012' },
      update: {},
      create: {
        sku: 'KZ-012', name: 'Murabba 300g', description: 'Gilos murabbosi',
        price: 22000, currency: 'UZS', vatRate: 0, barcode: '4780012345012', categoryId: 'cat-gida-kahvalti',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-013' },
      update: {},
      create: {
        sku: 'KZ-013', name: 'Non', description: 'Non tandir',
        price: 3500, currency: 'UZS', vatRate: 0, barcode: '4780012345013', categoryId: 'cat-gida',
      },
    }),

    // === İÇECEK - Su & Maden Suyu ===
    await prisma.product.upsert({
      where: { sku: 'KZ-014' },
      update: {},
      create: {
        sku: 'KZ-014', name: 'Suv 1.5L', description: 'Ichimlik suvi',
        price: 3000, currency: 'UZS', vatRate: 0, barcode: '4780012345014', categoryId: 'cat-icecek-su',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-0115' },
      update: {},
      create: {
        sku: 'KZ-0115', name: 'Suv 5L', description: 'Ichimlik suvi 5 litr',
        price: 7500, currency: 'UZS', vatRate: 0, barcode: '4780012345115', categoryId: 'cat-icecek-su',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-016' },
      update: {},
      create: {
        sku: 'KZ-016', name: 'Maden suyu 0.5L', description: 'Maden suvi gazlangan',
        price: 4000, currency: 'UZS', vatRate: 0, barcode: '4780012345016', categoryId: 'cat-icecek-su',
      },
    }),

    // === İÇECEK - Meyve Suyu ===
    await prisma.product.upsert({
      where: { sku: 'KZ-017' },
      update: {},
      create: {
        sku: 'KZ-017', name: 'Sharbat "Imzo" 1L', description: 'Olma sharbati',
        price: 12000, currency: 'UZS', vatRate: 0, barcode: '4780012345017', categoryId: 'cat-icecek-meyve',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-018' },
      update: {},
      create: {
        sku: 'KZ-018', name: 'Sharbat "Nectar" 1L', description: 'Apelsin sharbati',
        price: 11000, currency: 'UZS', vatRate: 0, barcode: '4780012345018', categoryId: 'cat-icecek-meyve',
      },
    }),

    // === İÇECEK - Gazlı İçecek ===
    await prisma.product.upsert({
      where: { sku: 'KZ-019' },
      update: {},
      create: {
        sku: 'KZ-019', name: 'Kola 1L', description: 'Koka-kola',
        price: 8500, currency: 'UZS', vatRate: 0, barcode: '4780012345019', categoryId: 'cat-icecek-gazli',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-020' },
      update: {},
      create: {
        sku: 'KZ-020', name: 'Sprite 1L', description: 'Sprite gazlangan ichimlik',
        price: 8500, currency: 'UZS', vatRate: 0, barcode: '4780012345020', categoryId: 'cat-icecek-gazli',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-021' },
      update: {},
      create: {
        sku: 'KZ-021', name: 'Fanta 1L', description: 'Fanta apelsin',
        price: 8500, currency: 'UZS', vatRate: 0, barcode: '4780012345021', categoryId: 'cat-icecek-gazli',
      },
    }),

    // === İÇECEK - Çay & Kahve ===
    await prisma.product.upsert({
      where: { sku: 'KZ-022' },
      update: {},
      create: {
        sku: 'KZ-022', name: 'Kofe "Nescafe" 100g', description: 'Nescafe klassik',
        price: 32000, currency: 'UZS', vatRate: 0, barcode: '4780012345022', categoryId: 'cat-icecek-cay',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-023' },
      update: {},
      create: {
        sku: 'KZ-023', name: 'Choy "Madina" 100g', description: 'Qora choy',
        price: 8500, currency: 'UZS', vatRate: 0, barcode: '4780012345023', categoryId: 'cat-icecek-cay',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-024' },
      update: {},
      create: {
        sku: 'KZ-024', name: 'Choy "Kurtos" 100g', description: 'Yashil choy',
        price: 12000, currency: 'UZS', vatRate: 0, barcode: '4780012345024', categoryId: 'cat-icecek-cay',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-025' },
      update: {},
      create: {
        sku: 'KZ-025', name: 'Kofe "Jardin" 200g', description: 'Jardin kofe',
        price: 18000, currency: 'UZS', vatRate: 0, barcode: '4780012345025', categoryId: 'cat-icecek-cay',
      },
    }),

    // === İÇECEK - Süt İçecek ===
    await prisma.product.upsert({
      where: { sku: 'KZ-026' },
      update: {},
      create: {
        sku: 'KZ-026', name: 'Ayran 400ml', description: 'Tuzlangan sut',
        price: 5500, currency: 'UZS', vatRate: 0, barcode: '4780012345026', categoryId: 'cat-icecek-sut',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-027' },
      update: {},
      create: {
        sku: 'KZ-027', name: 'Kefir 1L', description: 'Kefir',
        price: 9500, currency: 'UZS', vatRate: 0, barcode: '4780012345027', categoryId: 'cat-icecek-sut',
      },
    }),

    // === MEYVE & SEBZE - Taze Meyve ===
    await prisma.product.upsert({
      where: { sku: 'KZ-028' },
      update: {},
      create: {
        sku: 'KZ-028', name: 'Olma 1kg', description: 'Qizil olma',
        price: 8000, currency: 'UZS', vatRate: 0, barcode: '4780012345028', categoryId: 'cat-meyve-meyve',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-029' },
      update: {},
      create: {
        sku: 'KZ-029', name: 'Banan 1kg', description: 'Banan',
        price: 18000, currency: 'UZS', vatRate: 0, barcode: '4780012345029', categoryId: 'cat-meyve-meyve',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-030' },
      update: {},
      create: {
        sku: 'KZ-030', name: 'Uzum 1kg', description: 'Yashil uzum',
        price: 15000, currency: 'UZS', vatRate: 0, barcode: '4780012345030', categoryId: 'cat-meyve-meyve',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-031' },
      update: {},
      create: {
        sku: 'KZ-031', name: 'Anor 1kg', description: 'Anor',
        price: 12000, currency: 'UZS', vatRate: 0, barcode: '4780012345031', categoryId: 'cat-meyve-meyve',
      },
    }),

    // === MEYVE & SEBZE - Taze Sebze ===
    await prisma.product.upsert({
      where: { sku: 'KZ-032' },
      update: {},
      create: {
        sku: 'KZ-032', name: 'Pomidor 1kg', description: 'Pomidor',
        price: 6500, currency: 'UZS', vatRate: 0, barcode: '4780012345032', categoryId: 'cat-meyve-sebze',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-033' },
      update: {},
      create: {
        sku: 'KZ-033', name: 'Bodring 1kg', description: 'Bodring',
        price: 7000, currency: 'UZS', vatRate: 0, barcode: '4780012345033', categoryId: 'cat-meyve-sebze',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-034' },
      update: {},
      create: {
        sku: 'KZ-034', name: 'Kartoshka 1kg', description: 'Kartoshka',
        price: 4500, currency: 'UZS', vatRate: 0, barcode: '4780012345034', categoryId: 'cat-meyve-sebze',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-035' },
      update: {},
      create: {
        sku: 'KZ-035', name: 'Piyoz 1kg', description: 'Piyoz',
        price: 3500, currency: 'UZS', vatRate: 0, barcode: '4780012345035', categoryId: 'cat-meyve-sebze',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-036' },
      update: {},
      create: {
        sku: 'KZ-036', name: 'Sabzi 1kg', description: 'Sabzi',
        price: 4000, currency: 'UZS', vatRate: 0, barcode: '4780012345036', categoryId: 'cat-meyve-sebze',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-037' },
      update: {},
      create: {
        sku: 'KZ-037', name: 'Karam 1 dona', description: 'Oq karam',
        price: 5500, currency: 'UZS', vatRate: 0, barcode: '4780012345037', categoryId: 'cat-meyve-sebze',
      },
    }),

    // === ET & ET ÜRÜNLERİ - Kırmızı Et ===
    await prisma.product.upsert({
      where: { sku: 'KZ-038' },
      update: {},
      create: {
        sku: 'KZ-038', name: 'Go\'sht mol 1kg', description: 'Mol go\'shti yangi',
        price: 85000, currency: 'UZS', vatRate: 0, barcode: '4780012345038', categoryId: 'cat-et-kirmizi',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-039' },
      update: {},
      create: {
        sku: 'KZ-039', name: 'Qo\'y go\'shti 1kg', description: 'Qo\'y go\'shti yangi',
        price: 95000, currency: 'UZS', vatRate: 0, barcode: '4780012345039', categoryId: 'cat-et-kirmizi',
      },
    }),

    // === ET & ET ÜRÜNLERİ - Tavuk ===
    await prisma.product.upsert({
      where: { sku: 'KZ-040' },
      update: {},
      create: {
        sku: 'KZ-040', name: 'Tovuq go\'shti 1kg', description: 'Tovuq go\'shti',
        price: 32000, currency: 'UZS', vatRate: 0, barcode: '4780012345040', categoryId: 'cat-et-tavuk',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-041' },
      update: {},
      create: {
        sku: 'KZ-041', name: 'Tovuq file 500g', description: 'Tovuq file',
        price: 22000, currency: 'UZS', vatRate: 0, barcode: '4780012345041', categoryId: 'cat-et-tavuk',
      },
    }),

    // === ET & ET ÜRÜNLERİ - Sosis & Sucuk ===
    await prisma.product.upsert({
      where: { sku: 'KZ-042' },
      update: {},
      create: {
        sku: 'KZ-042', name: 'Kolbasa 300g', description: 'Kolbasa',
        price: 18000, currency: 'UZS', vatRate: 0, barcode: '4780012345042', categoryId: 'cat-et-sosis',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-043' },
      update: {},
      create: {
        sku: 'KZ-043', name: 'Sudjuk 250g', description: 'Sudjuk',
        price: 25000, currency: 'UZS', vatRate: 0, barcode: '4780012345043', categoryId: 'cat-et-sosis',
      },
    }),

    // === SÜT ÜRÜNLERİ - Yoğurt ===
    await prisma.product.upsert({
      where: { sku: 'KZ-044' },
      update: {},
      create: {
        sku: 'KZ-044', name: 'Moloko 1L', description: 'Sut yangi',
        price: 8500, currency: 'UZS', vatRate: 0, barcode: '4780012345044', categoryId: 'cat-sut',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-045' },
      update: {},
      create: {
        sku: 'KZ-045', name: 'Yog\'urt 500g', description: 'Yog\'urt',
        price: 7500, currency: 'UZS', vatRate: 0, barcode: '4780012345045', categoryId: 'cat-sut-yogurt',
      },
    }),

    // === SÜT ÜRÜNLERİ - Peynir ===
    await prisma.product.upsert({
      where: { sku: 'KZ-046' },
      update: {},
      create: {
        sku: 'KZ-046', name: 'Pishloq 500g', description: 'Sariq pishloq',
        price: 28000, currency: 'UZS', vatRate: 0, barcode: '4780012345046', categoryId: 'cat-sut-peynir',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-047' },
      update: {},
      create: {
        sku: 'KZ-047', name: 'Brynsa 300g', description: 'Brynsa',
        price: 15000, currency: 'UZS', vatRate: 0, barcode: '4780012345047', categoryId: 'cat-sut-peynir',
      },
    }),

    // === SÜT ÜRÜNLERİ - Yumurta ===
    await prisma.product.upsert({
      where: { sku: 'KZ-048' },
      update: {},
      create: {
        sku: 'KZ-048', name: 'Tuxum 10 dona', description: 'Tuxum',
        price: 12000, currency: 'UZS', vatRate: 0, barcode: '4780012345048', categoryId: 'cat-sut-yumurta',
      },
    }),

    // === BAKLAGİL ===
    await prisma.product.upsert({
      where: { sku: 'KZ-049' },
      update: {},
      create: {
        sku: 'KZ-049', name: 'Lentikula 1kg', description: 'Lentikula qizil',
        price: 14000, currency: 'UZS', vatRate: 0, barcode: '4780012345049', categoryId: 'cat-baklagil-kuru',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-050' },
      update: {},
      create: {
        sku: 'KZ-050', name: 'Nohot 1kg', description: 'Nohot',
        price: 16000, currency: 'UZS', vatRate: 0, barcode: '4780012345050', categoryId: 'cat-baklagil-kuru',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-051' },
      update: {},
      create: {
        sku: 'KZ-051', name: 'Mosh 1kg', description: 'Mosh',
        price: 12000, currency: 'UZS', vatRate: 0, barcode: '4780012345051', categoryId: 'cat-baklagil-kuru',
      },
    }),

    // === ATIŞTIRMALIK - Çikolata ===
    await prisma.product.upsert({
      where: { sku: 'KZ-052' },
      update: {},
      create: {
        sku: 'KZ-052', name: 'Shokolad "Alpen Gold" 90g', description: 'Sutli shokolad',
        price: 12000, currency: 'UZS', vatRate: 0, barcode: '4780012345052', categoryId: 'cat-atis-cikolata',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-053' },
      update: {},
      create: {
        sku: 'KZ-053', name: 'Shokolad "Milka" 100g', description: 'Milka sutli shokolad',
        price: 15000, currency: 'UZS', vatRate: 0, barcode: '4780012345053', categoryId: 'cat-atis-cikolata',
      },
    }),

    // === ATIŞTIRMALIK - Bisküvi ===
    await prisma.product.upsert({
      where: { sku: 'KZ-054' },
      update: {},
      create: {
        sku: 'KZ-054', name: 'Pechenye "Юubileynoye" 200g', description: 'Pechenye',
        price: 6500, currency: 'UZS', vatRate: 0, barcode: '4780012345054', categoryId: 'cat-atis-biskuvi',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-055' },
      update: {},
      create: {
        sku: 'KZ-055', name: 'Biskvit "Tort" 150g', description: 'Biskvit',
        price: 8000, currency: 'UZS', vatRate: 0, barcode: '4780012345055', categoryId: 'cat-atis-biskuvi',
      },
    }),

    // === ATIŞTIRMALIK - Kuruyemiş ===
    await prisma.product.upsert({
      where: { sku: 'KZ-056' },
      update: {},
      create: {
        sku: 'KZ-056', name: 'Yong\'oq 200g', description: 'Bodom',
        price: 22000, currency: 'UZS', vatRate: 0, barcode: '4780012345056', categoryId: 'cat-atis-kuruyemis',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-057' },
      update: {},
      create: {
        sku: 'KZ-057', name: 'Kungaboqar urug\'i 200g', description: 'Kungaboqar urug\'i',
        price: 8000, currency: 'UZS', vatRate: 0, barcode: '4780012345057', categoryId: 'cat-atis-kuruyemis',
      },
    }),

    // === TEMİZLİK ===
    await prisma.product.upsert({
      where: { sku: 'KZ-058' },
      update: {},
      create: {
        sku: 'KZ-058', name: 'Ulidish vositasi 1L', description: 'Ulidish uchun',
        price: 12000, currency: 'UZS', vatRate: 0, barcode: '4780012345058', categoryId: 'cat-temizlik-bulasik',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-059' },
      update: {},
      create: {
        sku: 'KZ-059', name: 'Kir yuvish 3kg', description: 'Kir yuvish kukuni',
        price: 32000, currency: 'UZS', vatRate: 0, barcode: '4780012345059', categoryId: 'cat-temizlik-camasir',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-060' },
      update: {},
      create: {
        sku: 'KZ-060', name: 'Tozalash vositasi 500ml', description: 'Pol tozalash',
        price: 8500, currency: 'UZS', vatRate: 0, barcode: '4780012345060', categoryId: 'cat-temizlik-yuzey',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-061' },
      update: {},
      create: {
        sku: 'KZ-061', name: 'Salfetka 100', description: 'Qog\'oz salfetka',
        price: 6500, currency: 'UZS', vatRate: 0, barcode: '4780012345061', categoryId: 'cat-temizlik-kagit',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-062' },
      update: {},
      create: {
        sku: 'KZ-062', name: 'Tualet qog\'ozi 8', description: 'Tualet qog\'ozi',
        price: 9500, currency: 'UZS', vatRate: 0, barcode: '4780012345062', categoryId: 'cat-temizlik-kagit',
      },
    }),

    // === KİŞİSEL BAKIM ===
    await prisma.product.upsert({
      where: { sku: 'KZ-063' },
      update: {},
      create: {
        sku: 'KZ-063', name: 'Shampun 400ml', description: 'Shampun',
        price: 18000, currency: 'UZS', vatRate: 0, barcode: '4780012345063', categoryId: 'cat-kisisel-sampuan',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-064' },
      update: {},
      create: {
        sku: 'KZ-064', name: 'Tish pastasi 100ml', description: 'Tish pastasi',
        price: 12000, currency: 'UZS', vatRate: 0, barcode: '4780012345064', categoryId: 'cat-kisisel-dis',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-065' },
      update: {},
      create: {
        sku: 'KZ-065', name: 'Deodorant 150ml', description: 'Deodorant',
        price: 15000, currency: 'UZS', vatRate: 0, barcode: '4780012345065', categoryId: 'cat-kisisel-deo',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-066' },
      update: {},
      create: {
        sku: 'KZ-066', name: 'Sabun 100g', description: 'Yuvish sabuni',
        price: 4500, currency: 'UZS', vatRate: 0, barcode: '4780012345066', categoryId: 'cat-kisisel-sabun',
      },
    }),

    // === BEBEK ===
    await prisma.product.upsert({
      where: { sku: 'KZ-067' },
      update: {},
      create: {
        sku: 'KZ-067', name: 'Pampers 50', description: 'Bolalar tuflagi',
        price: 42000, currency: 'UZS', vatRate: 0, barcode: '4780012345067', categoryId: 'cat-bebek-bebek',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-068' },
      update: {},
      create: {
        sku: 'KZ-068', name: 'Bolalar sut 400g', description: 'Bolalar uchun sut',
        price: 18000, currency: 'UZS', vatRate: 0, barcode: '4780012345068', categoryId: 'cat-bebek-mama',
      },
    }),
    await prisma.product.upsert({
      where: { sku: 'KZ-069' },
      update: {},
      create: {
        sku: 'KZ-069', name: 'Bolalar shampun 250ml', description: 'Bolalar uchun shampun',
        price: 12000, currency: 'UZS', vatRate: 0, barcode: '4780012345069', categoryId: 'cat-bebek-bakim',
      },
    }),
  ];
  console.log('Created products:', products.length);

  // ===== ÜRÜN RESİMLERİ =====
  const productImages: { [key: string]: { url: string; alt: string } } = {
    'KZ-001': { url: 'https://placehold.co/400x400/FFF3E0/FF6D00?text=Makaron', alt: 'Makaron Makfa' },
    'KZ-002': { url: 'https://placehold.co/400x400/FFFFFF/333333?text=Guruch', alt: 'Guruch Oq' },
    'KZ-003': { url: 'https://placehold.co/400x400/FFF8E1/F57F17?text=Bulgur', alt: 'Bulgur' },
    'KZ-004': { url: 'https://placehold.co/400x400/FFFDE7/F9A825?text=Un', alt: 'Un Izzat' },
    'KZ-005': { url: 'https://placehold.co/400x400/E3F2FD/1565C0?text=Tuz', alt: 'Tuz' },
    'KZ-006': { url: 'https://placehold.co/400x400/EFEBE9/795548?text=Zira', alt: 'Zira' },
    'KZ-007': { url: 'https://placehold.co/400x400/FBE9E7/D84315?text=Mirin', alt: 'Qizil Mirin' },
    'KZ-008': { url: 'https://placehold.co/400x400/FFF9C4/FBC02D?text=Kungaboqar', alt: 'Kungaboqar yogi' },
    'KZ-009': { url: 'https://placehold.co/400x400/F1F8E9/689F38?text=Zeytinyagi', alt: 'Zeytinyagi' },
    'KZ-010': { url: 'https://placehold.co/400x400/3E2723/FFFFFF?text=Soya', alt: 'Soya sousi' },
    'KZ-011': { url: 'https://placehold.co/400x400/FFF8E1/F57F17?text=Asal', alt: 'Asal' },
    'KZ-012': { url: 'https://placehold.co/400x400/FCE4EC/C62828?text=Murabba', alt: 'Murabba' },
    'KZ-013': { url: 'https://placehold.co/400x400/FFF3E0/E65100?text=Non', alt: 'Non' },
    'KZ-014': { url: 'https://placehold.co/400x400/E3F2FD/1976D2?text=Suv', alt: 'Suv 1.5L' },
    'KZ-0115': { url: 'https://placehold.co/400x400/E3F2FD/1565C0?text=Suv+5L', alt: 'Suv 5L' },
    'KZ-016': { url: 'https://placehold.co/400x400/E0F7FA/00838F?text=Maden', alt: 'Maden suyu' },
    'KZ-017': { url: 'https://placehold.co/400x400/C8E6C9/2E7D32?text=Olma', alt: 'Olma sharbati' },
    'KZ-018': { url: 'https://placehold.co/400x400/FFE0B2/E65100?text=Apelsin', alt: 'Apelsin sharbati' },
    'KZ-019': { url: 'https://placehold.co/400x400/424242/FF1744?text=Kola', alt: 'Kola' },
    'KZ-020': { url: 'https://placehold.co/400x400/E8F5E9/1B5E20?text=Sprite', alt: 'Sprite' },
    'KZ-021': { url: 'https://placehold.co/400x400/FFF3E0/E65100?text=Fanta', alt: 'Fanta' },
    'KZ-022': { url: 'https://placehold.co/400x400/3E2723/FF6F00?text=Nescafe', alt: 'Nescafe' },
    'KZ-023': { url: 'https://placehold.co/400x400/1B5E20/FFFFFF?text=Madina', alt: 'Choy Madina' },
    'KZ-024': { url: 'https://placehold.co/400x400/4E342E/FFFFFF?text=Kurtos', alt: 'Choy Kurtos' },
    'KZ-025': { url: 'https://placehold.co/400x400/4E342E/FDD835?text=Jardin', alt: 'Kofe Jardin' },
    'KZ-026': { url: 'https://placehold.co/400x400/F5F5F5/333333?text=Ayran', alt: 'Ayran' },
    'KZ-027': { url: 'https://placehold.co/400x400/E8F5E9/558B2F?text=Kefir', alt: 'Kefir' },
    'KZ-028': { url: 'https://placehold.co/400x400/E53935/FFFFFF?text=Olma', alt: 'Olma' },
    'KZ-029': { url: 'https://placehold.co/400x400/FFF176/F9A825?text=Banan', alt: 'Banan' },
    'KZ-030': { url: 'https://placehold.co/400x400/81C784/FFFFFF?text=Uzum', alt: 'Uzum' },
    'KZ-031': { url: 'https://placehold.co/400x400/C62828/FFFFFF?text=Anor', alt: 'Anor' },
    'KZ-032': { url: 'https://placehold.co/400x400/E53935/FFFFFF?text=Pomidor', alt: 'Pomidor' },
    'KZ-033': { url: 'https://placehold.co/400x400/66BB6A/FFFFFF?text=Bodring', alt: 'Bodring' },
    'KZ-034': { url: 'https://placehold.co/400x400/FFEE58/795548?text=Kartoshka', alt: 'Kartoshka' },
    'KZ-035': { url: 'https://placehold.co/400x400/E1BEE7/4A148C?text=Piyoz', alt: 'Piyoz' },
    'KZ-036': { url: 'https://placehold.co/400x400/FF9800/FFFFFF?text=Sabzi', alt: 'Sabzi' },
    'KZ-037': { url: 'https://placehold.co/400x400/C8E6C9/1B5E20?text=Karam', alt: 'Karam' },
    'KZ-038': { url: 'https://placehold.co/400x400/D32F2F/FFFFFF?text=Mol', alt: 'Mol goshti' },
    'KZ-039': { url: 'https://placehold.co/400x400/E53935/FFFFFF?text=Qoy', alt: 'Qoy goshti' },
    'KZ-040': { url: 'https://placehold.co/400x400/FFCDD2/C62828?text=Tovuq', alt: 'Tovuq' },
    'KZ-041': { url: 'https://placehold.co/400x400/FFEBEE/B71C1C?text=File', alt: 'Tovuq file' },
    'KZ-042': { url: 'https://placehold.co/400x400/D32F2F/FFFFFF?text=Kolbasa', alt: 'Kolbasa' },
    'KZ-043': { url: 'https://placehold.co/400x400/B71C1C/FFFFFF?text=Sudjuk', alt: 'Sudjuk' },
    'KZ-044': { url: 'https://placehold.co/400x400/E3F2FD/0D47A1?text=Moloko', alt: 'Moloko' },
    'KZ-045': { url: 'https://placehold.co/400x400/F5F5F5/333333?text=Yogurt', alt: 'Yogurt' },
    'KZ-046': { url: 'https://placehold.co/400x400/FFF9C4/F57F17?text=Pishloq', alt: 'Pishloq' },
    'KZ-047': { url: 'https://placehold.co/400x400/FFFDE7/F9A825?text=Brynsa', alt: 'Brynsa' },
    'KZ-048': { url: 'https://placehold.co/400x400/FFF8E1/FF8F00?text=Tuxum', alt: 'Tuxum' },
    'KZ-049': { url: 'https://placehold.co/400x400/E65100/FFFFFF?text=Lenti', alt: 'Lentikula' },
    'KZ-050': { url: 'https://placehold.co/400x400/F5F5F5/333333?text=Nohot', alt: 'Nohot' },
    'KZ-051': { url: 'https://placehold.co/400x400/4E342E/FFFFFF?text=Mosh', alt: 'Mosh' },
    'KZ-052': { url: 'https://placehold.co/400x400/5D4037/FFEB3B?text=Alpen', alt: 'Alpen Gold' },
    'KZ-053': { url: 'https://placehold.co/400x400/7B1FA2/FFFFFF?text=Milka', alt: 'Milka' },
    'KZ-054': { url: 'https://placehold.co/400x400/FF8F00/FFFFFF?text=Pechenye', alt: 'Pechenye' },
    'KZ-055': { url: 'https://placehold.co/400x400/D84315/FFFFFF?text=Biskvit', alt: 'Biskvit' },
    'KZ-056': { url: 'https://placehold.co/400x400/4E342E/FFEB3B?text=Bodom', alt: 'Bodom' },
    'KZ-057': { url: 'https://placehold.co/400x400/33691E/FDD835?text=Kungaboqar', alt: 'Kungaboqar urug\'i' },
    'KZ-058': { url: 'https://placehold.co/400x400/2196F3/FFFFFF?text=Ulidish', alt: 'Ulidish vositasi' },
    'KZ-059': { url: 'https://placehold.co/400x400/1565C0/FFFFFF?text=Kir', alt: 'Kir yuvish' },
    'KZ-060': { url: 'https://placehold.co/400x400/4CAF50/FFFFFF?text=Tozalash', alt: 'Tozalash' },
    'KZ-061': { url: 'https://placehold.co/400x400/E1F5FE/0288D1?text=Salfetka', alt: 'Salfetka' },
    'KZ-062': { url: 'https://placehold.co/400x400/F3E5F5/7B1FA2?text=Tuvalet', alt: 'Tuvalet qog\'ozi' },
    'KZ-063': { url: 'https://placehold.co/400x400/FF6F00/FFFFFF?text=Shampun', alt: 'Shampun' },
    'KZ-064': { url: 'https://placehold.co/400x400/00BCD4/FFFFFF?text=Tish', alt: 'Tish pastasi' },
    'KZ-065': { url: 'https://placehold.co/400x400/7C4DFF/FFFFFF?text=Deo', alt: 'Deodorant' },
    'KZ-066': { url: 'https://placehold.co/400x400/FFC107/333333?text=Sabun', alt: 'Sabun' },
    'KZ-067': { url: 'https://placehold.co/400x400/E3F2FD/1976D2?text=Pampers', alt: 'Pampers' },
    'KZ-068': { url: 'https://placehold.co/400x400/E8F5E9/388E3C?text=Bolalar', alt: 'Bolalar sut' },
    'KZ-069': { url: 'https://placehold.co/400x400/F8BBD0/C2185B?text=Shampun', alt: 'Bolalar shampun' },
  };

  for (const product of products) {
    const imageData = productImages[product.sku];
    if (imageData) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: imageData.url,
          alt: imageData.alt,
          isPrimary: true,
          sortOrder: 0,
        },
      });
    }
  }
  console.log('Created product images');

  for (const product of products) {
    await prisma.storeProduct.upsert({
      where: {
        storeId_productId: { storeId: store.id, productId: product.id },
      },
      update: {},
      create: {
        storeId: store.id,
        productId: product.id,
        stockQuantity: Math.floor(Math.random() * 100) + 10,
        shelfNumber: 'R' + (Math.floor(Math.random() * 5) + 1),
        minStockThreshold: 10,
      },
    });
  }
  console.log('Created store products (inventory)');

  // Suppliers
  const suppliers = [
    await prisma.supplier.upsert({
      where: { id: 'supplier-1' },
      update: {},
      create: {
        id: 'supplier-1',
        name: 'ABC Gıda Ltd.',
        contactName: 'Ahmet Yılmaz',
        phone: '+90 555 111 2233',
        email: 'info@abcgida.com',
        address: 'İstanbul, Pendik',
        taxNumber: '1234567890',
        rating: 4.5,
        notes: 'Güvenilir tedarikçi',
      },
    }),
    await prisma.supplier.upsert({
      where: { id: 'supplier-2' },
      update: {},
      create: {
        id: 'supplier-2',
        name: 'XYZ İçecek A.Ş.',
        contactName: 'Mehmet Kaya',
        phone: '+90 555 444 5566',
        email: 'satis@xyzicecek.com',
        address: 'Ankara, Çankaya',
        taxNumber: '9876543210',
        rating: 4.0,
      },
    }),
    await prisma.supplier.upsert({
      where: { id: 'supplier-3' },
      update: {},
      create: {
        id: 'supplier-3',
        name: 'Temizlik Dünyası',
        contactName: 'Fatma Demir',
        phone: '+90 555 777 8899',
        email: 'info@temizlikdunyasi.com',
        address: 'İzmir, Bornova',
        taxNumber: '5678901234',
        rating: 3.8,
      },
    }),
    await prisma.supplier.upsert({
      where: { id: 'supplier-4' },
      update: {},
      create: {
        id: 'supplier-4',
        name: 'Meyve Sepeti Ltd.',
        contactName: 'Ali Çelik',
        phone: '+90 555 222 3344',
        email: 'info@meyvesepeti.com',
        address: 'Antalya, Konyaaltı',
        taxNumber: '3456789012',
        rating: 4.2,
        notes: 'Taze meyve sebze tedarikçisi',
      },
    }),
    await prisma.supplier.upsert({
      where: { id: 'supplier-5' },
      update: {},
      create: {
        id: 'supplier-5',
        name: 'Etçi Mehmet A.Ş.',
        contactName: 'Mehmet Öztürk',
        phone: '+90 555 333 4455',
        email: 'satis@etcimehmet.com',
        address: 'Konya, Meram',
        taxNumber: '4567890123',
        rating: 4.6,
        notes: 'Helal sertifikalı et ürünleri',
      },
    }),
    await prisma.supplier.upsert({
      where: { id: 'supplier-6' },
      update: {},
      create: {
        id: 'supplier-6',
        name: 'Sütçü Ali Ltd.',
        contactName: 'Ali Kaya',
        phone: '+90 555 555 6677',
        email: 'info@sutcuali.com',
        address: 'Edirne, Merkez',
        taxNumber: '5678901235',
        rating: 4.4,
        notes: 'Günlük taze süt ürünleri',
      },
    }),
    await prisma.supplier.upsert({
      where: { id: 'supplier-7' },
      update: {},
      create: {
        id: 'supplier-7',
        name: 'Bebek Dostu A.Ş.',
        contactName: 'Zeynep Arslan',
        phone: '+90 555 666 7788',
        email: 'info@bebekdostu.com',
        address: 'İstanbul, Kadıköy',
        taxNumber: '6789012345',
        rating: 4.3,
        notes: 'Bebek ürünleri tedarikçisi',
      },
    }),
  ];
  console.log('Created suppliers:', suppliers.length);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
