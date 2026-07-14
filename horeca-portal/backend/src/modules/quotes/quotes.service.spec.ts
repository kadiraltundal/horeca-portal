import { Test, TestingModule } from '@nestjs/testing';
import { QuotesService } from './quotes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Quote, QuoteStatus } from './entities/quote.entity';
import { QuoteItem } from './entities/quote-item.entity';
import { CartService } from '../cart/cart.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('QuotesService', () => {
  let service: QuotesService;

  const mockQuote = {
    id: 'quote-uuid',
    quoteNumber: 'Q260713-0001',
    userId: 'user-uuid',
    status: QuoteStatus.PENDING,
    totalAmount: 37.5,
    currency: 'USD',
    customerNote: 'Test notu',
    items: [
      {
        id: 'item-uuid',
        productId: 'prod-uuid',
        quantity: 5,
        unitPrice: 2.5,
        totalPrice: 12.5,
      },
    ],
    user: {
      firstName: 'Ahmad',
      lastName: 'Karimov',
      telegramId: 123456789,
    },
  };

  const mockCartItems = [
    {
      id: 'cart-uuid',
      productId: 'prod-uuid',
      quantity: 5,
      unitPrice: 2.5,
      totalPrice: 12.5,
      note: 'Test',
    },
  ];

  const mockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ total: '15000' }),
    })),
  });

  const mockCartService = {
    findByUser: jest.fn(),
    clearUserCart: jest.fn(),
  };

  const mockNotificationsService = {
    sendQuoteNotification: jest.fn(),
    sendQuoteStatusNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotesService,
        { provide: getRepositoryToken(Quote), useValue: mockRepository() },
        { provide: getRepositoryToken(QuoteItem), useValue: mockRepository() },
        { provide: CartService, useValue: mockCartService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<QuotesService>(QuotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a quote from cart items', async () => {
      mockCartService.findByUser.mockResolvedValue(mockCartItems);
      mockCartService.clearUserCart.mockResolvedValue(undefined);

      const quoteRepo = {
        create: jest.fn().mockReturnValue(mockQuote),
        save: jest.fn().mockResolvedValue(mockQuote),
        findOne: jest.fn().mockResolvedValue(mockQuote),
      };
      const itemRepo = {
        create: jest.fn(),
        save: jest.fn(),
      };

      (service as any).quotesRepository = quoteRepo;
      (service as any).quoteItemsRepository = itemRepo;

      const result = await service.create('user-uuid', {
        customerNote: 'Test notu',
      });

      expect(result).toBeDefined();
      expect(quoteRepo.create).toHaveBeenCalled();
      expect(mockCartService.clearUserCart).toHaveBeenCalledWith('user-uuid');
    });

    it('should throw BadRequestException when cart is empty', async () => {
      mockCartService.findByUser.mockResolvedValue([]);

      await expect(
        service.create('user-uuid', { customerNote: 'Test' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a quote when found', async () => {
      const quoteRepo = {
        findOne: jest.fn().mockResolvedValue(mockQuote),
      };
      (service as any).quotesRepository = quoteRepo;

      const result = await service.findOne('quote-uuid');
      expect(result).toEqual(mockQuote);
    });

    it('should throw NotFoundException when quote not found', async () => {
      const quoteRepo = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      (service as any).quotesRepository = quoteRepo;

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update quote status', async () => {
      const quoteRepo = {
        findOne: jest.fn().mockResolvedValue(mockQuote),
        save: jest.fn().mockResolvedValue({ ...mockQuote, status: QuoteStatus.PROCESSING }),
      };
      (service as any).quotesRepository = quoteRepo;

      const result = await service.updateStatus('quote-uuid', {
        status: QuoteStatus.PROCESSING,
        adminNote: 'İşleniyor',
      });

      expect(result.status).toBe(QuoteStatus.PROCESSING);
    });
  });

  describe('getStats', () => {
    it('should return quote statistics', async () => {
      const quoteRepo = {
        count: jest.fn()
          .mockResolvedValueOnce(300)
          .mockResolvedValueOnce(25)
          .mockResolvedValueOnce(250),
        createQueryBuilder: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ total: '15000' }),
        })),
      };
      (service as any).quotesRepository = quoteRepo;

      const result = await service.getStats();

      expect(result).toHaveProperty('totalQuotes', 300);
      expect(result).toHaveProperty('pendingQuotes', 25);
      expect(result).toHaveProperty('completedQuotes', 250);
    });
  });
});
