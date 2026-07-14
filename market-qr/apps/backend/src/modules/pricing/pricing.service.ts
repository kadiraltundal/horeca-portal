import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async getProductPrice(productId: string, options?: { regionId?: string; customerTier?: string }) {
    const now = new Date();
    const where: any = {
      productId,
      isActive: true,
      OR: [
        { startTime: null, endTime: null },
        { startTime: { lte: now }, endTime: { gte: now } },
      ],
    };

    if (options?.regionId) where.regionId = options.regionId;
    if (options?.customerTier) where.customerTier = options.customerTier;

    const prices = await this.prisma.productPrice.findMany({ where });
    return prices;
  }

  async findBestPrice(productId: string, options?: { regionId?: string; customerTier?: string }) {
    const prices = await this.getProductPrice(productId, options);
    if (prices.length === 0) {
      const product = await this.prisma.product.findUnique({ where: { id: productId } });
      if (!product) throw new NotFoundException('Product not found');
      return { priceType: 'NORMAL', price: product.price, currency: product.currency };
    }
    return prices.reduce((best, current) => current.price < best.price ? current : best);
  }

  async findAll(productId?: string) {
    const where = productId ? { productId } : {};
    return this.prisma.productPrice.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    productId: string;
    priceType: string;
    price: number;
    currency?: string;
    regionId?: string;
    customerTier?: string;
    startTime?: string;
    endTime?: string;
  }) {
    return this.prisma.productPrice.create({
      data: {
        ...data,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.productPrice.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.productPrice.delete({ where: { id } });
  }
}
