import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SalesReportQueryDto } from './dto/sales-report-query.dto';
import { GenerateReportDto, ScheduleReportDto } from './dto/generate-report.dto';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('sales')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Satış raporu' })
  getSalesReport(@Query() query: SalesReportQueryDto) {
    return this.reportsService.getSalesReport(query);
  }

  @Get('inventory')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Stok raporu' })
  getInventoryReport(@Query('storeId') storeId?: string) {
    return this.reportsService.getInventoryReport(storeId);
  }

  @Get('financial')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Finansal rapor' })
  getFinancialReport(
    @Query('storeId') storeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getFinancialReport(storeId, startDate, endDate);
  }

  @Get('customer')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Müşteri analitikleri' })
  getCustomerAnalytics(@Query('storeId') storeId?: string) {
    return this.reportsService.getCustomerAnalytics(storeId);
  }

  @Get('product-performance')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Ürün performans raporu' })
  getProductPerformance(@Query('storeId') storeId?: string) {
    return this.reportsService.getProductPerformance(storeId);
  }

  @Get('supplier')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Tedarikçi analitikleri' })
  getSupplierAnalytics() {
    return this.reportsService.getSupplierAnalytics();
  }

  @Post('generate')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Rapor oluştur (PDF/Excel)' })
  generateReport(@CurrentUser() user: any, @Body() dto: GenerateReportDto) {
    return this.reportsService.generateReport(dto, user.id);
  }

  @Get('templates')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Rapor şablonları' })
  getTemplates() {
    return this.reportsService.getTemplates();
  }

  @Post('schedule')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Rapor zamanlama' })
  scheduleReport(@CurrentUser() user: any, @Body() dto: ScheduleReportDto) {
    return this.reportsService.scheduleReport(dto, user.id);
  }
}
