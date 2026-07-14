import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class BatchesService {
  constructor(private prisma: PrismaService) {}

  async findAll(productId?: string, warehouseId?: string, page: number = 1, limit: number = 20) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;
    const where: any = {};
    if (productId) where.productId = productId;
    if (warehouseId) where.warehouseId = warehouseId;

    const [batches, total] = await Promise.all([
      this.prisma.batch.findMany({
        where,
        include: { product: true, supplier: true, warehouse: true },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.batch.count({ where }),
    ]);
    return { data: batches, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
  }

  async findOne(id: string) {
    const batch = await this.prisma.batch.findUnique({
      where: { id },
      include: { product: true, supplier: true, warehouse: true, storeStocks: true },
    });
    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }

  async create(data: {
    batchNumber: string;
    productId: string;
    supplierId?: string;
    warehouseId?: string;
    manufactureDate?: string;
    expiryDate?: string;
    quantity: number;
  }) {
    return this.prisma.batch.create({
      data: {
        ...data,
        manufactureDate: data.manufactureDate ? new Date(data.manufactureDate) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        remainingQty: data.quantity,
      },
      include: { product: true, supplier: true },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.batch.update({ where: { id }, data });
  }

  async getExpiringSoon(days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.batch.findMany({
      where: {
        expiryDate: { lte: futureDate, gte: new Date() },
        status: 'ACTIVE',
        remainingQty: { gt: 0 },
      },
      include: { product: true, warehouse: true },
      orderBy: { expiryDate: 'asc' },
    });
  }

  async getExpired() {
    return this.prisma.batch.findMany({
      where: {
        expiryDate: { lt: new Date() },
        remainingQty: { gt: 0 },
      },
      include: { product: true, warehouse: true },
      orderBy: { expiryDate: 'asc' },
    });
  }
}
