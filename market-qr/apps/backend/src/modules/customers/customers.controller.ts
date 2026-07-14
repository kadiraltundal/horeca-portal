import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private svc: CustomersService) {}

  @Get()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Müşterileri listele' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.findAll(page ? +page : 1, limit ? +limit : 20);
  }

  @Get('me')
  @ApiOperation({ summary: 'Kendi profilimi getir' })
  getMe(@CurrentUser() user: any) { return this.svc.findOne(user.sub); }

  @Get(':userId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Müşteri detayı' })
  findOne(@Param('userId') userId: string) { return this.svc.findOne(userId); }

  @Post('me/addresses')
  @ApiOperation({ summary: 'Adres ekle' })
  addAddress(@CurrentUser() user: any, @Body() body: any) { return this.svc.addAddress(user.sub, body); }

  @Put('addresses/:id')
  @ApiOperation({ summary: 'Adres güncelle' })
  updateAddress(@Param('id') id: string, @Body() body: any) { return this.svc.updateAddress(id, body); }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Adres sil' })
  removeAddress(@Param('id') id: string) { return this.svc.removeAddress(id); }

  @Post('me/devices')
  @ApiOperation({ summary: 'Cihaz ekle' })
  addDevice(@CurrentUser() user: any, @Body() body: any) { return this.svc.addDevice(user.sub, body); }

  @Delete('devices/:id')
  @ApiOperation({ summary: 'Cihaz sil' })
  removeDevice(@Param('id') id: string) { return this.svc.removeDevice(id); }

  @Get('me/orders')
  @ApiOperation({ summary: 'Siparişlerim' })
  getMyOrders(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) { return this.svc.getOrders(user.sub, page ? +page : 1, limit ? +limit : 20); }
}
