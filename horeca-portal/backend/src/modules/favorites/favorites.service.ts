import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
    private productsService: ProductsService,
  ) {}

  async addToUser(userId: string, productId: string): Promise<Favorite> {
    // Check if product exists
    await this.productsService.findOne(productId);

    // Check if already favorited
    const existing = await this.favoritesRepository.findOne({
      where: { userId, productId },
    });

    if (existing) {
      throw new ConflictException('Product already in favorites');
    }

    const favorite = this.favoritesRepository.create({
      userId,
      productId,
    });

    return this.favoritesRepository.save(favorite);
  }

  async findByUser(userId: string): Promise<Favorite[]> {
    return this.favoritesRepository.find({
      where: { userId },
      relations: {
        product: {
          images: true,
          pricing: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async removeFromUser(userId: string, productId: string): Promise<void> {
    const favorite = await this.favoritesRepository.findOne({
      where: { userId, productId },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.favoritesRepository.remove(favorite);
  }

  async isFavorite(userId: string, productId: string): Promise<boolean> {
    const favorite = await this.favoritesRepository.findOne({
      where: { userId, productId },
    });
    return !!favorite;
  }

  async getStats() {
    const totalFavorites = await this.favoritesRepository.count();
    const uniqueUsers = await this.favoritesRepository
      .createQueryBuilder('fav')
      .select('COUNT(DISTINCT fav.user_id)', 'count')
      .getRawOne();

    return {
      totalFavorites,
      uniqueUsers: parseInt(uniqueUsers.count, 10),
    };
  }
}