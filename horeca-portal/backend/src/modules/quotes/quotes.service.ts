import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quote, QuoteStatus } from './entities/quote.entity';
import { QuoteItem } from './entities/quote-item.entity';
import { CartService } from '../cart/cart.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private quotesRepository: Repository<Quote>,
    @InjectRepository(QuoteItem)
    private quoteItemsRepository: Repository<QuoteItem>,
    private cartService: CartService,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, createQuoteDto: CreateQuoteDto): Promise<Quote> {
    // Get cart items
    const cartItems = await this.cartService.findByUser(userId);
    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Generate quote number
    const quoteNumber = this.generateQuoteNumber();

    // Calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0,
    );

    // Create quote
    const quote = this.quotesRepository.create({
      quoteNumber,
      userId,
      totalAmount,
      currency: 'USD',
      customerNote: createQuoteDto.customerNote,
    });
    const savedQuote = await this.quotesRepository.save(quote);

    // Create quote items from cart
    const quoteItems = cartItems.map((item) =>
      this.quoteItemsRepository.create({
        quoteId: savedQuote.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        note: item.note,
      }),
    );
    await this.quoteItemsRepository.save(quoteItems);

    // Clear cart
    await this.cartService.clearUserCart(userId);

    // Send notification to admin
    await this.notificationsService.sendQuoteNotification(savedQuote);

    return this.findOne(savedQuote.id);
  }

  async findAll(userId?: string): Promise<Quote[]> {
    const where = userId ? { userId } : {};
    return this.quotesRepository.find({
      where,
      relations: {
        items: {
          product: true,
        },
        user: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Quote> {
    const quote = await this.quotesRepository.findOne({
      where: { id },
      relations: {
        items: {
          product: true,
        },
        user: true,
      },
    });
    if (!quote) {
      throw new NotFoundException('Quote not found');
    }
    return quote;
  }

  async findByUser(userId: string): Promise<Quote[]> {
    return this.quotesRepository.find({
      where: { userId },
      relations: {
        items: {
          product: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, updateQuoteStatusDto: UpdateQuoteStatusDto): Promise<Quote> {
    const quote = await this.findOne(id);
    quote.status = updateQuoteStatusDto.status;
    if (updateQuoteStatusDto.adminNote) {
      quote.adminNote = updateQuoteStatusDto.adminNote;
    }
    await this.quotesRepository.save(quote);

    // Notify user about status change
    await this.notificationsService.sendQuoteStatusNotification(quote);

    return this.findOne(id);
  }

  async repeatQuote(id: string, userId: string): Promise<Quote> {
    const originalQuote = await this.findOne(id);

    // Create new quote with same items
    const quoteNumber = this.generateQuoteNumber();
    const quote = this.quotesRepository.create({
      quoteNumber,
      userId,
      totalAmount: originalQuote.totalAmount,
      currency: originalQuote.currency,
      customerNote: `Tekrar teklif: ${originalQuote.quoteNumber}`,
    });
    const savedQuote = await this.quotesRepository.save(quote);

    // Copy items
    const quoteItems = originalQuote.items.map((item) =>
      this.quoteItemsRepository.create({
        quoteId: savedQuote.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        note: item.note,
      }),
    );
    await this.quoteItemsRepository.save(quoteItems);

    return this.findOne(savedQuote.id);
  }

  async getStats() {
    const totalQuotes = await this.quotesRepository.count();
    const pendingQuotes = await this.quotesRepository.count({
      where: { status: QuoteStatus.PENDING },
    });
    const completedQuotes = await this.quotesRepository.count({
      where: { status: QuoteStatus.COMPLETED },
    });

    const totalAmount = await this.quotesRepository
      .createQueryBuilder('quote')
      .select('SUM(quote.total_amount)', 'total')
      .getRawOne();

    return {
      totalQuotes,
      pendingQuotes,
      completedQuotes,
      totalAmount: parseFloat(totalAmount.total) || 0,
    };
  }

  private generateQuoteNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `Q${year}${month}${day}-${random}`;
  }
}