import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { CategoriesService } from '../categories/categories.service';
import { BrandsService } from '../brands/brands.service';
import { QuotesService } from '../quotes/quotes.service';
import { CartService } from '../cart/cart.service';
import { FavoritesService } from '../favorites/favorites.service';

@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private brandsService: BrandsService,
    private quotesService: QuotesService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
  ) {}

  async getDashboard() {
    const [userStats, productStats, categoryStats, brandStats, quoteStats, cartStats, favoriteStats] =
      await Promise.all([
        this.usersService.getStats(),
        this.productsService.getStats(),
        this.categoriesService.getStats(),
        this.brandsService.getStats(),
        this.quotesService.getStats(),
        this.cartService.getStats(),
        this.favoritesService.getStats(),
      ]);

    return {
      users: userStats,
      products: productStats,
      categories: categoryStats,
      brands: brandStats,
      quotes: quoteStats,
      cart: cartStats,
      favorites: favoriteStats,
    };
  }

  async getRecentQuotes(limit: number = 10) {
    const quotes = await this.quotesService.findAll();
    return quotes.slice(0, limit);
  }

  async getPopularProducts(limit: number = 10) {
    // This would typically involve aggregation
    // For now, return recent products
    const result = await this.productsService.findAll({ limit });
    return result.items;
  }
}