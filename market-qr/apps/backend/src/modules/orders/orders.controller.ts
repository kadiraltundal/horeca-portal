import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards, ParseUUIDPipe, Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get(':storeId')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Sipariş listesi' })
  findAll(
    @Param('storeId') storeId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.ordersService.findAll(storeId, page ? +page : 1, limit ? +limit : 20, status);
  }

  @Get('detail/:id')
  @ApiOperation({ summary: 'Sipariş detayı' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Get('stats/:storeId')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Sipariş istatistikleri' })
  getStats(@Param('storeId') storeId: string) {
    return this.ordersService.getStats(storeId);
  }

  @Post('calculate')
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'Sepet toplamını hesapla (sipariş oluşturmadan)' })
  calculate(@Body() body: { storeId: string; items: Array<{ productId: string; quantity: number }>; couponCode?: string }) {
    return this.ordersService.calculate(body.storeId, body.items, body.couponCode);
  }

  @Post()
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'Yeni sipariş oluştur' })
  create(
    @CurrentUser() user: any,
    @Body() body: {
      storeId: string;
      paymentMethod: string;
      items: Array<{ productId: string; quantity: number }>;
      couponCode?: string;
    },
  ) {
    return this.ordersService.create({
      userId: user.id,
      storeId: body.storeId,
      paymentMethod: body.paymentMethod,
      items: body.items,
      couponCode: body.couponCode,
    });
  }

  @Put(':id/status')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Sipariş durumunu güncelle' })
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }

  @Get(':id/receipt')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Fiş HTML\'i oluştur' })
  getReceipt(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    return this.ordersService.getReceipt(id, res);
  }
}
