import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Notification, NotificationType } from './entities/notification.entity';
import { Quote } from '../quotes/entities/quote.entity';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    private configService: ConfigService,
    private telegramService: TelegramService,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      userId,
      type,
      title,
      message,
    });
    return this.notificationsRepository.save(notification);
  }

  async findByUser(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }
    return this.notificationsRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: string): Promise<void> {
    await this.notificationsRepository.update(id, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async sendQuoteNotification(quote: Quote): Promise<void> {
    // Create in-app notification
    await this.create(
      quote.userId,
      NotificationType.QUOTE_STATUS,
      'Teklifiniz Alındı',
      `Teklif numaranız: ${quote.quoteNumber}. En kısa sürede sizinle iletişime geçeceğiz.`,
    );

    // Send Telegram notification to admin
    await this.telegramService.sendQuoteNotification({
      quoteNumber: quote.quoteNumber,
      customerName: `${quote.user?.firstName || ''} ${quote.user?.lastName || ''}`.trim(),
      company: quote.user?.company,
      totalAmount: quote.totalAmount || 0,
      itemCount: quote.items?.length || 0,
      customerNote: quote.customerNote,
      quoteId: quote.id,
    });
  }

  async sendQuoteStatusNotification(quote: Quote): Promise<void> {
    const statusMessages: Record<string, string> = {
      pending: 'Beklemede',
      processing: 'İşleniyor',
      completed: 'Tamamlandı',
      rejected: 'Reddedildi',
    };

    await this.create(
      quote.userId,
      NotificationType.QUOTE_STATUS,
      'Teklif Durumu Güncellendi',
      `Teklif #${quote.quoteNumber} durumu: ${statusMessages[quote.status]}`,
    );

    // Send Telegram notification to user
    if (quote.user?.telegramId) {
      await this.telegramService.sendQuoteStatusNotification({
        quoteNumber: quote.quoteNumber,
        customerTelegramId: quote.user.telegramId,
        status: quote.status,
        adminNote: quote.adminNote,
      });
    }
  }
}