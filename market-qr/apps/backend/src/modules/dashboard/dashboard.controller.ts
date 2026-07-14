import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private svc: DashboardService) {}

  @Get('overview')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Dashboard genel bakış' })
  getOverview(@Query('storeId') storeId?: string) { return this.svc.getOverview(storeId); }

  @Get('top-products')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'En çok tarama alan ürünler' })
  getTopScannedProducts(@Query('storeId') storeId?: string, @Query('limit') limit?: number) {
    return this.svc.getTopScannedProducts(storeId, limit ?? 10);
  }

  @Get('campaign-conversion')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Kampanya dönüşüm oranı' })
  getCampaignConversion(@Query('storeId') storeId?: string) {
    return this.svc.getCampaignConversion(storeId);
  }

  @Get('error-reports')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Hatalı QR raporları' })
  getErrorQrReports() { return this.svc.getErrorQrReports(); }
}
