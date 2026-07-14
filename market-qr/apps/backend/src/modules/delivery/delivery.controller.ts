import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import { CreateDeliveryOrderDto, CreateDeliveryZoneDto } from './dto/create-delivery.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { TrackDeliveryDto } from './dto/track-delivery.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Delivery')
@Controller('delivery')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @Get('stats/:storeId')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Teslimat istatistikleri' })
  async getStats(@Param('storeId') storeId: string) {
    return this.deliveryService.getStats(storeId);
  }

  @Get('zones/:storeId')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Teslimat bölgeleri listesi' })
  async findAllZones(@Param('storeId') storeId: string) {
    return this.deliveryService.findAllZones(storeId);
  }

  @Post('zones')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Teslimat bölgesi oluştur' })
  @ApiResponse({ status: 201, description: 'Bölge başarıyla oluşturuldu' })
  async createZone(@Body() data: CreateDeliveryZoneDto) {
    return this.deliveryService.createZone(data);
  }

  @Get('orders/:storeId')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Teslimat siparişleri listesi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  async findAllOrders(
    @Param('storeId') storeId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.deliveryService.findAllOrders(storeId, page ? +page : 1, limit ? +limit : 20, status);
  }

  @Get('orders/:id')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Teslimat siparişi detayı' })
  async findOneOrder(@Param('id') id: string) {
    return this.deliveryService.findOneOrder(id);
  }

  @Post('orders')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Teslimat siparişi oluştur' })
  @ApiResponse({ status: 201, description: 'Sipariş başarıyla oluşturuldu' })
  async createOrder(@Body() data: CreateDeliveryOrderDto) {
    return this.deliveryService.createOrder(data);
  }

  @Put('orders/:id/status')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Teslimat siparişi durumunu güncelle' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryStatusDto,
  ) {
    return this.deliveryService.updateOrderStatus(id, dto);
  }

  @Get('orders/:id/tracking')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Teslimat takip geçmişi' })
  async getTracking(@Param('id') id: string) {
    return this.deliveryService.getTracking(id);
  }

  @Post('orders/:id/track')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Teslimat konumu güncelle' })
  @ApiResponse({ status: 201, description: 'Konum başarıyla eklendi' })
  async addTracking(@Param('id') id: string, @Body() dto: TrackDeliveryDto) {
    return this.deliveryService.addTracking(id, dto);
  }
}
