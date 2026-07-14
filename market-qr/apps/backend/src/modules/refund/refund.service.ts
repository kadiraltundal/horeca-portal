import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateRefundDto } from './dto/create-refund.dto';

@Injectable()
export class RefundService {
  constructor(private prisma: PrismaService) {}

  async findAll(storeId: string, page: number = 1, limit: number = 20, status?: string) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;
    const where: any = { order: { storeId } };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.refund.findMany({
        where,
        include: {
          order: {
            include: { orderItems: { include: { product: true } } },
          },
        },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.refund.count({ where }),
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
    const refund = await this.prisma.refund.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            orderItems: { include: { product: true } },
            payment: true,
          },
        },
      },
    });

    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    return refund;
  }

  async create(data: CreateRefundDto, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
      include: { refunds: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Cannot refund cancelled order');
    }

    const totalRefunded = order.refunds
      .filter((r) => r.status !== 'REJECTED')
      .reduce((sum, r) => sum + r.amount, 0);

    if (totalRefunded + data.amount > order.totalAmount) {
      throw new BadRequestException('Refund amount exceeds order total');
    }

    return this.prisma.refund.create({
      data: {
        orderId: data.orderId,
        amount: data.amount,
        reason: data.reason,
        processedBy: userId,
      },
    });
  }

  async updateStatus(id: string, status: string, userId?: string) {
    const refund = await this.prisma.refund.findUnique({ where: { id } });

    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    const validTransitions: Record<string, string[]> = {
      PENDING: ['APPROVED', 'REJECTED'],
      APPROVED: ['COMPLETED'],
      REJECTED: [],
      COMPLETED: [],
    };

    if (!validTransitions[refund.status]?.includes(status)) {
      throw new BadRequestException(`Cannot transition from ${refund.status} to ${status}`);
    }

    const updateData: any = { status };

    if (status === 'COMPLETED') {
      updateData.processedAt = new Date();

      // Update order status
      await this.prisma.order.update({
        where: { id: refund.orderId },
        data: { status: 'REFUNDED' },
      });
    }

    return this.prisma.refund.update({
      where: { id },
      data: updateData,
    });
  }
}
