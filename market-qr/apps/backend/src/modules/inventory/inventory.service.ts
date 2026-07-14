import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(storeId: string, page: number = 1, limit: number = 20) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;

    const [items, total] = await Promise.all([
      this.prisma.storeProduct.findMany({
        where: { storeId },
        include: {
          product: {
            include: { category: true },
          },
        },
        skip,
        take: l,
        orderBy: { lastUpdated: 'desc' },
      }),
      this.prisma.storeProduct.count({ where: { storeId } }),
    ]);

    return {
      data: items,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }

  async getAlerts(storeId: string) {
    const alerts = await this.prisma.storeProduct.findMany({
      where: {
        storeId,
      },
      include: {
        product: {
          include: { category: true },
        },
      },
      orderBy: { stockQuantity: 'asc' },
    });

    // Prisma doesn't support dynamic field comparison, so we filter manually
    return alerts.filter(
      (item) => item.stockQuantity <= item.minStockThreshold,
    );
  }

  async updateStock(
    storeId: string,
    productId: string,
    data: {
      stockQuantity?: number;
      shelfNumber?: string;
      minStockThreshold?: number;
    },
  ) {
    const storeProduct = await this.prisma.storeProduct.findUnique({
      where: {
        storeId_productId: { storeId, productId },
      },
    });

    if (!storeProduct) {
      throw new NotFoundException('Store product not found');
    }

    return this.prisma.storeProduct.update({
      where: {
        storeId_productId: { storeId, productId },
      },
      data,
      include: {
        product: true,
      },
    });
  }

  async bulkUpdate(
    storeId: string,
    items: Array<{
      productId: string;
      stockQuantity: number;
      shelfNumber?: string;
    }>,
  ) {
    const results = await Promise.all(
      items.map((item) =>
        this.prisma.storeProduct.upsert({
          where: {
            storeId_productId: {
              storeId,
              productId: item.productId,
            },
          },
          update: {
            stockQuantity: item.stockQuantity,
            shelfNumber: item.shelfNumber,
          },
          create: {
            storeId,
            productId: item.productId,
            stockQuantity: item.stockQuantity,
            shelfNumber: item.shelfNumber,
          },
        }),
      ),
    );

    return {
      updated: results.length,
      items: results,
    };
  }
}
