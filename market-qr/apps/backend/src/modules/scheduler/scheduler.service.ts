import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private prisma: PrismaService) {}

  async closeExpiredPromotions() {
    const result = await this.prisma.promotion.updateMany({
      where: { isActive: true, endDate: { lt: new Date() } },
      data: { isActive: false },
    });
    this.logger.log(`Closed ${result.count} expired promotions`);
    return { closed: result.count };
  }

  async markExpiringProducts(days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const expiringBatches = await this.prisma.batch.findMany({
      where: {
        expiryDate: { lte: futureDate, gte: new Date() },
        status: 'ACTIVE',
        remainingQty: { gt: 0 },
      },
      include: { product: true, warehouse: true },
    });

    this.logger.log(`Found ${expiringBatches.length} expiring batches`);
    return { expiringBatches, count: expiringBatches.length };
  }

  async cleanupExpiredSessions() {
    const result = await this.prisma.userSession.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    this.logger.log(`Cleaned up ${result.count} expired sessions`);
    return { cleaned: result.count };
  }

  async getSchedulerStatus() {
    return {
      lastCheck: new Date(),
      tasks: [
        'closeExpiredPromotions',
        'markExpiringProducts',
        'cleanupExpiredSessions',
      ],
    };
  }

  async runAllTasks() {
    const [promotions, expiring, sessions] = await Promise.all([
      this.closeExpiredPromotions(),
      this.markExpiringProducts(),
      this.cleanupExpiredSessions(),
    ]);

    return { promotions, expiring, sessions };
  }
}
