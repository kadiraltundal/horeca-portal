import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { QuoteItem } from '../quotes/entities/quote-item.entity';

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(QuoteItem)
    private quoteItemRepository: Repository<QuoteItem>,
  ) {}

  async getSimilarProducts(productId: string, limit: number = 5): Promise<Product[]> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: { category: true },
    });

    if (!product) {
      return [];
    }

    // Get products from the same category
    return this.productRepository.find({
      where: {
        category: { id: product.category?.id },
      },
      relations: { images: true, category: true },
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async getPopularProducts(limit: number = 10): Promise<Product[]> {
    // Get products that appear most in quotes
    const popularProductIds = await this.quoteItemRepository
      .createQueryBuilder('quoteItem')
      .select('quoteItem.productId', 'productId')
      .addSelect('COUNT(quoteItem.id)', 'count')
      .groupBy('quoteItem.productId')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    if (popularProductIds.length === 0) {
      // Fallback: return latest products
      return this.productRepository.find({
        relations: { images: true, category: true },
        take: limit,
        order: { createdAt: 'DESC' },
      });
    }

    const ids = popularProductIds.map((item: any) => item.productId);
    return this.productRepository.findBy({ id: In(ids) });
  }

  async getPersonalizedRecommendations(userId: string, limit: number = 10): Promise<Product[]> {
    // Get products from user's quote history
    const userProductIds = await this.quoteItemRepository
      .createQueryBuilder('quoteItem')
      .innerJoin('quoteItem.quote', 'quote')
      .where('quote.userId = :userId', { userId })
      .select('quoteItem.productId', 'productId')
      .groupBy('quoteItem.productId')
      .getRawMany();

    if (userProductIds.length === 0) {
      // Fallback: return popular products
      return this.getPopularProducts(limit);
    }

    // Get categories from user's products
    const userProducts = await this.productRepository.findBy({
      id: In(userProductIds.map((item: any) => item.productId)),
    });

    const categoryIds = [...new Set(userProducts.map((p: Product) => p.categoryId).filter(Boolean))];

    if (categoryIds.length === 0) {
      return this.getPopularProducts(limit);
    }

    // Recommend products from same categories
    return this.productRepository.find({
      where: {
        category: { id: In(categoryIds as string[]) },
      },
      relations: { images: true, category: true },
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }
}
