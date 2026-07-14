import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ScanService } from './scan.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Scan')
@Controller('scan')
export class ScanController {
  constructor(private svc: ScanService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'QR tarama kaydı' })
  logScan(@Body() body: any) { return this.svc.logScan(body); }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tarama istatistikleri' })
  getStats(@Query('storeId') storeId?: string, @Query('days') days?: number) {
    return this.svc.getScanStats(storeId, days ?? 7);
  }

  @Get('hourly')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Saatlik tarama dağılımı' })
  getHourlyStats(@Query('storeId') storeId?: string, @Query('date') date?: string) {
    return this.svc.getHourlyStats(storeId, date);
  }

  @Get('devices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cihaz istatistikleri' })
  getDeviceStats(@Query('storeId') storeId?: string) { return this.svc.getDeviceStats(storeId); }

  @Get('recent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Son taramalar' })
  getRecentScans(@Query('limit') limit?: number) { return this.svc.getRecentScans(limit ?? 20); }
}
