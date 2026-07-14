import { Controller, Post, Body, Get, Logger } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(private readonly telegramService: TelegramService) {}

  @Post('webhook')
  handleWebhook(@Body() update: any) {
    this.logger.log('Received Telegram webhook update');

    // Handle different update types
    if (update.message) {
      this.handleMessage(update.message);
    }

    return { ok: true };
  }

  @Get('webhook')
  verifyWebhook() {
    return { status: 'ok' };
  }

  private handleMessage(message: any) {
    const chatId = message.chat.id;
    const text = message.text;
    const firstName = message.from?.first_name || 'Foydalanuvchi';

    this.logger.log(`Message from ${firstName}: ${text}`);

    // Handle /start command
    if (text === '/start') {
      this.telegramService.sendWelcomeMessage(chatId, firstName);
    }

    // Handle /help command
    if (text === '/help') {
      this.telegramService.sendMessage(
        chatId,
        `📚 <b>Yordam</b>

Bu bot HORECA Portal bildirimlari uchun ishlatiladi.

Buyruqlar:
/start - Botni boshlash
/help - Yordam
/quotes - Tekliflarim

Mini App orqali mahsulotlarni ko'ring va teklif yuboring!`,
      );
    }
  }
}