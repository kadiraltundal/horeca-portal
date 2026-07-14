import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Injectable()
export class StockMovementService {
  constructor(private prisma: PrismaService) {}

  async findAll(storeId: string, page: number = 1, limit: number = 20, type?: string) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;
    const where: any = { storeId };
    if (type) {
      where.type = type;
    }

    const [items, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        include: {
          product: true,
        },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return {
      data: items,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }

  async findByProduct(storeId: string, productId: string, page: number = 1, limit: number = 20) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;
    const where = { storeId, productId };

    const [items, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        include: { product: true },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return {
      data: items,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }

  async create(data: CreateStockMovementDto, userId?: string) {
    const storeProduct = await this.prisma.storeProduct.findUnique({
      where: {
        storeId_productId: {
          storeId: data.storeId,
          productId: data.productId,
        },
      },
    });

    if (!storeProduct) {
      throw new NotFoundException('Store product not found');
    }

    let newQuantity = storeProduct.stockQuantity;

    switch (data.type) {
      case 'IN':
        newQuantity += data.quantity;
        break;
      case 'OUT':
        if (storeProduct.stockQuantity < data.quantity) {
          throw new BadRequestException('Insufficient stock');
        }
        newQuantity -= data.quantity;
        break;
      case 'ADJUSTMENT':
        newQuantity = data.quantity;
        break;
      default:
        break;
    }

    const [movement] = await this.prisma.$transaction([
      this.prisma.stockMovement.create({
        data: {
          storeId: data.storeId,
          productId: data.productId,
          type: data.type,
          quantity: data.quantity,
          referenceType: data.referenceType,
          referenceId: data.referenceId,
          notes: data.notes,
          userId,
        },
      }),
      this.prisma.storeProduct.update({
        where: {
          storeId_productId: {
            storeId: data.storeId,
            productId: data.productId,
          },
        },
        data: { stockQuantity: newQuantity },
      }),
    ]);

    return movement;
  }

  async getStats(storeId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [inMovements, outMovements] = await Promise.all([
      this.prisma.stockMovement.aggregate({
        where: {
          storeId,
          type: 'IN',
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { quantity: true },
        _count: true,
      }),
      this.prisma.stockMovement.aggregate({
        where: {
          storeId,
          type: 'OUT',
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { quantity: true },
        _count: true,
      }),
    ]);

    return {
      period: 'last_30_days',
      inbound: {
        totalQuantity: inMovements._sum.quantity || 0,
        count: inMovements._count,
      },
      outbound: {
        totalQuantity: outMovements._sum.quantity || 0,
        count: outMovements._count,
      },
    };
  }
}
