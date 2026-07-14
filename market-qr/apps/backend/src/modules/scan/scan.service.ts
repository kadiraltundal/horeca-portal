import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class ScanService {
  constructor(private prisma: PrismaService) {}

  async logScan(data: {
    qrId: string;
    productId: string;
    storeId?: string;
    userId?: string;
    deviceType?: string;
    os?: string;
    browser?: string;
    ipAddress?: string;
    country?: string;
    city?: string;
    language?: string;
    referrer?: string;
  }) {
    return this.prisma.scanLog.create({ data });
  }

  async getScanStats(storeId?: string, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: any = { scanTime: { gte: startDate } };
    if (storeId) where.storeId = storeId;

    const [totalScans, uniqueProducts, scansByDay, topProducts, scansByCity] = await Promise.all([
      this.prisma.scanLog.count({ where }),
      this.prisma.scanLog.groupBy({ by: ['productId'], where, _count: true }),
      this.prisma.scanLog.groupBy({
        by: ['scanTime'],
        where,
        _count: true,
        orderBy: { scanTime: 'asc' },
      }),
      this.prisma.scanLog.groupBy({
        by: ['productId'],
        where,
        _count: true,
        orderBy: { _count: { productId: 'desc' } },
        take: 10,
      }),
      this.prisma.scanLog.groupBy({
        by: ['city'],
        where,
        _count: true,
        orderBy: { _count: { city: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalScans,
      uniqueProducts: uniqueProducts.length,
      scansByDay,
      topProducts,
      scansByCity: scansByCity.filter(s => s.city),
    };
  }

  async getHourlyStats(storeId?: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const where: any = { scanTime: { gte: startOfDay, lt: endOfDay } };
    if (storeId) where.storeId = storeId;

    const scans = await this.prisma.scanLog.findMany({ where, select: { scanTime: true } });

    const hourlyCounts = Array(24).fill(0);
    scans.forEach(scan => {
      const hour = scan.scanTime.getHours();
      hourlyCounts[hour]++;
    });

    return hourlyCounts.map((count, hour) => ({ hour, count }));
  }

  async getDeviceStats(storeId?: string) {
    const where: any = {};
    if (storeId) where.storeId = storeId;

    const [byDevice, byOs, byBrowser] = await Promise.all([
      this.prisma.scanLog.groupBy({ by: ['deviceType'], where, _count: true }),
      this.prisma.scanLog.groupBy({ by: ['os'], where, _count: true }),
      this.prisma.scanLog.groupBy({ by: ['browser'], where, _count: true }),
    ]);

    return { byDevice, byOs: byOs.filter(s => s.os), byBrowser: byBrowser.filter(s => s.browser) };
  }

  async getRecentScans(limit = 20) {
    return this.prisma.scanLog.findMany({
      include: { product: true, store: true },
      orderBy: { scanTime: 'desc' },
      take: limit,
    });
  }
}
