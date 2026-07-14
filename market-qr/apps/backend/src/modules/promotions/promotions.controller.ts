import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private svc: PromotionsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Kampanyaları listele' })
  findAll(@Query('isActive') isActive?: string) {
    return this.svc.findAll(isActive === 'true' ? true : isActive === 'false' ? false : undefined);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Kampanya detayı' })
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kampanya oluştur' })
  create(@Body() body: any) { return this.svc.create(body); }

  @Put(':id')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) { return this.svc.remove(id); }

  @Put(':id/toggle')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  toggleActive(@Param('id') id: string) { return this.svc.toggleActive(id); }

  // Coupons
  @Get('coupons/all')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  findAllCoupons() { return this.svc.findAllCoupons(); }

  @Post('coupons')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  createCoupon(@Body() body: any) { return this.svc.createCoupon(body); }

  @Post('coupons/validate')
  @Public()
  @ApiOperation({ summary: 'Kupon doğrula' })
  validateCoupon(@Body() body: { code: string; amount: number }) {
    return this.svc.validateCoupon(body.code, body.amount);
  }
}
