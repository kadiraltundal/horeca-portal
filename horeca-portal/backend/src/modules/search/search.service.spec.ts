import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SearchHistory } from '../users/entities/search-history.entity';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';

describe('SearchService', () => {
  let service: SearchService;

  const mockSearchHistoryRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    })),
  });

  const mockUsersService = {};

  const mockProductsService = {
    search: jest.fn(),
    autocomplete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: getRepositoryToken(SearchHistory), useValue: mockSearchHistoryRepository() },
        { provide: UsersService, useValue: mockUsersService },
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should return search results', async () => {
      const mockResults = [
        { id: '1', nameUz: 'Deterjan' },
        { id: '2', nameUz: 'Deterjan Premium' },
      ];
      mockProductsService.search.mockResolvedValue(mockResults);

      const result = await service.search('deterjan');

      expect(result).toEqual({
        query: 'deterjan',
        results: mockResults,
        total: 2,
      });
    });
  });

  describe('getPopularSearches', () => {
    it('should return popular searches', async () => {
      const mockPopular = [
        { query: 'deterjan', count: '15' },
        { query: 'havlu', count: '10' },
      ];
      (service as any).searchHistoryRepository = {
        createQueryBuilder: jest.fn(() => ({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          getRawMany: jest.fn().mockResolvedValue(mockPopular),
        })),
      };

      const result = await service.getPopularSearches(10);

      expect(result).toEqual([
        { query: 'deterjan', count: 15 },
        { query: 'havlu', count: 10 },
      ]);
    });
  });
});
