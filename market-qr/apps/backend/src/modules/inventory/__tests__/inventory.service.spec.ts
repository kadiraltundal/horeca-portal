import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { InventoryService } from '../inventory.service';
import { PrismaService } from '../../../config/prisma.service';
import { createPrismaMock } from '../../../test-utils/prisma-mock';
import { mockStoreProduct } from '../../../test-utils/mock-fixtures';

describe('InventoryService', () => {
  let service: InventoryService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(InventoryService);
  });

  describe('findAll', () => {
    it('should return paginated inventory items', async () => {
      const items = [mockStoreProduct(), mockStoreProduct({ productId: 'product-456' })];
      prisma.storeProduct.findMany.mockResolvedValue(items);
      prisma.storeProduct.count.mockResolvedValue(2);

      const result = await service.findAll('store-123', 1, 20);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should handle empty inventory', async () => {
      prisma.storeProduct.findMany.mockResolvedValue([]);
      prisma.storeProduct.count.mockResolvedValue(0);

      const result = await service.findAll('store-123', 1, 20);

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getAlerts', () => {
    it('should return low stock items', async () => {
      const items = [
        mockStoreProduct({ stockQuantity: 5, minStockThreshold: 10 }),
        mockStoreProduct({ productId: 'product-456', stockQuantity: 50, minStockThreshold: 10 }),
        mockStoreProduct({ productId: 'product-789', stockQuantity: 2, minStockThreshold: 10 }),
      ];
      prisma.storeProduct.findMany.mockResolvedValue(items);

      const result = await service.getAlerts('store-123');

      expect(result).toHaveLength(2);
      expect(result.every((item) => item.stockQuantity <= item.minStockThreshold)).toBe(true);
    });

    it('should return empty array if no low stock items', async () => {
      const items = [
        mockStoreProduct({ stockQuantity: 50, minStockThreshold: 10 }),
      ];
      prisma.storeProduct.findMany.mockResolvedValue(items);

      const result = await service.getAlerts('store-123');

      expect(result).toHaveLength(0);
    });
  });

  describe('updateStock', () => {
    it('should update stock quantity', async () => {
      const storeProduct = mockStoreProduct({ stockQuantity: 50 });
      prisma.storeProduct.findUnique.mockResolvedValue(storeProduct);
      prisma.storeProduct.update.mockResolvedValue({ ...storeProduct, stockQuantity: 75 });

      const result = await service.updateStock('store-123', 'product-123', {
        stockQuantity: 75,
      });

      expect(result.stockQuantity).toBe(75);
    });

    it('should update shelf number', async () => {
      const storeProduct = mockStoreProduct({ shelfNumber: 'A1' });
      prisma.storeProduct.findUnique.mockResolvedValue(storeProduct);
      prisma.storeProduct.update.mockResolvedValue({ ...storeProduct, shelfNumber: 'B2' });

      const result = await service.updateStock('store-123', 'product-123', {
        shelfNumber: 'B2',
      });

      expect(result.shelfNumber).toBe('B2');
    });

    it('should throw NotFoundException if store product not found', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStock('store-123', 'nonexistent', { stockQuantity: 50 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkUpdate', () => {
    it('should bulk update products', async () => {
      const items = [
        { productId: 'product-1', stockQuantity: 100 },
        { productId: 'product-2', stockQuantity: 200 },
      ];

      prisma.storeProduct.upsert
        .mockResolvedValueOnce(mockStoreProduct({ productId: 'product-1', stockQuantity: 100 }))
        .mockResolvedValueOnce(mockStoreProduct({ productId: 'product-2', stockQuantity: 200 }));

      const result = await service.bulkUpdate('store-123', items);

      expect(result.updated).toBe(2);
      expect(result.items).toHaveLength(2);
    });

    it('should create new store product if not exists', async () => {
      const items = [{ productId: 'new-product', stockQuantity: 50 }];
      prisma.storeProduct.upsert.mockResolvedValue(
        mockStoreProduct({ productId: 'new-product', stockQuantity: 50 }),
      );

      const result = await service.bulkUpdate('store-123', items);

      expect(result.updated).toBe(1);
      const upsertCall = prisma.storeProduct.upsert.mock.calls[0][0];
      expect(upsertCall.where.storeId_productId.productId).toBe('new-product');
    });
  });
});
