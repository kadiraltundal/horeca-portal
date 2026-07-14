import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from '../products.service';
import { PrismaService } from '../../../config/prisma.service';
import { createPrismaMock } from '../../../test-utils/prisma-mock';
import { mockProduct, mockStoreProduct, mockBrand, mockSupplier, mockCategory } from '../../../test-utils/mock-fixtures';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const storeProducts = [mockStoreProduct(), mockStoreProduct({ productId: 'product-456' })];
      prisma.storeProduct.findMany.mockResolvedValue(storeProducts);
      prisma.storeProduct.count.mockResolvedValue(2);

      const result = await service.findAll('store-123', 1, 20);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by search query', async () => {
      prisma.storeProduct.findMany.mockResolvedValue([]);
      prisma.storeProduct.count.mockResolvedValue(0);

      await service.findAll('store-123', 1, 20, 'test');

      const findManyCall = prisma.storeProduct.findMany.mock.calls[0][0];
      expect(findManyCall.where.product).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a store product', async () => {
      const storeProduct = mockStoreProduct();
      prisma.storeProduct.findUnique.mockResolvedValue(storeProduct);

      const result = await service.findOne('store-123', 'product-123');

      expect(result).toEqual(storeProduct);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(null);

      await expect(service.findOne('store-123', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByQrToken', () => {
    it('should return product by QR token', async () => {
      const productQR = {
        storeId: 'store-123',
        productId: 'product-123',
        product: mockProduct(),
        store: { id: 'store-123', name: 'Store' },
      };
      prisma.productQR.findUnique.mockResolvedValue(productQR);
      prisma.storeProduct.findUnique.mockResolvedValue(mockStoreProduct());

      const result = await service.findByQrToken('qr-token-123');

      expect(result.product).toBeDefined();
      expect(result.store).toBeDefined();
    });

    it('should throw NotFoundException for invalid QR token', async () => {
      prisma.productQR.findUnique.mockResolvedValue(null);

      await expect(service.findByQrToken('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByBarcode', () => {
    it('should return product by barcode', async () => {
      const product = mockProduct();
      prisma.product.findFirst.mockResolvedValue(product);

      const result = await service.findByBarcode('8691234567890');

      expect(result).toEqual(product);
    });

    it('should throw NotFoundException for invalid barcode', async () => {
      prisma.product.findFirst.mockResolvedValue(null);

      await expect(service.findByBarcode('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    it('should return search results with pagination', async () => {
      const products = [mockProduct()];
      prisma.product.findMany.mockResolvedValue(products);
      prisma.product.count.mockResolvedValue(1);

      const result = await service.search('test', 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('create', () => {
    it('should create a product', async () => {
      const product = mockProduct();
      prisma.product.findFirst.mockResolvedValue(null);
      prisma.product.create.mockResolvedValue(product);

      const result = await service.create({
        name: 'New Product',
        price: 100,
        categoryId: 'category-123',
      });

      expect(prisma.product.create).toHaveBeenCalled();
      expect(result.name).toBe('Test Product');
    });

    it('should generate SKU if not provided', async () => {
      prisma.product.findFirst.mockResolvedValue(null);
      prisma.product.create.mockResolvedValue(mockProduct());

      await service.create({ name: 'Product', price: 100, categoryId: 'category-123' });

      const createCall = prisma.product.create.mock.calls[0][0];
      expect(createCall.data.sku).toMatch(/^PRD-/);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const product = mockProduct();
      prisma.product.findUnique.mockResolvedValue(product);
      prisma.product.update.mockResolvedValue({ ...product, name: 'Updated' });

      const result = await service.update('product-123', { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException if product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const product = mockProduct();
      prisma.product.findUnique.mockResolvedValue(product);
      prisma.product.delete.mockResolvedValue(product);

      const result = await service.remove('product-123');

      expect(result).toEqual(product);
    });

    it('should throw NotFoundException if product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Brands', () => {
    it('should return all brands', async () => {
      const brands = [mockBrand()];
      prisma.brand.findMany.mockResolvedValue(brands);

      const result = await service.findAllBrands();

      expect(result).toEqual(brands);
    });

    it('should create a brand', async () => {
      const brand = mockBrand();
      prisma.brand.create.mockResolvedValue(brand);

      const result = await service.createBrand({ name: 'New Brand' });

      expect(result).toEqual(brand);
    });
  });

  describe('Suppliers', () => {
    it('should return all suppliers', async () => {
      const suppliers = [mockSupplier()];
      prisma.supplier.findMany.mockResolvedValue(suppliers);

      const result = await service.findAllSuppliers();

      expect(result).toEqual(suppliers);
    });
  });

  describe('Units', () => {
    it('should return all units', async () => {
      const units = [{ id: 'unit-1', name: 'Adet', symbol: 'ad' }];
      prisma.unit.findMany.mockResolvedValue(units);

      const result = await service.findAllUnits();

      expect(result).toEqual(units);
    });
  });

  describe('Tags', () => {
    it('should return all tags', async () => {
      const tags = [{ id: 'tag-1', name: 'Organic', color: '#00ff00' }];
      prisma.tag.findMany.mockResolvedValue(tags);

      const result = await service.findAllTags();

      expect(result).toEqual(tags);
    });

    it('should add tag to product', async () => {
      prisma.productTag.create.mockResolvedValue({ productId: 'product-1', tagId: 'tag-1' });

      const result = await service.addTagToProduct('product-1', 'tag-1');

      expect(result.productId).toBe('product-1');
    });
  });
});
