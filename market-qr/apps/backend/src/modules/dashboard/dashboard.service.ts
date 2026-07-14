import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview(storeId?: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const storeFilter = storeId ? { storeId } : {};

    const [
      totalProducts,
      activeQrCodes,
      todayScans,
      monthScans,
      todayOrders,
      monthOrders,
      totalRevenue,
      lowStockAlerts,
      expiringSoon,
    ] = await Promise.all([
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.productQR.count({ where: { isActive: true } }),
      this.prisma.scanLog.count({ where: { ...storeFilter, scanTime: { gte: startOfDay } } }),
      this.prisma.scanLog.count({ where: { ...storeFilter, scanTime: { gte: startOfMonth } } }),
      this.prisma.order.count({ where: { ...storeFilter, createdAt: { gte: startOfDay }, status: { not: 'CANCELLED' } } }),
      this.prisma.order.count({ where: { ...storeFilter, createdAt: { gte: startOfMonth }, status: { not: 'CANCELLED' } } }),
      this.prisma.order.aggregate({
        where: { ...storeFilter, status: { in: ['PAID', 'COMPLETED'] } },
        _sum: { totalAmount: true },
      }),
      this.prisma.storeProduct.findMany({
        where: storeId ? { storeId, stockQuantity: { lte: 10 } } : {},
        include: { product: true },
        take: 10,
      }),
      this.prisma.batch.findMany({
        where: {
          expiryDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), gte: new Date() },
          status: 'ACTIVE',
          remainingQty: { gt: 0 },
        },
        include: { product: true },
        take: 10,
      }),
    ]);

    return {
      totalProducts,
      activeQrCodes,
      todayScans,
      monthScans,
      todayOrders,
      monthOrders,
      totalRevenue: totalRevenue._sum.totalAmount ?? 0,
      lowStockAlerts,
      expiringSoon,
    };
  }

  async getTopScannedProducts(storeId?: string, limit = 10) {
    const where = storeId ? { storeId } : {};
    return this.prisma.scanLog.groupBy({
      by: ['productId'],
      where,
      _count: true,
      orderBy: { _count: { productId: 'desc' } },
      take: limit,
    });
  }

  async getCampaignConversion(storeId?: string) {
    const where = storeId ? { storeId } : {};
    const [totalScans, totalOrders] = await Promise.all([
      this.prisma.scanLog.count({ where }),
      this.prisma.order.count({ where: { ...where, status: { not: 'CANCELLED' } } }),
    ]);

    return {
      totalScans,
      totalOrders,
      conversionRate: totalScans > 0 ? ((totalOrders / totalScans) * 100).toFixed(2) : '0',
    };
  }

  async getErrorQrReports() {
    return this.prisma.scanLog.findMany({
      where: { qrId: '' },
      orderBy: { scanTime: 'desc' },
      take: 20,
    });
  }
}
