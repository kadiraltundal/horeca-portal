import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SupplierPortalService } from './supplier-portal.service';
import { SupplierPortalAuthGuard } from './supplier-portal.guard';
import { SupplierLoginDto } from './dto/supplier-login.dto';
import { UpdateSupplierPriceDto } from './dto/update-supplier-price.dto';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('Supplier Portal')
@Controller('supplier-portal')
export class SupplierPortalController {
  constructor(private supplierPortalService: SupplierPortalService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tedarikçi portalı girişi' })
  @ApiResponse({ status: 200, description: 'Giriş başarılı' })
  @ApiResponse({ status: 401, description: 'Geçersiz credentials' })
  async login(@Body() dto: SupplierLoginDto) {
    return this.supplierPortalService.login(dto);
  }

  @UseGuards(SupplierPortalAuthGuard)
  @Get('dashboard')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dashboard özeti' })
  @ApiResponse({ status: 200, description: 'Dashboard verisi' })
  async getDashboard(@Request() req: any) {
    return this.supplierPortalService.getDashboard(req.user.id);
  }

  @UseGuards(SupplierPortalAuthGuard)
  @Get('products')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tedarikçi ürün listesi' })
  @ApiResponse({ status: 200, description: 'Ürün listesi' })
  async getProducts(@Request() req: any) {
    return this.supplierPortalService.getProducts(req.user.id);
  }

  @UseGuards(SupplierPortalAuthGuard)
  @Put('products/:id/price')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ürün fiyat güncelleme' })
  @ApiResponse({ status: 200, description: 'Fiyat güncellendi' })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  async updateProductPrice(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateSupplierPriceDto,
  ) {
    return this.supplierPortalService.updateProductPrice(req.user.id, id, dto);
  }

  @UseGuards(SupplierPortalAuthGuard)
  @Get('orders')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sipariş talepleri' })
  @ApiResponse({ status: 200, description: 'Sipariş listesi' })
  async getOrders(@Request() req: any) {
    return this.supplierPortalService.getOrders(req.user.id);
  }

  @UseGuards(SupplierPortalAuthGuard)
  @Put('orders/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sipariş durumu güncelleme' })
  @ApiResponse({ status: 200, description: 'Durum güncellendi' })
  @ApiResponse({ status: 404, description: 'Sipariş bulunamadı' })
  async updateOrderStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.supplierPortalService.updateOrderStatus(req.user.id, id, status);
  }

  @UseGuards(SupplierPortalAuthGuard)
  @Get('messages')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mesaj listesi' })
  @ApiResponse({ status: 200, description: 'Mesaj listesi' })
  async getMessages(@Request() req: any) {
    return this.supplierPortalService.getMessages(req.user.id);
  }

  @UseGuards(SupplierPortalAuthGuard)
  @Post('messages')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Mesaj gönderme' })
  @ApiResponse({ status: 201, description: 'Mesaj gönderildi' })
  async sendMessage(@Request() req: any, @Body() dto: SendMessageDto) {
    return this.supplierPortalService.sendMessage(req.user.id, dto);
  }

  @UseGuards(SupplierPortalAuthGuard)
  @Get('notifications')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bildirimler' })
  @ApiResponse({ status: 200, description: 'Bildirim listesi' })
  async getNotifications(@Request() req: any) {
    return this.supplierPortalService.getNotifications(req.user.id);
  }
}
