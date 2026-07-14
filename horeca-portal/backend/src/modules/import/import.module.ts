import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';
import { ProductAttribute } from '../products/entities/product-attribute.entity';
import { Category } from '../categories/entities/category.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Pricing } from '../pricing/entities/pricing.entity';
import { PricingTier } from '../pricing/entities/pricing-tier.entity';
import { PricingModule } from '../pricing/pricing.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductImage,
      ProductAttribute,
      Category,
      Brand,
      Pricing,
      PricingTier,
    ]),
    PricingModule,
    AuthModule,
  ],
  controllers: [ImportController],
  providers: [ImportService],
  exports: [ImportService],
})
export class ImportModule {}
