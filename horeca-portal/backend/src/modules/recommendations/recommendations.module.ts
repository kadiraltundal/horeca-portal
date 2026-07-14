import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { Product } from '../products/entities/product.entity';
import { QuoteItem } from '../quotes/entities/quote-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, QuoteItem])],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
