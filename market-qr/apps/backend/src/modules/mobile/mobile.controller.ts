import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
  HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MobileService } from './mobile.service';
import { MobileLoginDto } from './dto/mobile-login.dto';
import { MobileRegisterDto } from './dto/mobile-register.dto';
import { MobileOrderDto } from './dto/mobile-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Mobile')
@Controller('mobile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MobileController {
  constructor(private svc: MobileService) {}

  // ── Auth ──

  @Post('auth/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mobil giriş' })
  login(@Body() dto: MobileLoginDto) {
    return this.svc.login(dto);
  }

  @Post('auth/register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Mobil kayıt' })
  register(@Body() dto: MobileRegisterDto) {
    return this.svc.register(dto);
  }

  // ── Products ──

  @Get('products')
  @Public()
  @ApiOperation({ summary: 'Ürün listesi (hafif, görsellerle)' })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  listProducts(
    @Query('storeId') storeId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.svc.listProducts({ storeId, page: +(page || '1'), limit: +(limit || '20'), search, categoryId });
  }

  @Get('products/:id')
  @Public()
  @ApiOperation({ summary: 'Ürün detayı' })
  getProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.getProduct(id);
  }

  // ── Categories ──

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'Kategoriler' })
  listCategories() {
    return this.svc.listCategories();
  }

  // ── Orders ──

  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Sipariş oluştur (adres + notlar)' })
  createOrder(@CurrentUser() user: any, @Body() dto: MobileOrderDto) {
    return this.svc.createOrder(user.sub, dto);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Siparişlerim' })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  myOrders(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.myOrders(user.sub, +(page || '1'), +(limit || '20'));
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Sipariş detayı' })
  getOrder(@CurrentUser() user: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.getOrder(user.sub, id);
  }

  // ── Favorites ──

  @Post('favorites')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Favoriye ekle' })
  addFavorite(@CurrentUser() user: any, @Body('productId') productId: string) {
    return this.svc.addFavorite(user.sub, productId);
  }

  @Delete('favorites/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Favoriden çıkar' })
  removeFavorite(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.svc.removeFavorite(user.sub, productId);
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Favorilerim' })
  myFavorites(@CurrentUser() user: any) {
    return this.svc.myFavorites(user.sub);
  }

  // ── Profile ──

  @Put('profile')
  @ApiOperation({ summary: 'Profil güncelle' })
  updateProfile(
    @CurrentUser() user: any,
    @Body() body: { firstName?: string; lastName?: string; phone?: string },
  ) {
    return this.svc.updateProfile(user.sub, body);
  }

  // ── Devices ──

  @Post('devices')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Push token kaydet' })
  registerDevice(
    @CurrentUser() user: any,
    @Body() body: { deviceType: string; token: string },
  ) {
    return this.svc.registerDevice(user.sub, body);
  }

  // ── Promotions ──

  @Get('promotions')
  @Public()
  @ApiOperation({ summary: 'Aktif kampanyalar' })
  listPromotions() {
    return this.svc.listPromotions();
  }
}
