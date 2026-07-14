import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Loyalty')
@Controller('loyalty')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LoyaltyController {
  constructor(private svc: LoyaltyService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Puan bakiyesi' })
  getBalance(@CurrentUser() user: any) { return this.svc.getBalance(user.sub); }

  @Post('earn')
  @ApiOperation({ summary: 'Puan kazan' })
  addPoints(@CurrentUser() user: any, @Body() body: { points: number; reference?: string }) {
    return this.svc.addPoints(user.sub, body.points, body.reference);
  }

  @Post('redeem')
  @ApiOperation({ summary: 'Puan harca' })
  usePoints(@CurrentUser() user: any, @Body() body: { points: number; reference?: string }) {
    return this.svc.usePoints(user.sub, body.points, body.reference);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'İşlem geçmişi' })
  getTransactions(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) { return this.svc.getTransactions(user.sub, page ? +page : 1, limit ? +limit : 20); }

  @Post('update-tier')
  @ApiOperation({ summary: 'Seviyeyi güncelle' })
  updateTier(@CurrentUser() user: any) { return this.svc.updateTier(user.sub); }

  @Get('rewards')
  @Public()
  @ApiOperation({ summary: 'Ödülleri listele' })
  findAllRewards() { return this.svc.findAllRewards(); }

  @Post('rewards')
  createReward(@Body() body: any) { return this.svc.createReward(body); }

  @Post('rewards/:rewardId/redeem')
  @ApiOperation({ summary: 'Ödül redeemed' })
  redeemReward(@CurrentUser() user: any, @Param('rewardId') rewardId: string) {
    return this.svc.redeemReward(user.sub, rewardId);
  }
}
