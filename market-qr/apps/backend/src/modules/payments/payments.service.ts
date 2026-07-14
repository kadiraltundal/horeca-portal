import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { FinanceService } from '../finance/finance.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private financeService: FinanceService,
  ) {}

  async initialize(data: { orderId: string; method: string; provider?: string }) {
    const order = await this.prisma.order.findUnique({ where: { id: data.orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'PENDING') throw new BadRequestException('Order is not pending');

    const payment = await this.prisma.payment.create({
      data: {
        orderId: data.orderId,
        amount: order.totalAmount,
        method: data.method,
        provider: data.provider || 'MANUAL',
        status: 'PENDING',
      },
    });

    return payment;
  }

  async confirm(orderId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw new NotFoundException('Payment not found');

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { orderId },
        data: { status: 'SUCCESS' },
      }),
      this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      }),
    ]);

    try {
      await this.financeService.createInvoiceFromOrder(orderId);
    } catch (e) {
      console.error('Invoice creation failed after payment:', e);
    }

    return this.prisma.payment.findUnique({ where: { orderId } });
  }

  async fail(orderId: string, reason?: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw new NotFoundException('Payment not found');

    await this.prisma.payment.update({
      where: { orderId },
      data: { status: 'FAILED', webhookLog: reason },
    });

    return this.prisma.payment.findUnique({ where: { orderId } });
  }

  async getStatus(orderId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
}
