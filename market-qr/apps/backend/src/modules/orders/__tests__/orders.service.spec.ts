import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersService } from '../orders.service';
import { PrismaService } from '../../../config/prisma.service';
import { createPrismaMock } from '../../../test-utils/prisma-mock';
import { mockOrder, mockOrderItem, mockStoreProduct, mockProduct } from '../../../test-utils/mock-fixtures';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(OrdersService);
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      const orders = [mockOrder(), mockOrder({ id: 'order-456' })];
      prisma.order.findMany.mockResolvedValue(orders);
      prisma.order.count.mockResolvedValue(2);

      const result = await service.findAll('store-123', 1, 20);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter by status', async () => {
      prisma.order.findMany.mockResolvedValue([]);
      prisma.order.count.mockResolvedValue(0);

      await service.findAll('store-123', 1, 20, 'PAID');

      const findManyCall = prisma.order.findMany.mock.calls[0][0];
      expect(findManyCall.where.status).toBe('PAID');
    });
  });

  describe('findOne', () => {
    it('should return an order', async () => {
      const order = mockOrder();
      prisma.order.findUnique.mockResolvedValue(order);

      const result = await service.findOne('order-123');

      expect(result).toEqual(order);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('calculate', () => {
    it('should calculate order total correctly', async () => {
      const storeProduct = mockStoreProduct({ stockQuantity: 50 });
      prisma.storeProduct.findUnique.mockResolvedValue(storeProduct);

      const result = await service.calculate('store-123', [
        { productId: 'product-123', quantity: 2 },
      ]);

      expect(result.subtotal).toBe(200);
      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].quantity).toBe(2);
      expect(result.lines[0].unitPrice).toBe(100);
    });

    it('should throw BadRequestException if product not found', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(null);

      await expect(
        service.calculate('store-123', [{ productId: 'nonexistent', quantity: 1 }]),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if insufficient stock', async () => {
      const storeProduct = mockStoreProduct({ stockQuantity: 1 });
      prisma.storeProduct.findUnique.mockResolvedValue(storeProduct);

      await expect(
        service.calculate('store-123', [{ productId: 'product-123', quantity: 5 }]),
      ).rejects.toThrow(BadRequestException);
    });

    it('should apply coupon discount (percentage)', async () => {
      const storeProduct = mockStoreProduct();
      prisma.storeProduct.findUnique.mockResolvedValue(storeProduct);
      prisma.coupon.findUnique.mockResolvedValue({
        code: 'SAVE10',
        isActive: true,
        expiresAt: null,
        usageLimit: null,
        usedCount: 0,
        minAmount: null,
        promotion: { discountType: 'PERCENTAGE', discountValue: 10, title: '10% Off' },
      });

      const result = await service.calculate('store-123', [
        { productId: 'product-123', quantity: 1 },
      ], 'SAVE10');

      expect(result.discount).toBe(10);
      expect(result.discountDescription).toBe('10% Off');
    });

    it('should apply coupon discount (fixed amount)', async () => {
      const storeProduct = mockStoreProduct();
      prisma.storeProduct.findUnique.mockResolvedValue(storeProduct);
      prisma.coupon.findUnique.mockResolvedValue({
        code: 'FIXED5',
        isActive: true,
        expiresAt: null,
        usageLimit: null,
        usedCount: 0,
        minAmount: null,
        promotion: { discountType: 'FIXED', discountValue: 5, title: '5 TL Off' },
      });

      const result = await service.calculate('store-123', [
        { productId: 'product-123', quantity: 1 },
      ], 'FIXED5');

      expect(result.discount).toBe(5);
    });
  });

  describe('create', () => {
    it('should create an order with items', async () => {
      const storeProduct = mockStoreProduct();
      const order = mockOrder();
      const orderItem = mockOrderItem();

      prisma.storeProduct.findUnique.mockResolvedValue(storeProduct);
      prisma.$transaction.mockImplementation(async (fn: any) => {
        if (typeof fn === 'function') {
          return fn({
            order: { create: jest.fn().mockResolvedValue({ ...order, orderItems: [orderItem] }) },
            storeProduct: { update: jest.fn() },
            coupon: { updateMany: jest.fn() },
          });
        }
        return fn;
      });

      const result = await service.create({
        userId: 'user-123',
        storeId: 'store-123',
        paymentMethod: 'CASH',
        items: [{ productId: 'product-123', quantity: 2 }],
      });

      expect(result).toHaveProperty('calculation');
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const order = mockOrder();
      prisma.order.findUnique.mockResolvedValue(order);
      prisma.order.update.mockResolvedValue({ ...order, status: 'PAID' });

      const result = await service.updateStatus('order-123', 'PAID');

      expect(result.status).toBe('PAID');
    });

    it('should throw NotFoundException if order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.updateStatus('nonexistent', 'PAID')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for invalid status', async () => {
      const order = mockOrder();
      prisma.order.findUnique.mockResolvedValue(order);

      await expect(service.updateStatus('order-123', 'INVALID')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should restore stock when cancelling order', async () => {
      const order = mockOrder({ status: 'PENDING' });
      const cancelledOrder = { ...order, status: 'CANCELLED' };
      const orderItems = [mockOrderItem()];

      prisma.order.findUnique
        .mockResolvedValueOnce(order)
        .mockResolvedValueOnce(cancelledOrder);
      prisma.orderItem.findMany.mockResolvedValue(orderItems);
      prisma.$transaction.mockImplementation(async (fn: any) => {
        if (typeof fn === 'function') {
          return fn({
            storeProduct: { update: jest.fn() },
            order: { update: jest.fn().mockResolvedValue(cancelledOrder) },
          });
        }
        return fn;
      });

      const result = await service.updateStatus('order-123', 'CANCELLED');

      expect(result.status).toBe('CANCELLED');
    });
  });

  describe('getStats', () => {
    it('should return order statistics', async () => {
      prisma.order.count.mockResolvedValue(5);
      prisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 1000 } });

      const result = await service.getStats('store-123');

      expect(result.todayOrders).toBe(5);
      expect(result.monthOrders).toBe(5);
      expect(result.totalRevenue).toBe(1000);
    });
  });
});
