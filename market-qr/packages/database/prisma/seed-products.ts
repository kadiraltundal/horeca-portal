const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 5 kategori ve 15 ürün ekleniyor...');

  // ─── 5 KATEGORİ ───────────────────────────────────────────────────────────
  const categories = [
    { id: 'cat-gida',      name: 'Gıda & Bakliyat',     sortOrder: 1 },
    { id: 'cat-icecek',    name: 'İçecek',               sortOrder: 2 },
    { id: 'cat-sut',       name: 'Süt & Süt Ürünleri',  sortOrder: 3 },
    { id: 'cat-temizlik',  name: 'Temizlik & Hijyen',    sortOrder: 4 },
    { id: 'cat-atistirma', name: 'Atıştırmalık & Tatlı', sortOrder: 5 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name, sortOrder: cat.sortOrder },
      create: cat,
    });
    console.log(`  ✓ Kategori: ${cat.name}`);
  }

  // ─── 15 ÜRÜN (her kategoriden 3'er tane) ─────────────────────────────────
  const products = [
    // Gıda & Bakliyat (3)
    {
      sku: 'PRD-001', name: 'Makarna 500g', description: 'İtalyan tipi spagetti makarna',
      price: 18.90, vatRate: 1, barcode: '8690001000011', categoryId: 'cat-gida',
    },
    {
      sku: 'PRD-002', name: 'Pirinç 1kg', description: 'Baldo pirinç, uzun taneli',
      price: 42.50, vatRate: 1, barcode: '8690001000012', categoryId: 'cat-gida',
    },
    {
      sku: 'PRD-003', name: 'Kırmızı Mercimek 1kg', description: 'Tane kırmızı mercimek',
      price: 29.90, vatRate: 1, barcode: '8690001000013', categoryId: 'cat-gida',
    },
    // İçecek (3)
    {
      sku: 'PRD-004', name: 'Su 1.5L', description: 'Doğal kaynak suyu',
      price: 8.50, vatRate: 1, barcode: '8690002000011', categoryId: 'cat-icecek',
    },
    {
      sku: 'PRD-005', name: 'Portakal Suyu 1L', description: 'Meyve suyu %100 portakal',
      price: 34.90, vatRate: 8, barcode: '8690002000012', categoryId: 'cat-icecek',
    },
    {
      sku: 'PRD-006', name: 'Kola 2.5L', description: 'Gazlı içecek, büyük boy',
      price: 49.90, vatRate: 8, barcode: '8690002000013', categoryId: 'cat-icecek',
    },
    // Süt & Süt Ürünleri (3)
    {
      sku: 'PRD-007', name: 'Süt 1L', description: 'Tam yağlı UHT süt',
      price: 24.99, vatRate: 1, barcode: '8690003000011', categoryId: 'cat-sut',
    },
    {
      sku: 'PRD-008', name: 'Yoğurt 1kg', description: 'Tam yağlı sade yoğurt',
      price: 38.00, vatRate: 1, barcode: '8690003000012', categoryId: 'cat-sut',
    },
    {
      sku: 'PRD-009', name: 'Beyaz Peynir 400g', description: 'Klasik Türk beyaz peyniri',
      price: 64.90, vatRate: 1, barcode: '8690003000013', categoryId: 'cat-sut',
    },
    // Temizlik & Hijyen (3)
    {
      sku: 'PRD-010', name: 'Çamaşır Deterjanı 4kg', description: 'Renkli çamaşır deterjanı',
      price: 189.90, vatRate: 20, barcode: '8690004000011', categoryId: 'cat-temizlik',
    },
    {
      sku: 'PRD-011', name: 'Bulaşık Deterjanı 1L', description: 'Sıvı bulaşık deterjanı, limon kokulu',
      price: 45.50, vatRate: 20, barcode: '8690004000012', categoryId: 'cat-temizlik',
    },
    {
      sku: 'PRD-012', name: 'Tuvalet Kağıdı 32li', description: 'Çift katlı tuvalet kağıdı',
      price: 159.00, vatRate: 20, barcode: '8690004000013', categoryId: 'cat-temizlik',
    },
    // Atıştırmalık & Tatlı (3)
    {
      sku: 'PRD-013', name: 'Cips 150g', description: 'Patates cipsi, tuzlu',
      price: 22.90, vatRate: 8, barcode: '8690005000011', categoryId: 'cat-atistirma',
    },
    {
      sku: 'PRD-014', name: 'Çikolata 80g', description: 'Sütlü çikolata',
      price: 19.90, vatRate: 8, barcode: '8690005000012', categoryId: 'cat-atistirma',
    },
    {
      sku: 'PRD-015', name: 'Bisküvi 200g', description: 'Yuvarlak sade bisküvi',
      price: 14.90, vatRate: 8, barcode: '8690005000013', categoryId: 'cat-atistirma',
    },
  ];

  for (const p of products) {
    const created = await prisma.product.upsert({
      where: { sku: p.sku },
      update: { name: p.name, price: p.price, description: p.description, barcode: p.barcode },
      create: p,
    });
    console.log(`  ✓ Ürün: ${created.name} (${created.sku}) — ${created.price} TL`);
  }

  // ─── MAĞAZAYA STOK EKL (default-store varsa) ─────────────────────────────
  const store = await prisma.store.findFirst({ where: { id: 'default-store' } });
  if (store) {
    const allProducts = await prisma.product.findMany({ where: { sku: { in: products.map(p => p.sku) } } });
    for (const prod of allProducts) {
      await prisma.storeProduct.upsert({
        where: { storeId_productId: { storeId: store.id, productId: prod.id } },
        update: {},
        create: {
          storeId: store.id,
          productId: prod.id,
          stockQuantity: Math.floor(Math.random() * 150) + 20,
          shelfNumber: 'R' + (Math.floor(Math.random() * 8) + 1),
          minStockThreshold: 10,
        },
      });
    }
    console.log(`\n  ✓ Tüm ürünler "${store.name}" mağazasına stok olarak eklendi.`);
  }

  console.log('\n✅ Tamamlandı: 5 kategori, 15 ürün.');
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
