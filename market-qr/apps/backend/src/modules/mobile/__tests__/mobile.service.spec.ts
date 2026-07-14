import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MobileService } from '../mobile.service';
import { PrismaService } from '../../../config/prisma.service';
import { createPrismaMock } from '../../../test-utils/prisma-mock';
import { mockProduct, mockStoreProduct, mockOrder } from '../../../test-utils/mock-fixtures';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('MobileService', () => {
  let service: MobileService;
  let prisma: ReturnType<typeof createPrismaMock>;
  let jwtService: JwtService;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MobileService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                JWT_SECRET: 'test-secret',
                JWT_REFRESH_SECRET: 'test-refresh-secret',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get(MobileService);
    jwtService = module.get(JwtService);

    jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
    jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('$2a$10$hashedpassword'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ── Auth ──

  const mockUser = (overrides?: Record<string, any>) => ({
    id: 'user-123',
    email: 'test@example.com',
    password: '$2a$10$hashedpassword',
    firstName: 'Test',
    lastName: 'User',
    role: 'ADMIN',
    phone: '+905551234567',
    avatarUrl: null,
    ...overrides,
  });

  const mockProductLocal = (overrides?: Record<string, any>) => ({
    id: 'product-123',
    sku: 'PRD-001',
    name: 'Test Product',
    description: 'Test description',
    price: 100,
    currency: 'TRY',
    vatRate: 20,
    isActive: true,
    categoryId: 'category-123',
    images: [],
    ...overrides,
  });

  describe('login', () => {
    it('should return user and tokens on valid login', async () => {
      const user = mockUser();
      prisma.user.findUnique.mockResolvedValue(user);
      prisma.user.update.mockResolvedValue(user);

      const result = await service.login({ email: 'test@example.com', password: 'Password123' });

      expect(result.user.email).toBe(user.email);
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { lastLoginAt: expect.any(Date) },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nonexistent@example.com', password: 'Password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const user = mockUser();
      prisma.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'WrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create user and customer on valid registration', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const user = mockUser({ role: 'CUSTOMER', email: 'new@example.com' });
      prisma.user.create.mockResolvedValue(user);
      prisma.customer.create.mockResolvedValue({ id: 'customer-123', tier: 'BRONZE', points: 0 });

      const result = await service.register({
        email: 'new@example.com',
        password: 'Password123',
        firstName: 'New',
        lastName: 'User',
        phone: '+905551234567',
      });

      expect(result.user.email).toBe('new@example.com');
      expect(result.customer).toBeDefined();
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(prisma.user.create).toHaveBeenCalled();
      expect(prisma.customer.create).toHaveBeenCalledWith({ data: { userId: user.id } });
    });

    it('should throw ConflictException if email already registered', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser());

      await expect(
        service.register({
          email: 'existing@example.com',
          password: 'Password123',
          firstName: 'Test',
          lastName: 'User',
          phone: '+905551234567',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should register device if deviceType and pushToken provided', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser({ role: 'CUSTOMER' }));
      prisma.customer.create.mockResolvedValue({ id: 'customer-123', tier: 'BRONZE', points: 0 });
      prisma.customerDevice.create.mockResolvedValue({});

      await service.register({
        email: 'new@example.com',
        password: 'Password123',
        firstName: 'New',
        lastName: 'User',
        phone: '+905551234567',
        deviceType: 'iOS',
        pushToken: 'token-abc',
      });

      expect(prisma.customerDevice.create).toHaveBeenCalledWith({
        data: {
          customerId: 'customer-123',
          deviceType: 'iOS',
          token: 'token-abc',
        },
      });
    });
  });

  // ── Products ──

  describe('listProducts', () => {
    it('should return products with storeId', async () => {
      const storeProducts = [
        mockStoreProduct({
          product: mockProductLocal({ images: [{ url: 'http://example.com/img.jpg' }] }),
        }),
      ];
      prisma.storeProduct.findMany.mockResolvedValue(storeProducts);
      prisma.storeProduct.count.mockResolvedValue(1);

      const result = await service.listProducts({
        storeId: 'store-123',
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.data[0].name).toBeDefined();
    });

    it('should return products without storeId', async () => {
      const products = [mockProductLocal()];
      prisma.product.findMany.mockResolvedValue(products);
      prisma.product.count.mockResolvedValue(1);

      const result = await service.listProducts({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should apply search filter with storeId', async () => {
      prisma.storeProduct.findMany.mockResolvedValue([]);
      prisma.storeProduct.count.mockResolvedValue(0);

      await service.listProducts({
        storeId: 'store-123',
        page: 1,
        limit: 20,
        search: 'test',
      });

      const findManyCall = prisma.storeProduct.findMany.mock.calls[0][0];
      expect(findManyCall.where.product).toBeDefined();
      expect(findManyCall.where.product.OR).toBeDefined();
    });

    it('should apply categoryId filter without storeId', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.listProducts({
        page: 1,
        limit: 20,
        categoryId: 'category-123',
      });

      const findManyCall = prisma.product.findMany.mock.calls[0][0];
      expect(findManyCall.where.categoryId).toBe('category-123');
    });
  });

  describe('getProduct', () => {
    it('should return a product with all relations', async () => {
      const product = mockProduct({
        category: { id: 'category-123', name: 'Electronics' },
        brand: { id: 'brand-123', name: 'Samsung' },
        supplier: { id: 'supplier-123', name: 'Samsung TR' },
        unit: { id: 'unit-123', name: 'Adet' },
        images: [],
        variants: [],
      });
      prisma.product.findUnique.mockResolvedValue(product);

      const result = await service.getProduct('product-123');

      expect(result).toEqual(product);
    });

    it('should throw NotFoundException if product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.getProduct('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  // ── Categories ──

  describe('listCategories', () => {
    it('should return active root categories with children', async () => {
      const categories = [
        { id: 'cat-1', name: 'Electronics', children: [], sortOrder: 1 },
      ];
      prisma.category.findMany.mockResolvedValue(categories);

      const result = await service.listCategories();

      expect(result).toEqual(categories);
      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { parentId: null, isActive: true },
        }),
      );
    });
  });

  // ── Orders ──

  describe('myOrders', () => {
    it('should return paginated orders', async () => {
      const orders = [mockOrder()];
      prisma.order.findMany.mockResolvedValue(orders);
      prisma.order.count.mockResolvedValue(1);

      const result = await service.myOrders('user-123', 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('getOrder', () => {
    it('should return an order for the owner', async () => {
      const order = mockOrder({ userId: 'user-123' });
      prisma.order.findUnique.mockResolvedValue(order);

      const result = await service.getOrder('user-123', 'order-123');

      expect(result).toEqual(order);
    });

    it('should throw NotFoundException if order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.getOrder('user-123', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      const order = mockOrder({ userId: 'other-user' });
      prisma.order.findUnique.mockResolvedValue(order);

      await expect(service.getOrder('user-123', 'order-123')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ── Favorites ──

  describe('addFavorite', () => {
    it('should add product to favorites', async () => {
      const product = mockProduct();
      prisma.product.findUnique.mockResolvedValue(product);
      prisma.userFavorite.findUnique.mockResolvedValue(null);
      prisma.userFavorite.create.mockResolvedValue({
        id: 'fav-1',
        product: { id: product.id, name: product.name, price: product.price },
      });

      const result = await service.addFavorite('user-123', 'product-123');

      expect(result).toBeDefined();
      expect(prisma.userFavorite.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.addFavorite('user-123', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if already in favorites', async () => {
      const product = mockProduct();
      prisma.product.findUnique.mockResolvedValue(product);
      prisma.userFavorite.findUnique.mockResolvedValue({ id: 'existing-fav' });

      await expect(service.addFavorite('user-123', 'product-123')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('removeFavorite', () => {
    it('should remove product from favorites', async () => {
      prisma.userFavorite.findUnique.mockResolvedValue({ id: 'fav-1' });
      prisma.userFavorite.delete.mockResolvedValue({});

      await service.removeFavorite('user-123', 'product-123');

      expect(prisma.userFavorite.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if favorite not found', async () => {
      prisma.userFavorite.findUnique.mockResolvedValue(null);

      await expect(service.removeFavorite('user-123', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('myFavorites', () => {
    it('should return user favorites with product details', async () => {
      const favorites = [
        {
          id: 'fav-1',
          createdAt: new Date(),
          product: {
            id: 'product-123',
            name: 'Test Product',
            description: 'Test',
            price: 100,
            currency: 'TRY',
            category: { id: 'cat-1', name: 'Electronics' },
            images: [{ url: 'http://example.com/img.jpg' }],
          },
        },
      ];
      prisma.userFavorite.findMany.mockResolvedValue(favorites);

      const result = await service.myFavorites('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].product.name).toBe('Test Product');
      expect(result[0].product.image).toBe('http://example.com/img.jpg');
    });

    it('should return empty array when no favorites', async () => {
      prisma.userFavorite.findMany.mockResolvedValue([]);

      const result = await service.myFavorites('user-123');

      expect(result).toHaveLength(0);
    });
  });

  // ── Profile ──

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const user = mockUser();
      prisma.user.findUnique.mockResolvedValue(user);
      prisma.user.update.mockResolvedValue({
        id: user.id,
        email: user.email,
        firstName: 'Updated',
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        avatarUrl: null,
      });

      const result = await service.updateProfile('user-123', { firstName: 'Updated' });

      expect(result.firstName).toBe('Updated');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { firstName: 'Updated' },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.updateProfile('nonexistent', { firstName: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── Devices ──

  describe('registerDevice', () => {
    it('should create new device for existing customer', async () => {
      const customer = { id: 'customer-123', userId: 'user-123' };
      prisma.customer.findUnique.mockResolvedValue(customer);
      prisma.customerDevice.findFirst.mockResolvedValue(null);
      prisma.customerDevice.create.mockResolvedValue({ id: 'device-1' });

      const result = await service.registerDevice('user-123', {
        deviceType: 'iOS',
        token: 'push-token-123',
      });

      expect(result).toBeDefined();
      expect(prisma.customerDevice.create).toHaveBeenCalled();
    });

    it('should create customer if not exists', async () => {
      prisma.customer.findUnique.mockResolvedValue(null);
      prisma.customer.create.mockResolvedValue({ id: 'customer-new', userId: 'user-123' });
      prisma.customerDevice.findFirst.mockResolvedValue(null);
      prisma.customerDevice.create.mockResolvedValue({ id: 'device-1' });

      await service.registerDevice('user-123', {
        deviceType: 'Android',
        token: 'push-token-456',
      });

      expect(prisma.customer.create).toHaveBeenCalledWith({ data: { userId: 'user-123' } });
    });

    it('should update existing device if token matches', async () => {
      const customer = { id: 'customer-123', userId: 'user-123' };
      const existingDevice = { id: 'device-existing', token: 'push-token-123' };
      prisma.customer.findUnique.mockResolvedValue(customer);
      prisma.customerDevice.findFirst.mockResolvedValue(existingDevice);
      prisma.customerDevice.update.mockResolvedValue({ ...existingDevice, isActive: true });

      const result = await service.registerDevice('user-123', {
        deviceType: 'iOS',
        token: 'push-token-123',
      });

      expect(prisma.customerDevice.update).toHaveBeenCalledWith({
        where: { id: 'device-existing' },
        data: { isActive: true, deviceType: 'iOS' },
      });
    });
  });

  // ── Promotions ──

  describe('listPromotions', () => {
    it('should return active promotions within date range', async () => {
      const promotions = [
        {
          id: 'promo-1',
          title: 'Summer Sale',
          description: '20% off',
          discountType: 'PERCENTAGE',
          discountValue: 20,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
        },
      ];
      prisma.promotion.findMany.mockResolvedValue(promotions);

      const result = await service.listPromotions();

      expect(result).toEqual(promotions);
      expect(prisma.promotion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        }),
      );
    });
  });
});
