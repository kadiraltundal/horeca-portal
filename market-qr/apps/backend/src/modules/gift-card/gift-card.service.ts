import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateGiftCardDto } from './dto/create-gift-card.dto';
import { RedeemGiftCardDto } from './dto/redeem-gift-card.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class GiftCardService {
  constructor(private prisma: PrismaService) {}

  private generateCode(): string {
    const bytes = randomBytes(8);
    return bytes.toString('hex').toUpperCase().match(/.{1,4}/g)!.join('-');
  }

  async findAll(page: number = 1, limit: number = 20, status?: string) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;
    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.giftCard.findMany({
        where,
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.giftCard.count({ where }),
    ]);

    return {
      data: items,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }

  async findOne(code: string) {
    const giftCard = await this.prisma.giftCard.findUnique({
      where: { code },
      include: {
        transactions: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!giftCard) {
      throw new NotFoundException('Gift card not found');
    }

    return giftCard;
  }

  async create(data: CreateGiftCardDto) {
    let code = this.generateCode();

    while (await this.prisma.giftCard.findUnique({ where: { code } })) {
      code = this.generateCode();
    }

    const card = await this.prisma.giftCard.create({
      data: {
        code,
        initialValue: data.initialValue,
        currentBalance: data.initialValue,
        currency: data.currency || 'TRY',
        issuedBy: data.issuedBy,
        issuedTo: data.issuedTo,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    await this.prisma.giftCardTransaction.create({
      data: {
        giftCardId: card.id,
        type: 'ISSUE',
        amount: data.initialValue,
        balanceAfter: data.initialValue,
      },
    });

    return card;
  }

  async redeem(code: string, data: RedeemGiftCardDto) {
    const giftCard = await this.prisma.giftCard.findUnique({
      where: { code },
    });

    if (!giftCard) {
      throw new NotFoundException('Gift card not found');
    }

    if (giftCard.status !== 'ACTIVE') {
      throw new BadRequestException('Gift card is not active');
    }

    if (giftCard.expiresAt && giftCard.expiresAt < new Date()) {
      throw new BadRequestException('Gift card has expired');
    }

    if (giftCard.currentBalance < data.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const newBalance = giftCard.currentBalance - data.amount;

    const [updatedCard] = await this.prisma.$transaction([
      this.prisma.giftCard.update({
        where: { code },
        data: {
          currentBalance: newBalance,
          status: newBalance === 0 ? 'USED' : 'ACTIVE',
        },
      }),
      this.prisma.giftCardTransaction.create({
        data: {
          giftCardId: giftCard.id,
          type: 'REDEEM',
          amount: -data.amount,
          balanceAfter: newBalance,
          reference: data.orderId,
        },
      }),
    ]);

    return updatedCard;
  }

  async activate(code: string) {
    const giftCard = await this.prisma.giftCard.findUnique({
      where: { code },
    });

    if (!giftCard) {
      throw new NotFoundException('Gift card not found');
    }

    if (giftCard.status === 'ACTIVE') {
      throw new BadRequestException('Gift card is already active');
    }

    return this.prisma.giftCard.update({
      where: { code },
      data: { status: 'ACTIVE' },
    });
  }

  async cancel(code: string) {
    const giftCard = await this.prisma.giftCard.findUnique({
      where: { code },
    });

    if (!giftCard) {
      throw new NotFoundException('Gift card not found');
    }

    if (giftCard.status === 'CANCELLED') {
      throw new BadRequestException('Gift card is already cancelled');
    }

    if (giftCard.currentBalance < giftCard.initialValue) {
      throw new BadRequestException('Cannot cancel a partially used gift card');
    }

    return this.prisma.giftCard.update({
      where: { code },
      data: { status: 'CANCELLED' },
    });
  }

  async getTransactions(code: string) {
    const giftCard = await this.prisma.giftCard.findUnique({
      where: { code },
    });

    if (!giftCard) {
      throw new NotFoundException('Gift card not found');
    }

    return this.prisma.giftCardTransaction.findMany({
      where: { giftCardId: giftCard.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
    const [total, active, expired, cancelled, totalValue] = await Promise.all([
      this.prisma.giftCard.count(),
      this.prisma.giftCard.count({ where: { status: 'ACTIVE' } }),
      this.prisma.giftCard.count({ where: { status: 'EXPIRED' } }),
      this.prisma.giftCard.count({ where: { status: 'CANCELLED' } }),
      this.prisma.giftCard.aggregate({ _sum: { initialValue: true, currentBalance: true } }),
    ]);

    const totalIssued = totalValue._sum.initialValue || 0;
    const totalRemaining = totalValue._sum.currentBalance || 0;

    return {
      total,
      active,
      expired,
      cancelled,
      totalIssuedValue: totalIssued,
      totalRemainingValue: totalRemaining,
      totalRedeemedValue: totalIssued - totalRemaining,
    };
  }
}
