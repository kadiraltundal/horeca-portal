import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class ZReportService {
  constructor(private prisma: PrismaService) {}

  async generate(storeId: string, userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all orders for today
    const orders = await this.prisma.order.findMany({
      where: {
        storeId,
        status: { in: ['PAID', 'COMPLETED'] },
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Get refunds for today
    const refunds = await this.prisma.refund.findMany({
      where: {
        order: { storeId },
        status: 'COMPLETED',
        processedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalRefunds = refunds.reduce((sum, r) => sum + r.amount, 0);
    const cashSales = orders
      .filter((o) => o.paymentMethod === 'CASH')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const cardSales = orders
      .filter((o) => o.paymentMethod === 'CARD')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const otherSales = totalSales - cashSales - cardSales;

    const report = await this.prisma.zReport.create({
      data: {
        storeId,
        userId,
        reportDate: today,
        totalSales,
        totalRefunds,
        cashSales,
        cardSales,
        otherSales,
        transactionCount: orders.length,
      },
    });

    return {
      report,
      summary: {
        date: today,
        totalSales,
        totalRefunds,
        netSales: totalSales - totalRefunds,
        cashSales,
        cardSales,
        otherSales,
        transactionCount: orders.length,
        averageTransaction: orders.length > 0 ? totalSales / orders.length : 0,
      },
    };
  }

  async findAll(storeId: string, page: number = 1, limit: number = 20) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;

    const [items, total] = await Promise.all([
      this.prisma.zReport.findMany({
        where: { storeId },
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
        skip,
        take: l,
        orderBy: { reportDate: 'desc' },
      }),
      this.prisma.zReport.count({ where: { storeId } }),
    ]);

    return {
      data: items,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }

  async findOne(id: string) {
    const report = await this.prisma.zReport.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        store: true,
      },
    });

    if (!report) {
      throw new NotFoundException('Z Report not found');
    }

    return report;
  }

  async getDailySummary(storeId: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const [orders, refunds] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          storeId,
          status: { in: ['PAID', 'COMPLETED'] },
          createdAt: { gte: targetDate, lt: nextDay },
        },
        include: { orderItems: { include: { product: true } } },
      }),
      this.prisma.refund.findMany({
        where: {
          order: { storeId },
          status: 'COMPLETED',
          processedAt: { gte: targetDate, lt: nextDay },
        },
      }),
    ]);

    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalRefunds = refunds.reduce((sum, r) => sum + r.amount, 0);

    // Top products
    const productSales: Record<string, { name: string; quantity: number; total: number }> = {};
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.product.name,
            quantity: 0,
            total: 0,
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].total += item.subtotal;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return {
      date: targetDate,
      totalSales,
      totalRefunds,
      netSales: totalSales - totalRefunds,
      transactionCount: orders.length,
      topProducts,
    };
  }
}
