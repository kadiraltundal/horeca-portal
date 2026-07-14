import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnStatusDto } from './dto/update-return-status.dto';

@Injectable()
export class ReturnsService {
  constructor(private prisma: PrismaService) {}

  async findAll(storeId: string, page: number = 1, limit: number = 20, status?: string) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;
    const where: any = { storeId };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.returnRequest.findMany({
        where,
        include: {
          order: true,
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          returnItems: { include: { product: true } },
        },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.returnRequest.count({ where }),
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
    const returnRequest = await this.prisma.returnRequest.findUnique({
      where: { id },
      include: {
        order: { include: { orderItems: { include: { product: true } } } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        store: true,
        returnItems: { include: { product: true } },
      },
    });

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    return returnRequest;
  }

  async create(data: CreateReturnDto, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.storeId !== data.storeId) {
      throw new BadRequestException('Order does not belong to this store');
    }

    const refundAmount = data.refundAmount ?? data.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    return this.prisma.returnRequest.create({
      data: {
        orderId: data.orderId,
        userId,
        storeId: data.storeId,
        reason: data.reason,
        refundAmount,
        refundMethod: data.refundMethod,
        notes: data.notes,
        images: data.images,
        returnItems: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            reason: item.reason,
            condition: item.condition ?? 'NEW',
          })),
        },
      },
      include: {
        returnItems: { include: { product: true } },
      },
    });
  }

  async updateStatus(id: string, dto: UpdateReturnStatusDto, userId: string) {
    const returnRequest = await this.prisma.returnRequest.findUnique({ where: { id } });

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    const validTransitions: Record<string, string[]> = {
      PENDING: ['APPROVED', 'REJECTED'],
      APPROVED: ['RECEIVED'],
      RECEIVED: ['COMPLETED'],
      REJECTED: [],
      COMPLETED: [],
    };

    if (!validTransitions[returnRequest.status]?.includes(dto.status)) {
      throw new BadRequestException(`Cannot transition from ${returnRequest.status} to ${dto.status}`);
    }

    const updateData: any = { status: dto.status };

    if (dto.refundAmount !== undefined) updateData.refundAmount = dto.refundAmount;
    if (dto.refundMethod) updateData.refundMethod = dto.refundMethod;
    if (dto.notes) updateData.notes = dto.notes;

    if (dto.status === 'COMPLETED') {
      await this.prisma.order.update({
        where: { id: returnRequest.orderId },
        data: { status: 'REFUNDED' },
      });
    }

    return this.prisma.returnRequest.update({
      where: { id },
      data: updateData,
      include: {
        returnItems: { include: { product: true } },
      },
    });
  }

  async processRefund(id: string, userId: string) {
    const returnRequest = await this.prisma.returnRequest.findUnique({
      where: { id },
      include: { returnItems: { include: { product: true } } },
    });

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    if (returnRequest.status !== 'APPROVED') {
      throw new BadRequestException('Return must be approved before processing refund');
    }

    // Restore stock for returned items
    for (const item of returnRequest.returnItems) {
      await this.prisma.storeProduct.update({
        where: {
          storeId_productId: { storeId: returnRequest.storeId, productId: item.productId },
        },
        data: { stockQuantity: { increment: item.quantity } },
      });
    }

    return this.prisma.returnRequest.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: { returnItems: { include: { product: true } } },
    });
  }

  async getStats(storeId: string) {
    const where = { storeId };

    const [total, pending, approved, rejected, completed, totalRefundAmount] = await Promise.all([
      this.prisma.returnRequest.count({ where }),
      this.prisma.returnRequest.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.returnRequest.count({ where: { ...where, status: 'APPROVED' } }),
      this.prisma.returnRequest.count({ where: { ...where, status: 'REJECTED' } }),
      this.prisma.returnRequest.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.returnRequest.aggregate({
        where: { ...where, status: 'COMPLETED' },
        _sum: { refundAmount: true },
      }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      completed,
      totalRefundAmount: totalRefundAmount._sum.refundAmount ?? 0,
    };
  }
}
