import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { SalesReportQueryDto } from './dto/sales-report-query.dto';
import { GenerateReportDto, ScheduleReportDto } from './dto/generate-report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSalesReport(query: SalesReportQueryDto) {
    const where: any = { status: { not: 'CANCELLED' } };

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }
    if (query.storeId) where.storeId = query.storeId;
    if (query.categoryId) {
      where.orderItems = { some: { product: { categoryId: query.categoryId } } };
    }

    const [summary, byStore, byCategory, dailyTrend] = await Promise.all([
      this.prisma.order.aggregate({
        where,
        _sum: { totalAmount: true, discountAmount: true },
        _count: true,
        _avg: { totalAmount: true },
      }),
      this.prisma.order.groupBy({
        by: ['storeId'],
        where,
        _sum: { totalAmount: true },
        _count: true,
        orderBy: { _sum: { totalAmount: 'desc' } },
      }),
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        where: { order: where },
        _sum: { subtotal: true },
        _count: true,
        orderBy: { _sum: { subtotal: 'desc' } },
        take: 20,
      }),
      this.getDailyTrend(where),
    ]);

    return {
      summary: {
        totalRevenue: summary._sum.totalAmount ?? 0,
        totalDiscount: summary._sum.discountAmount ?? 0,
        totalOrders: summary._count,
        averageOrderValue: summary._avg.totalAmount ?? 0,
      },
      byStore,
      topProducts: byCategory,
      dailyTrend,
    };
  }

  private async getDailyTrend(where: any) {
    const orders = await this.prisma.order.findMany({
      where,
      select: { createdAt: true, totalAmount: true },
      orderBy: { createdAt: 'asc' },
    });

    const trendMap = new Map<string, { revenue: number; count: number }>();
    for (const order of orders) {
      const date = order.createdAt.toISOString().split('T')[0];
      const existing = trendMap.get(date) ?? { revenue: 0, count: 0 };
      existing.revenue += order.totalAmount;
      existing.count += 1;
      trendMap.set(date, existing);
    }

    return Array.from(trendMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  }

  async getInventoryReport(storeId?: string) {
    const where = storeId ? { storeId } : {};

    const [storeProducts, lowStock, categoryStock] = await Promise.all([
      this.prisma.storeProduct.findMany({
        where,
        include: { product: { include: { category: true, supplier: true } }, store: true },
        orderBy: { stockQuantity: 'asc' },
      }),
      this.prisma.storeProduct.findMany({
        where: { ...where, stockQuantity: { lte: 10 } },
        include: { product: true, store: true },
        orderBy: { stockQuantity: 'asc' },
      }),
      this.prisma.storeProduct.groupBy({
        by: ['storeId'],
        where,
        _sum: { stockQuantity: true },
        _count: true,
      }),
    ]);

    const totalStockValue = storeProducts.reduce(
      (sum, sp) => sum + sp.stockQuantity * sp.product.price,
      0,
    );

    return {
      summary: {
        totalProducts: storeProducts.length,
        totalStockQuantity: storeProducts.reduce((sum, sp) => sum + sp.stockQuantity, 0),
        totalStockValue,
        lowStockCount: lowStock.length,
      },
      lowStockAlerts: lowStock,
      byStore: categoryStock,
    };
  }

  async getFinancialReport(storeId?: string, startDate?: string, endDate?: string) {
    const orderWhere: any = { status: { in: ['PAID', 'COMPLETED'] } };
    if (storeId) orderWhere.storeId = storeId;
    if (startDate || endDate) {
      orderWhere.createdAt = {};
      if (startDate) orderWhere.createdAt.gte = new Date(startDate);
      if (endDate) orderWhere.createdAt.lte = new Date(endDate);
    }

    const [revenue, paymentMethods, refunds] = await Promise.all([
      this.prisma.order.aggregate({
        where: orderWhere,
        _sum: { totalAmount: true, discountAmount: true },
        _count: true,
      }),
      this.prisma.order.groupBy({
        by: ['paymentMethod'],
        where: orderWhere,
        _sum: { totalAmount: true },
        _count: true,
      }),
      this.prisma.refund.aggregate({
        where: {
          ...(storeId ? { order: { storeId } } : {}),
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const vatData = await this.prisma.orderItem.findMany({
      where: { order: orderWhere },
      include: { product: { select: { vatRate: true } } },
    });

    const vatByRate = new Map<number, number>();
    for (const item of vatData) {
      const vatRate = item.product.vatRate;
      const current = vatByRate.get(vatRate) ?? 0;
      vatByRate.set(vatRate, current + item.subtotal * (vatRate / 100));
    }

    return {
      summary: {
        totalRevenue: revenue._sum.totalAmount ?? 0,
        totalDiscount: revenue._sum.discountAmount ?? 0,
        totalRefunds: refunds._sum.amount ?? 0,
        netRevenue: (revenue._sum.totalAmount ?? 0) - (refunds._sum.amount ?? 0),
        totalOrders: revenue._count,
      },
      paymentMethods,
      vatBreakdown: Array.from(vatByRate.entries()).map(([rate, amount]) => ({
        vatRate: rate,
        vatAmount: amount,
      })),
    };
  }

  async getCustomerAnalytics(storeId?: string) {
    const where = storeId ? { storeId } : {};

    const [totalCustomers, newThisMonth, topSpenders, repeatCustomers] = await Promise.all([
      this.prisma.user.count({ where: { orders: { some: where } } }),
      this.prisma.user.count({
        where: {
          orders: { some: where },
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      this.prisma.user.findMany({
        where: { orders: { some: where } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          orders: {
            where: { status: { not: 'CANCELLED' } },
            select: { totalAmount: true },
          },
        },
        take: 10,
      }),
      this.prisma.user.findMany({
        where: { orders: { some: where } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          _count: { select: { orders: true } },
        },
        orderBy: { orders: { _count: 'desc' } },
        take: 10,
      }),
    ]);

    const topSpendersWithTotal = topSpenders.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      totalSpent: u.orders.reduce((sum, o) => sum + o.totalAmount, 0),
      orderCount: u.orders.length,
    })).sort((a, b) => b.totalSpent - a.totalSpent);

    return {
      summary: {
        totalCustomers,
        newCustomersThisMonth: newThisMonth,
      },
      topSpenders: topSpendersWithTotal,
      repeatCustomers: repeatCustomers.map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        orderCount: u._count.orders,
      })),
    };
  }

  async getProductPerformance(storeId?: string) {
    const where = storeId ? { storeId } : {};

    const [topSelling, leastSelling, categoryPerformance] = await Promise.all([
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        where: { order: where },
        _sum: { subtotal: true, quantity: true },
        _count: true,
        orderBy: { _sum: { subtotal: 'desc' } },
        take: 20,
      }),
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        where: { order: where },
        _sum: { subtotal: true, quantity: true },
        _count: true,
        orderBy: { _sum: { subtotal: 'asc' } },
        take: 10,
      }),
      this.prisma.product.groupBy({
        by: ['categoryId'],
        _count: true,
      }),
    ]);

    const topIds = topSelling.map((t) => t.productId);
    const leastIds = leastSelling.map((l) => l.productId);
    const allIds = [...new Set([...topIds, ...leastIds])];

    const products = await this.prisma.product.findMany({
      where: { id: { in: allIds } },
      include: { category: { select: { name: true } } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const enrich = (items: any[]) =>
      items.map((item) => ({
        ...item,
        product: productMap.get(item.productId),
      }));

    return {
      topSelling: enrich(topSelling),
      leastSelling: enrich(leastSelling),
      categoryPerformance,
    };
  }

  async getSupplierAnalytics() {
    const suppliers = await this.prisma.supplier.findMany({
      where: { isActive: true },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            orderItems: {
              select: { subtotal: true, quantity: true },
            },
          },
        },
        purchaseOrders: {
          select: { id: true, totalAmount: true, createdAt: true },
        },
      },
    });

    return suppliers.map((supplier) => {
      const totalSales = supplier.products.reduce(
        (sum, p) => sum + p.orderItems.reduce((s, oi) => s + oi.subtotal, 0),
        0,
      );
      const totalOrders = supplier.purchaseOrders.length;
      const totalPurchaseValue = supplier.purchaseOrders.reduce(
        (sum, po) => sum + po.totalAmount,
        0,
      );

      return {
        id: supplier.id,
        name: supplier.name,
        contactName: supplier.contactName,
        rating: supplier.rating,
        productCount: supplier.products.length,
        totalSales,
        totalOrders,
        totalPurchaseValue,
      };
    });
  }

  async generateReport(dto: GenerateReportDto, userId: string) {
    const report = await this.prisma.generatedReport.create({
      data: {
        type: dto.type,
        format: dto.format ?? 'PDF',
        templateId: dto.templateId,
        parameters: dto.parameters ?? {},
        generatedBy: userId,
        status: 'GENERATING',
      },
    });

    try {
      let data: any;
      switch (dto.type) {
        case 'SALES':
          data = await this.getSalesReport(dto.parameters as SalesReportQueryDto);
          break;
        case 'INVENTORY':
          data = await this.getInventoryReport(dto.parameters?.storeId);
          break;
        case 'FINANCIAL':
          data = await this.getFinancialReport(
            dto.parameters?.storeId,
            dto.parameters?.startDate,
            dto.parameters?.endDate,
          );
          break;
        case 'CUSTOMER':
          data = await this.getCustomerAnalytics(dto.parameters?.storeId);
          break;
        case 'PRODUCT':
          data = await this.getProductPerformance(dto.parameters?.storeId);
          break;
        case 'SUPPLIER':
          data = await this.getSupplierAnalytics();
          break;
        default:
          throw new BadRequestException('Invalid report type');
      }

      await this.prisma.generatedReport.update({
        where: { id: report.id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });

      return { ...report, data };
    } catch (error) {
      await this.prisma.generatedReport.update({
        where: { id: report.id },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  }

  async getTemplates() {
    return this.prisma.reportTemplate.findMany({ orderBy: { name: 'asc' } });
  }

  async scheduleReport(dto: ScheduleReportDto, userId: string) {
    return this.prisma.generatedReport.create({
      data: {
        type: dto.type,
        format: dto.format ?? 'PDF',
        templateId: dto.templateId,
        parameters: {
          ...dto.parameters,
          _schedule: dto.schedule,
        },
        generatedBy: userId,
        status: 'PENDING',
      },
    });
  }
}
