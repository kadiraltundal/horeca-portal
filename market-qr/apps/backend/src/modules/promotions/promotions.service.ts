import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(isActive?: boolean) {
    const where = isActive !== undefined ? { isActive } : {};
    return this.prisma.promotion.findMany({
      where,
      include: { coupons: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const promo = await this.prisma.promotion.findUnique({
      where: { id },
      include: { coupons: true },
    });
    if (!promo) throw new NotFoundException('Promotion not found');
    return promo;
  }

  async create(data: {
    title: string;
    description?: string;
    discountType: string;
    discountValue: number;
    startDate: string;
    endDate: string;
    targetCategoryId?: string;
    usageLimit?: number;
  }) {
    return this.prisma.promotion.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.promotion.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.promotion.delete({ where: { id } });
  }

  async toggleActive(id: string) {
    const promo = await this.findOne(id);
    return this.prisma.promotion.update({
      where: { id },
      data: { isActive: !promo.isActive },
    });
  }

  // Coupons
  async validateCoupon(code: string, amount: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
      include: { promotion: true },
    });

    if (!coupon) throw new NotFoundException('Coupon not found');
    if (!coupon.isActive) throw new BadRequestException('Coupon is inactive');
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new BadRequestException('Coupon expired');
    }
    if (coupon.minAmount && amount < coupon.minAmount) {
      throw new BadRequestException(`Minimum amount is ${coupon.minAmount}`);
    }

    return coupon;
  }

  async createCoupon(data: {
    code: string;
    promotionId: string;
    usageLimit?: number;
    minAmount?: number;
    expiresAt?: string;
  }) {
    return this.prisma.coupon.create({
      data: {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });
  }

  async useCoupon(code: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return this.prisma.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } },
    });
  }

  async findAllCoupons() {
    return this.prisma.coupon.findMany({
      include: { promotion: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
