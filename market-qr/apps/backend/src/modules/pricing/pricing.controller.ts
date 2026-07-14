import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Pricing')
@Controller('pricing')
export class PricingController {
  constructor(private svc: PricingService) {}

  @Get('product/:productId')
  @Public()
  @ApiOperation({ summary: 'Ürün fiyatlarını getir' })
  getProductPrice(
    @Param('productId') productId: string,
    @Query('regionId') regionId?: string,
    @Query('customerTier') customerTier?: string,
  ) { return this.svc.getProductPrice(productId, { regionId, customerTier }); }

  @Get('product/:productId/best')
  @Public()
  @ApiOperation({ summary: 'En iyi fiyatı bul' })
  findBestPrice(
    @Param('productId') productId: string,
    @Query('regionId') regionId?: string,
    @Query('customerTier') customerTier?: string,
  ) { return this.svc.findBestPrice(productId, { regionId, customerTier }); }

  @Get()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tüm fiyatları listele' })
  findAll(@Query('productId') productId?: string) { return this.svc.findAll(productId); }

  @Post()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fiyat ekle' })
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
}
