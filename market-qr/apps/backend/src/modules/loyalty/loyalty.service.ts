import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  async getBalance(userId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException('Customer not found');
    return { points: customer.points, tier: customer.tier };
  }

  async addPoints(userId: string, points: number, reference?: string) {
    const customer = await this.prisma.customer.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException('Customer not found');

    await this.prisma.$transaction([
      this.prisma.customer.update({
        where: { userId },
        data: { points: { increment: points } },
      }),
      this.prisma.loyaltyTransaction.create({
        data: { userId, points, type: 'EARN', reference },
      }),
    ]);

    return this.getBalance(userId);
  }

  async usePoints(userId: string, points: number, reference?: string) {
    const customer = await this.prisma.customer.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException('Customer not found');
    if (customer.points < points) throw new NotFoundException('Insufficient points');

    await this.prisma.$transaction([
      this.prisma.customer.update({
        where: { userId },
        data: { points: { decrement: points } },
      }),
      this.prisma.loyaltyTransaction.create({
        data: { userId, points: -points, type: 'REDEEM', reference },
      }),
    ]);

    return this.getBalance(userId);
  }

  async getTransactions(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.prisma.loyaltyTransaction.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.loyaltyTransaction.count({ where: { userId } }),
    ]);
    return { data: transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateTier(userId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException('Customer not found');

    let tier = 'BRONZE';
    if (customer.points >= 10000) tier = 'PLATINUM';
    else if (customer.points >= 5000) tier = 'GOLD';
    else if (customer.points >= 1000) tier = 'SILVER';

    return this.prisma.customer.update({
      where: { userId },
      data: { tier },
    });
  }

  // Rewards
  async findAllRewards() {
    return this.prisma.loyaltyReward.findMany({ where: { isActive: true } });
  }

  async createReward(data: { name: string; description?: string; pointsCost: number; rewardType: string }) {
    return this.prisma.loyaltyReward.create({ data });
  }

  async redeemReward(userId: string, rewardId: string) {
    const reward = await this.prisma.loyaltyReward.findUnique({ where: { id: rewardId } });
    if (!reward) throw new NotFoundException('Reward not found');

    const customer = await this.prisma.customer.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException('Customer not found');
    if (customer.points < reward.pointsCost) throw new NotFoundException('Insufficient points');

    await this.usePoints(userId, reward.pointsCost, `Reward: ${reward.name}`);
    return { success: true, reward };
  }
}
