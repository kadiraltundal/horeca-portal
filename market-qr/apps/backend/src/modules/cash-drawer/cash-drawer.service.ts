import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { OpenCashDrawerDto } from './dto/open-cash-drawer.dto';
import { CloseCashDrawerDto } from './dto/close-cash-drawer.dto';

@Injectable()
export class CashDrawerService {
  constructor(private prisma: PrismaService) {}

  async getOpenDrawer(storeId: string, userId: string) {
    const drawer = await this.prisma.cashDrawer.findFirst({
      where: {
        storeId,
        userId,
        status: 'OPEN',
      },
    });

    if (!drawer) {
      return null;
    }

    // Get today's sales for this drawer
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [cashSales, cardSales] = await Promise.all([
      this.prisma.order.aggregate({
        where: {
          storeId,
          paymentMethod: 'CASH',
          status: { in: ['PAID', 'COMPLETED'] },
          createdAt: { gte: drawer.openedAt },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),
      this.prisma.order.aggregate({
        where: {
          storeId,
          paymentMethod: 'CARD',
          status: { in: ['PAID', 'COMPLETED'] },
          createdAt: { gte: drawer.openedAt },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),
    ]);

    return {
      ...drawer,
      sales: {
        cash: {
          total: cashSales._sum.totalAmount || 0,
          count: cashSales._count,
        },
        card: {
          total: cardSales._sum.totalAmount || 0,
          count: cardSales._count,
        },
      },
    };
  }

  async open(data: OpenCashDrawerDto, userId: string) {
    const existingDrawer = await this.prisma.cashDrawer.findFirst({
      where: {
        storeId: data.storeId,
        userId,
        status: 'OPEN',
      },
    });

    if (existingDrawer) {
      throw new BadRequestException('You already have an open cash drawer');
    }

    return this.prisma.cashDrawer.create({
      data: {
        storeId: data.storeId,
        userId,
        openingBalance: data.openingBalance,
        notes: data.notes,
      },
    });
  }

  async close(data: CloseCashDrawerDto) {
    const drawer = await this.prisma.cashDrawer.findFirst({
      where: {
        storeId: data.storeId,
        userId: data.userId,
        status: 'OPEN',
      },
    });

    if (!drawer) {
      throw new NotFoundException('No open cash drawer found');
    }

    // Get total cash sales since drawer opened
    const cashSales = await this.prisma.order.aggregate({
      where: {
        storeId: data.storeId,
        paymentMethod: 'CASH',
        status: { in: ['PAID', 'COMPLETED'] },
        createdAt: { gte: drawer.openedAt },
      },
      _sum: { totalAmount: true },
    });

    const expectedBalance = drawer.openingBalance + (cashSales._sum.totalAmount || 0);

    return this.prisma.cashDrawer.update({
      where: { id: drawer.id },
      data: {
        closingBalance: data.closingBalance,
        status: 'CLOSED',
        closedAt: new Date(),
        notes: `${drawer.notes || ''} | Expected: ${expectedBalance}, Actual: ${data.closingBalance}, Diff: ${data.closingBalance - expectedBalance}`,
      },
    });
  }

  async getDrawerHistory(storeId: string, page: number = 1, limit: number = 20) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;

    const [items, total] = await Promise.all([
      this.prisma.cashDrawer.findMany({
        where: { storeId },
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
        skip,
        take: l,
        orderBy: { openedAt: 'desc' },
      }),
      this.prisma.cashDrawer.count({ where: { storeId } }),
    ]);

    return {
      data: items,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }
}
