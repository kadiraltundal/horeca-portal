import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string;
  private readonly chatId: string;
  private readonly adminTelegramIds: number[];

  constructor(private configService: ConfigService) {
    this.botToken = this.configService.get('TELEGRAM_BOT_TOKEN', '');
    this.chatId = this.configService.get('TELEGRAM_CHAT_ID', '');
    this.adminTelegramIds = JSON.parse(
      this.configService.get('ADMIN_TELEGRAM_IDS', '[]'),
    );
  }

  async sendMessage(chatId: string | number, message: string): Promise<boolean> {
    if (!this.botToken) {
      this.logger.warn('Telegram bot token not configured');
      return false;
    }

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
          }),
        },
      );

      const data = await response.json();

      if (!data.ok) {
        this.logger.error(`Failed to send Telegram message: ${data.description}`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Telegram API error: ${error.message}`);
      return false;
    }
  }

  async sendToAdmin(message: string): Promise<boolean> {
    if (this.adminTelegramIds.length === 0) {
      this.logger.warn('No admin Telegram IDs configured');
      return false;
    }

    const results = await Promise.all(
      this.adminTelegramIds.map((id) => this.sendMessage(id, message)),
    );

    return results.some((r) => r);
  }

  async sendQuoteNotification(quote: {
    quoteNumber: string;
    customerName: string;
    company?: string;
    totalAmount: number;
    itemCount: number;
    customerNote?: string;
    quoteId: string;
  }): Promise<boolean> {
    const message = `
🔔 <b>Yangi Teklif</b>

📋 Teklif raqami: <b>#${quote.quoteNumber}</b>
👤 Mijoz: ${quote.customerName}
${quote.company ? `🏢 Kompaniya: ${quote.company}` : ''}
💰 Jami summa: <b>$${quote.totalAmount.toFixed(2)}</b>
📦 Mahsulotlar: ${quote.itemCount} ta
${quote.customerNote ? `📝 Eslatma: ${quote.customerNote}` : ''}

Teklifni ko'rish: /quote_${quote.quoteId}
    `.trim();

    return this.sendToAdmin(message);
  }

  async sendQuoteStatusNotification(quote: {
    quoteNumber: string;
    customerTelegramId: number;
    status: string;
    adminNote?: string;
  }): Promise<boolean> {
    const statusText: Record<string, string> = {
      pending: '⏳ Kutilmoqda',
      processing: '⚙️ Jarayonda',
      completed: '✅ Tayyor',
      rejected: '❌ Bekor qilindi',
    };

    const message = `
📋 <b>Teklif yangilandi</b>

Teklif raqami: <b>#${quote.quoteNumber}</b>
Durum: ${statusText[quote.status] || quote.status}
${quote.adminNote ? `📝 Eslatma: ${quote.adminNote}` : ''}
    `.trim();

    return this.sendMessage(quote.customerTelegramId, message);
  }

  async sendWelcomeMessage(chatId: number, firstName: string): Promise<boolean> {
    const message = `
🎉 <b>Xush kelibsiz, ${firstName}!</b>

HORECA Portal'ga xush kelibsiz.
Bu yerda siz Kalsan mahsulotlarini ko'rishingiz va teklif yuborishingiz mumkin.

Boshlash uchun /start buyrug'ini bosing.
    `.trim();

    return this.sendMessage(chatId, message);
  }

  isConfigured(): boolean {
    return !!this.botToken && !!this.chatId;
  }
}