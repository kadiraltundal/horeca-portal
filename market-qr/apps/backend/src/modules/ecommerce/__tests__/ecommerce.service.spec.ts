import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EcommerceService } from '../ecommerce.service';
import { PrismaService } from '../../../config/prisma.service';
import { createPrismaMock } from '../../../test-utils/prisma-mock';
import { PlatformType } from '../dto/create-platform.dto';

describe('EcommerceService', () => {
  let service: EcommerceService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EcommerceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(EcommerceService);
  });

  // ── Platforms ──

  describe('listPlatforms', () => {
    it('should return all platforms with product and order counts', async () => {
      const platforms = [
        {
          id: 'plat-1',
          name: 'Trendyol',
          type: 'TRENDYOL',
          _count: { products: 10, orders: 5 },
          createdAt: new Date(),
        },
      ];
      prisma.ecommercePlatform.findMany.mockResolvedValue(platforms);

      const result = await service.listPlatforms();

      expect(result).toEqual(platforms);
      expect(prisma.ecommercePlatform.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { products: true, orders: true } },
        },
      });
    });

    it('should return empty array when no platforms exist', async () => {
      prisma.ecommercePlatform.findMany.mockResolvedValue([]);

      const result = await service.listPlatforms();

      expect(result).toHaveLength(0);
    });
  });

  describe('createPlatform', () => {
    it('should create a new platform', async () => {
      const dto = {
        name: 'Trendyol',
        type: PlatformType.TRENDYOL,
        apiKey: 'api-key-123',
        apiSecret: 'api-secret-456',
        baseUrl: 'https://api.trendyol.com',
      };
      const created = { id: 'plat-1', ...dto, createdAt: new Date(), updatedAt: new Date() };
      prisma.ecommercePlatform.create.mockResolvedValue(created);

      const result = await service.createPlatform(dto);

      expect(result).toEqual(created);
      expect(prisma.ecommercePlatform.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('updatePlatform', () => {
    it('should update an existing platform', async () => {
      const existing = { id: 'plat-1', name: 'Trendyol', type: 'TRENDYOL' };
      prisma.ecommercePlatform.findUnique.mockResolvedValue(existing);
      prisma.ecommercePlatform.update.mockResolvedValue({ ...existing, name: 'Updated Trendyol' });

      const result = await service.updatePlatform('plat-1', { name: 'Updated Trendyol' });

      expect(result.name).toBe('Updated Trendyol');
    });

    it('should throw NotFoundException if platform not found', async () => {
      prisma.ecommercePlatform.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePlatform('nonexistent', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('connectPlatform', () => {
    it('should connect to a Trendyol platform', async () => {
      const platform = {
        id: 'plat-1',
        type: 'TRENDYOL',
        apiKey: 'api-key',
        apiSecret: 'api-secret',
        baseUrl: 'https://api.trendyol.com',
      };
      prisma.ecommercePlatform.findUnique.mockResolvedValue(platform);

      const result = await service.connectPlatform('plat-1');

      expect(result.connected).toBeDefined();
      expect(result.platformType).toBe('TRENDYOL');
    });

    it('should throw NotFoundException if platform not found', async () => {
      prisma.ecommercePlatform.findUnique.mockResolvedValue(null);

      await expect(service.connectPlatform('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if strategy not registered', async () => {
      const platform = { id: 'plat-1', type: 'UNKNOWN_TYPE', apiKey: 'k', apiSecret: 's', baseUrl: 'http://x' };
      prisma.ecommercePlatform.findUnique.mockResolvedValue(platform);

      await expect(service.connectPlatform('plat-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if platform missing credentials', async () => {
      const platform = { id: 'plat-1', type: 'TRENDYOL', apiKey: null, apiSecret: null, baseUrl: null };
      prisma.ecommercePlatform.findUnique.mockResolvedValue(platform);

      await expect(service.connectPlatform('plat-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ── Products ──

  describe('listProducts', () => {
    it('should return paginated ecommerce products', async () => {
      const products = [
        {
          id: 'ep-1',
          productId: 'product-123',
          syncStatus: 'SYNCED',
          product: { id: 'product-123', name: 'Test Product', sku: 'PRD-001', price: 100 },
          platform: { id: 'plat-1', name: 'Trendyol', type: 'TRENDYOL' },
        },
      ];
      prisma.ecommerceProduct.findMany.mockResolvedValue(products);
      prisma.ecommerceProduct.count.mockResolvedValue(1);

      const result = await service.listProducts(1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should apply search filter', async () => {
      prisma.ecommerceProduct.findMany.mockResolvedValue([]);
      prisma.ecommerceProduct.count.mockResolvedValue(0);

      await service.listProducts(1, 20, 'test');

      const findManyCall = prisma.ecommerceProduct.findMany.mock.calls[0][0];
      expect(findManyCall.where.product).toBeDefined();
      expect(findManyCall.where.product.name.mode).toBe('insensitive');
    });

    it('should return empty results without search', async () => {
      prisma.ecommerceProduct.findMany.mockResolvedValue([]);
      prisma.ecommerceProduct.count.mockResolvedValue(0);

      const result = await service.listProducts(1, 20);

      expect(result.data).toHaveLength(0);
    });
  });

  // ── Orders ──

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const order = {
        id: 'order-1',
        platformId: 'plat-1',
        platformOrderId: 'ext-order-1',
        status: 'PENDING',
      };
      const platform = { id: 'plat-1', type: 'TRENDYOL' };
      prisma.ecommerceOrder.findUnique.mockResolvedValue(order);
      prisma.ecommercePlatform.findUnique.mockResolvedValue(platform);
      prisma.ecommerceOrder.update.mockResolvedValue({ ...order, status: 'SHIPPED' });

      const result = await service.updateOrderStatus('order-1', 'SHIPPED');

      expect(result.status).toBe('SHIPPED');
    });

    it('should throw NotFoundException if order not found', async () => {
      prisma.ecommerceOrder.findUnique.mockResolvedValue(null);

      await expect(service.updateOrderStatus('nonexistent', 'SHIPPED')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if platform not found', async () => {
      const order = { id: 'order-1', platformId: 'plat-missing', status: 'PENDING' };
      prisma.ecommerceOrder.findUnique.mockResolvedValue(order);
      prisma.ecommercePlatform.findUnique.mockResolvedValue(null);

      await expect(service.updateOrderStatus('order-1', 'SHIPPED')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('listOrders', () => {
    it('should return paginated orders', async () => {
      const orders = [
        {
          id: 'order-1',
          status: 'PENDING',
          platform: { id: 'plat-1', name: 'Trendyol', type: 'TRENDYOL' },
        },
      ];
      prisma.ecommerceOrder.findMany.mockResolvedValue(orders);
      prisma.ecommerceOrder.count.mockResolvedValue(1);

      const result = await service.listOrders(1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by platformId', async () => {
      prisma.ecommerceOrder.findMany.mockResolvedValue([]);
      prisma.ecommerceOrder.count.mockResolvedValue(0);

      await service.listOrders(1, 20, 'plat-1');

      const findManyCall = prisma.ecommerceOrder.findMany.mock.calls[0][0];
      expect(findManyCall.where.platformId).toBe('plat-1');
    });

    it('should filter by status', async () => {
      prisma.ecommerceOrder.findMany.mockResolvedValue([]);
      prisma.ecommerceOrder.count.mockResolvedValue(0);

      await service.listOrders(1, 20, undefined, 'SHIPPED');

      const findManyCall = prisma.ecommerceOrder.findMany.mock.calls[0][0];
      expect(findManyCall.where.status).toBe('SHIPPED');
    });
  });

  // ── Sync Logs ──

  describe('listSyncLogs', () => {
    it('should return paginated sync logs', async () => {
      const logs = [
        {
          id: 'log-1',
          type: 'PRODUCT',
          action: 'PUSH',
          status: 'SUCCESS',
          platform: { id: 'plat-1', name: 'Trendyol', type: 'TRENDYOL' },
        },
      ];
      prisma.ecommerceSyncLog.findMany.mockResolvedValue(logs);
      prisma.ecommerceSyncLog.count.mockResolvedValue(1);

      const result = await service.listSyncLogs(1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by platformId', async () => {
      prisma.ecommerceSyncLog.findMany.mockResolvedValue([]);
      prisma.ecommerceSyncLog.count.mockResolvedValue(0);

      await service.listSyncLogs(1, 20, 'plat-1');

      const findManyCall = prisma.ecommerceSyncLog.findMany.mock.calls[0][0];
      expect(findManyCall.where.platformId).toBe('plat-1');
    });
  });

  // ── Webhook ──

  describe('handleWebhook', () => {
    it('should process webhook and log it', async () => {
      prisma.ecommerceSyncLog.create.mockResolvedValue({});

      const payload = {
        platformType: 'TRENDYOL',
        event: 'order.created',
        platformId: 'plat-1',
        orderId: 'ext-order-1',
      };

      const result = await service.handleWebhook(payload);

      expect(result.received).toBe(true);
      expect(prisma.ecommerceSyncLog.create).toHaveBeenCalledWith({
        data: {
          platformId: 'plat-1',
          type: 'ORDER',
          action: 'PULL',
          status: 'SUCCESS',
          message: 'Webhook: order.created',
          details: payload,
        },
      });
    });

    it('should handle webhook with missing platformId', async () => {
      prisma.ecommerceSyncLog.create.mockResolvedValue({});

      const payload = {
        platformType: 'HEPSIBURADA',
        event: 'order.updated',
      };

      const result = await service.handleWebhook(payload);

      expect(result.received).toBe(true);
      expect(prisma.ecommerceSyncLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ platformId: '' }),
        }),
      );
    });
  });
});
