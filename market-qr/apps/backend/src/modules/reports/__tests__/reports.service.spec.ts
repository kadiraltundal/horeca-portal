import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ReportsService } from '../reports.service';
import { PrismaService } from '../../../config/prisma.service';
import { createPrismaMock } from '../../../test-utils/prisma-mock';
import { ReportType, ReportFormat } from '../dto/generate-report.dto';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ReportsService);
  });

  describe('getSalesReport', () => {
    it('should return sales report with summary, byStore, topProducts, and dailyTrend', async () => {
      prisma.order.aggregate.mockResolvedValue({
        _sum: { totalAmount: 10000, discountAmount: 500 },
        _count: 50,
        _avg: { totalAmount: 200 },
      });
      prisma.order.groupBy.mockResolvedValue([
        { storeId: 'store-1', _sum: { totalAmount: 6000 }, _count: 30 },
      ]);
      prisma.orderItem.groupBy.mockResolvedValue([
        { productId: 'prod-1', _sum: { subtotal: 3000 }, _count: 15 },
      ]);
      prisma.order.findMany.mockResolvedValue([
        { createdAt: new Date('2026-07-09T10:00:00.000Z'), totalAmount: 200 },
        { createdAt: new Date('2026-07-09T14:00:00.000Z'), totalAmount: 300 },
        { createdAt: new Date('2026-07-10T09:00:00.000Z'), totalAmount: 150 },
      ]);

      const result = await service.getSalesReport({});

      expect(result.summary.totalRevenue).toBe(10000);
      expect(result.summary.totalOrders).toBe(50);
      expect(result.byStore).toHaveLength(1);
      expect(result.topProducts).toHaveLength(1);
      expect(result.dailyTrend).toHaveLength(2);
      expect(result.dailyTrend[0].date).toBe('2026-07-09');
      expect(result.dailyTrend[0].count).toBe(2);
      expect(result.dailyTrend[0].revenue).toBe(500);
    });

    it('should filter by storeId', async () => {
      prisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 0 }, _count: 0, _avg: { totalAmount: 0 } });
      prisma.order.groupBy.mockResolvedValue([]);
      prisma.orderItem.groupBy.mockResolvedValue([]);
      prisma.order.findMany.mockResolvedValue([]);

      await service.getSalesReport({ storeId: 'store-123' });

      const aggregateCall = prisma.order.aggregate.mock.calls[0][0];
      expect(aggregateCall.where.storeId).toBe('store-123');
    });

    it('should filter by date range', async () => {
      prisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 0 }, _count: 0, _avg: { totalAmount: 0 } });
      prisma.order.groupBy.mockResolvedValue([]);
      prisma.orderItem.groupBy.mockResolvedValue([]);
      prisma.order.findMany.mockResolvedValue([]);

      await service.getSalesReport({
        startDate: '2026-07-01',
        endDate: '2026-07-31',
      });

      const aggregateCall = prisma.order.aggregate.mock.calls[0][0];
      expect(aggregateCall.where.createdAt).toEqual({
        gte: expect.any(Date),
        lte: expect.any(Date),
      });
    });

    it('should filter by categoryId', async () => {
      prisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 0 }, _count: 0, _avg: { totalAmount: 0 } });
      prisma.order.groupBy.mockResolvedValue([]);
      prisma.orderItem.groupBy.mockResolvedValue([]);
      prisma.order.findMany.mockResolvedValue([]);

      await service.getSalesReport({ categoryId: 'cat-123' });

      const aggregateCall = prisma.order.aggregate.mock.calls[0][0];
      expect(aggregateCall.where.orderItems).toEqual({
        some: { product: { categoryId: 'cat-123' } },
      });
    });
  });

  describe('getInventoryReport', () => {
    it('should return inventory report with summary and alerts', async () => {
      prisma.storeProduct.findMany
        .mockResolvedValueOnce([
          { storeId: 's1', productId: 'p1', stockQuantity: 50, product: { price: 100, name: 'A' } },
          { storeId: 's1', productId: 'p2', stockQuantity: 5, product: { price: 50, name: 'B' } },
        ])
        .mockResolvedValueOnce([
          { storeId: 's1', productId: 'p2', stockQuantity: 5, product: { price: 50 } },
        ]);
      prisma.storeProduct.groupBy.mockResolvedValue([
        { storeId: 's1', _sum: { stockQuantity: 55 }, _count: 2 },
      ]);

      const result = await service.getInventoryReport('store-1');

      expect(result.summary.totalProducts).toBe(2);
      expect(result.summary.totalStockQuantity).toBe(55);
      expect(result.summary.totalStockValue).toBe(5250);
      expect(result.summary.lowStockCount).toBe(1);
      expect(result.lowStockAlerts).toHaveLength(1);
      expect(result.byStore).toHaveLength(1);
    });

    it('should pass storeId filter when provided', async () => {
      prisma.storeProduct.findMany.mockResolvedValue([]);
      prisma.storeProduct.findMany.mockResolvedValue([]);
      prisma.storeProduct.groupBy.mockResolvedValue([]);

      await service.getInventoryReport('store-123');

      const findManyCalls = prisma.storeProduct.findMany.mock.calls;
      expect(findManyCalls[0][0].where.storeId).toBe('store-123');
    });

    it('should work without storeId filter', async () => {
      prisma.storeProduct.findMany.mockResolvedValue([]);
      prisma.storeProduct.groupBy.mockResolvedValue([]);

      await service.getInventoryReport();

      const findManyCalls = prisma.storeProduct.findMany.mock.calls;
      expect(findManyCalls[0][0].where).toEqual({});
    });
  });

  describe('getFinancialReport', () => {
    it('should return financial report with revenue, payment methods, refunds, and VAT', async () => {
      prisma.order.aggregate.mockResolvedValue({
        _sum: { totalAmount: 50000, discountAmount: 2000 },
        _count: 100,
      });
      prisma.order.groupBy.mockResolvedValue([
        { paymentMethod: 'CASH', _sum: { totalAmount: 30000 }, _count: 60 },
        { paymentMethod: 'CARD', _sum: { totalAmount: 20000 }, _count: 40 },
      ]);
      prisma.refund.aggregate.mockResolvedValue({
        _sum: { amount: 1500 },
        _count: 5,
      });
      prisma.orderItem.findMany.mockResolvedValue([
        { subtotal: 100, product: { vatRate: 20 } },
        { subtotal: 50, product: { vatRate: 10 } },
      ]);

      const result = await service.getFinancialReport('store-123');

      expect(result.summary.totalRevenue).toBe(50000);
      expect(result.summary.totalDiscount).toBe(2000);
      expect(result.summary.totalRefunds).toBe(1500);
      expect(result.summary.netRevenue).toBe(48500);
      expect(result.summary.totalOrders).toBe(100);
      expect(result.paymentMethods).toHaveLength(2);
      expect(result.vatBreakdown).toHaveLength(2);
      expect(result.vatBreakdown).toEqual(
        expect.arrayContaining([
          { vatRate: 20, vatAmount: 20 },
          { vatRate: 10, vatAmount: 5 },
        ]),
      );
    });

    it('should work without filters', async () => {
      prisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 0 }, _count: 0 });
      prisma.order.groupBy.mockResolvedValue([]);
      prisma.refund.aggregate.mockResolvedValue({ _sum: { amount: 0 }, _count: 0 });
      prisma.orderItem.findMany.mockResolvedValue([]);

      const result = await service.getFinancialReport();

      expect(result.summary).toBeDefined();
      expect(result.paymentMethods).toEqual([]);
    });

    it('should filter by date range', async () => {
      prisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 0 }, _count: 0 });
      prisma.order.groupBy.mockResolvedValue([]);
      prisma.refund.aggregate.mockResolvedValue({ _sum: { amount: 0 }, _count: 0 });
      prisma.orderItem.findMany.mockResolvedValue([]);

      await service.getFinancialReport(undefined, '2026-01-01', '2026-12-31');

      const aggregateCall = prisma.order.aggregate.mock.calls[0][0];
      expect(aggregateCall.where.createdAt).toEqual({
        gte: expect.any(Date),
        lte: expect.any(Date),
      });
    });
  });

  describe('getTemplates', () => {
    it('should return all templates ordered by name', async () => {
      const templates = [
        { id: 't1', name: 'Monthly Sales' },
        { id: 't2', name: 'Daily Inventory' },
      ];
      prisma.reportTemplate.findMany.mockResolvedValue(templates);

      const result = await service.getTemplates();

      expect(result).toEqual(templates);
      expect(prisma.reportTemplate.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });

    it('should return empty array when no templates exist', async () => {
      prisma.reportTemplate.findMany.mockResolvedValue([]);

      const result = await service.getTemplates();

      expect(result).toEqual([]);
    });
  });

  describe('scheduleReport', () => {
    it('should create a scheduled report with PENDING status', async () => {
      const dto = {
        type: ReportType.SALES,
        format: ReportFormat.PDF,
        schedule: '0 9 * * 1',
        parameters: { storeId: 'store-123' },
      };
      const created = {
        id: 'report-1',
        type: ReportType.SALES,
        format: ReportFormat.PDF,
        parameters: { storeId: 'store-123', _schedule: '0 9 * * 1' },
        generatedBy: 'user-123',
        status: 'PENDING',
        templateId: null,
        completedAt: null,
        createdAt: new Date(),
      };
      prisma.generatedReport.create.mockResolvedValue(created);

      const result = await service.scheduleReport(dto as any, 'user-123');

      expect(result.status).toBe('PENDING');
      expect(result.parameters).toBeDefined();
      expect(prisma.generatedReport.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: ReportType.SALES,
            status: 'PENDING',
            generatedBy: 'user-123',
          }),
        }),
      );
    });

    it('should default format to PDF when not specified', async () => {
      const dto = {
        type: ReportType.INVENTORY,
        schedule: '0 8 * * *',
      };
      prisma.generatedReport.create.mockResolvedValue({
        id: 'report-2',
        format: 'PDF',
        status: 'PENDING',
        parameters: null,
        completedAt: null,
        createdAt: new Date(),
      });

      await service.scheduleReport(dto as any, 'user-456');

      const createCall = prisma.generatedReport.create.mock.calls[0][0];
      expect(createCall.data.format).toBe('PDF');
    });
  });
});
