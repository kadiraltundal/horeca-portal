import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuoteCart } from './entities/quote-cart.entity';
import { ProductsService } from '../products/products.service';
import { PricingService } from '../pricing/pricing.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CartService', () => {
  let service: CartService;

  const mockCartRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ count: '5' }),
    })),
  });

  const mockProductsService = {
    findOne: jest.fn(),
  };

  const mockPricingService = {
    findByProduct: jest.fn(),
    getUnitPriceForQuantity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(QuoteCart), useValue: mockCartRepository() },
        { provide: ProductsService, useValue: mockProductsService },
        { provide: PricingService, useValue: mockPricingService },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addToUser', () => {
    it('should add item to cart', async () => {
      const mockProduct = { id: 'prod-uuid', minQuantity: 1 };
      const mockPricing = { sellingPrice: 2.5 };
      const mockCartItem = {
        id: 'cart-uuid',
        userId: 'user-uuid',
        productId: 'prod-uuid',
        quantity: 5,
        unitPrice: 2.5,
        totalPrice: 12.5,
      };

      mockProductsService.findOne.mockResolvedValue(mockProduct);
      mockPricingService.getUnitPriceForQuantity.mockResolvedValue(2.5);
      (service as any).cartRepository = {
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockReturnValue(mockCartItem),
        save: jest.fn().mockResolvedValue(mockCartItem),
      };

      const result = await service.addToUser('user-uuid', {
        productId: 'prod-uuid',
        quantity: 5,
      });

      expect(result).toEqual(mockCartItem);
    });

    it('should throw BadRequestException when product already in cart', async () => {
      const mockProduct = { id: 'prod-uuid', minQuantity: 1 };
      const existingCartItem = { id: 'existing-cart-uuid' };

      mockProductsService.findOne.mockResolvedValue(mockProduct);
      (service as any).cartRepository = {
        findOne: jest.fn().mockResolvedValue(existingCartItem),
      };

      await expect(
        service.addToUser('user-uuid', { productId: 'prod-uuid', quantity: 5 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeFromUser', () => {
    it('should remove item from cart', async () => {
      const mockCartItem = { id: 'cart-uuid', userId: 'user-uuid' };

      (service as any).cartRepository = {
        findOne: jest.fn().mockResolvedValue(mockCartItem),
        remove: jest.fn().mockResolvedValue(mockCartItem),
      };

      await service.removeFromUser('cart-uuid', 'user-uuid');
      expect((service as any).cartRepository.remove).toHaveBeenCalledWith(mockCartItem);
    });

    it('should throw NotFoundException when cart item not found', async () => {
      (service as any).cartRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      await expect(
        service.removeFromUser('non-existent', 'user-uuid'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCartSummary', () => {
    it('should return cart summary', async () => {
      const mockItems = [
        { totalPrice: 12.5 },
        { totalPrice: 9.0 },
        { totalPrice: 16.0 },
      ];

      (service as any).cartRepository = {
        find: jest.fn().mockResolvedValue(mockItems),
      };

      const result = await service.getCartSummary('user-uuid');

      expect(result).toEqual({
        items: mockItems,
        itemCount: 3,
        totalAmount: 37.5,
      });
    });
  });
});
