import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
import { NotFoundException } from '@nestjs/common';
import { CacheService } from '../../common/services/cache.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProduct = {
    id: 'test-uuid',
    sku: 'DET-001',
    nameUz: 'Premium Deterjan',
    nameRu: 'Премиум Детергент',
    unit: 'piece',
    minQuantity: 1,
    stockStatus: 'in_stock',
    isActive: true,
    category: { id: 'cat-uuid', nameUz: 'Kimyasal' },
    brand: { id: 'brand-uuid', name: 'Kalsan' },
    images: [],
    pricing: [{ sellingPrice: 2.5 }],
  };

  const mockRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    })),
  });

  const mockCacheService = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: mockRepository() },
        { provide: getRepositoryToken(ProductImage), useValue: mockRepository() },
        { provide: getRepositoryToken(ProductAttribute), useValue: mockRepository() },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a product when found', async () => {
      const repo = {
        findOne: jest.fn().mockResolvedValue(mockProduct),
      };
      (service as any).productsRepository = repo;

      const result = await service.findOne('test-uuid');
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      const repo = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      (service as any).productsRepository = repo;

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStats', () => {
    it('should return product statistics', async () => {
      const repo = {
        count: jest.fn()
          .mockResolvedValueOnce(100)
          .mockResolvedValueOnce(90)
          .mockResolvedValueOnce(10),
      };
      (service as any).productsRepository = repo;

      const result = await service.getStats();
      expect(result).toEqual({
        totalProducts: 100,
        activeProducts: 90,
        outOfStock: 10,
      });
    });
  });
});
