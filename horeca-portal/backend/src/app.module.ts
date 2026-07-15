import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionGuard } from './common/guards/permission.guard';

// Entities
import { User } from './modules/users/entities/user.entity';
import { SearchHistory } from './modules/users/entities/search-history.entity';
import { Product } from './modules/products/entities/product.entity';
import { ProductImage } from './modules/products/entities/product-image.entity';
import { ProductAttribute } from './modules/products/entities/product-attribute.entity';
import { Category } from './modules/categories/entities/category.entity';
import { Brand } from './modules/brands/entities/brand.entity';
import { Pricing } from './modules/pricing/entities/pricing.entity';
import { PricingTier } from './modules/pricing/entities/pricing-tier.entity';
import { Campaign } from './modules/campaigns/entities/campaign.entity';
import { CampaignProduct } from './modules/campaigns/entities/campaign-product.entity';
import { Favorite } from './modules/favorites/entities/favorite.entity';
import { QuoteCart } from './modules/cart/entities/quote-cart.entity';
import { Quote } from './modules/quotes/entities/quote.entity';
import { QuoteItem } from './modules/quotes/entities/quote-item.entity';
import { Notification } from './modules/notifications/entities/notification.entity';
import { Setting } from './modules/settings/entities/setting.entity';
import { Payment } from './modules/payments/entities/payment.entity';
import { Order } from './modules/orders/entities/order.entity';
import { OrderItem } from './modules/orders/entities/order-item.entity';
import { Vendor } from './modules/vendors/entities/vendor.entity';
import { VendorProduct } from './modules/vendors/entities/vendor-product.entity';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { CartModule } from './modules/cart/cart.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SearchModule } from './modules/search/search.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { HealthModule } from './modules/health/health.module';
import { ImportModule } from './modules/import/import.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReportsModule } from './modules/reports/reports.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { EmailModule } from './modules/email/email.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: true,
    }),

    // TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): any => {
        const databaseUrl = configService.get('DATABASE_URL');
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            ssl: { rejectUnauthorized: false },
            entities: [
              User, SearchHistory, Product, ProductImage, ProductAttribute,
              Category, Brand, Pricing, PricingTier, Campaign, CampaignProduct,
              Favorite, QuoteCart, Quote, QuoteItem, Notification, Setting,
              Payment, Order, OrderItem, Vendor, VendorProduct,
            ],
            synchronize: false,
            logging: configService.get('DB_LOGGING', 'false') === 'true',
          };
        }
        return {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get('DB_USERNAME', 'horeca_admin'),
          password: configService.get('DB_PASSWORD', 'horeca_secret_2024'),
          database: configService.get('DB_DATABASE', 'horeca_portal'),
          ssl: configService.get('DB_HOST', 'localhost') !== 'localhost' ? { rejectUnauthorized: false } : false,
          entities: [
            User, SearchHistory, Product, ProductImage, ProductAttribute,
            Category, Brand, Pricing, PricingTier, Campaign, CampaignProduct,
            Favorite, QuoteCart, Quote, QuoteItem, Notification, Setting,
            Payment, Order, OrderItem, Vendor, VendorProduct,
          ],
          synchronize: false,
          logging: configService.get('DB_LOGGING', 'false') === 'true',
        };
      },
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Feature Modules
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    PricingModule,
    CampaignsModule,
    FavoritesModule,
    CartModule,
    QuotesModule,
    NotificationsModule,
    AdminModule,
    SettingsModule,
    SearchModule,
    TelegramModule,
    HealthModule,
    ImportModule,
    PaymentsModule,
    OrdersModule,
    ReportsModule,
    VendorsModule,
    EmailModule,
    RecommendationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}