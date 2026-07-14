import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchHistory } from '../users/entities/search-history.entity';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(SearchHistory)
    private searchHistoryRepository: Repository<SearchHistory>,
    private usersService: UsersService,
    private productsService: ProductsService,
  ) {}

  async search(query: string, userId?: string, limit: number = 20) {
    // Save search history if user is authenticated
    if (userId && query) {
      await this.saveSearchHistory(userId, query);
    }

    // Perform search
    const results = await this.productsService.search(query, limit);

    return {
      query,
      results,
      total: results.length,
    };
  }

  async autocomplete(query: string, limit: number = 10) {
    return this.productsService.autocomplete(query, limit);
  }

  async getSearchHistory(userId: string, limit: number = 10) {
    const history = await this.searchHistoryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return history.map((item) => ({
      id: item.id,
      query: item.query,
      createdAt: item.createdAt,
    }));
  }

  async getPopularSearches(limit: number = 10) {
    const popularSearches = await this.searchHistoryRepository
      .createQueryBuilder('sh')
      .select('sh.query', 'query')
      .addSelect('COUNT(*)', 'count')
      .where('sh.created_at > :date', {
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      })
      .groupBy('sh.query')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return popularSearches.map((item) => ({
      query: item.query,
      count: parseInt(item.count, 10),
    }));
  }

  async clearSearchHistory(userId: string) {
    await this.searchHistoryRepository.delete({ userId });
  }

  private async saveSearchHistory(userId: string, query: string) {
    // Check if same search exists recently (within 1 hour)
    const recentSearch = await this.searchHistoryRepository.findOne({
      where: {
        userId,
        query,
      },
      order: { createdAt: 'DESC' },
    });

    if (recentSearch) {
      const hoursSinceLastSearch =
        (Date.now() - recentSearch.createdAt.getTime()) / (1000 * 60 * 60);

      // If less than 1 hour, don't save duplicate
      if (hoursSinceLastSearch < 1) {
        return;
      }
    }

    const history = this.searchHistoryRepository.create({
      userId,
      query,
    });

    await this.searchHistoryRepository.save(history);

    // Keep only last 50 searches per user
    const count = await this.searchHistoryRepository.count({
      where: { userId },
    });

    if (count > 50) {
      const oldestSearches = await this.searchHistoryRepository.find({
        where: { userId },
        order: { createdAt: 'ASC' },
        take: count - 50,
      });

      if (oldestSearches.length > 0) {
        await this.searchHistoryRepository.remove(oldestSearches);
      }
    }
  }
}