import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get('similar/:productId')
  async getSimilarProducts(
    @Param('productId') productId: string,
    @Query('limit') limit?: number,
  ) {
    return this.recommendationsService.getSimilarProducts(productId, limit || 5);
  }

  @Get('popular')
  async getPopularProducts(@Query('limit') limit?: number) {
    return this.recommendationsService.getPopularProducts(limit || 10);
  }

  @Get('personalized')
  async getPersonalizedRecommendations(@Request() req: any, @Query('limit') limit?: number) {
    return this.recommendationsService.getPersonalizedRecommendations(req.user.id, limit || 10);
  }
}
