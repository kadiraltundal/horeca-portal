import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permission.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Permission } from '../../common/types/permission.types';

@Controller('reports')
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @RequirePermissions(Permission.REPORTS_READ)
  async getDashboard() {
    return this.reportsService.getDashboard();
  }

  @Get('sales')
  @RequirePermissions(Permission.REPORTS_READ)
  async getSalesReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getSalesReport(startDate, endDate);
  }

  @Get('products')
  @RequirePermissions(Permission.REPORTS_READ)
  async getProductReport() {
    return this.reportsService.getProductReport();
  }

  @Get('users')
  @RequirePermissions(Permission.REPORTS_READ)
  async getUserReport() {
    return this.reportsService.getUserReport();
  }

  @Get('conversion')
  @RequirePermissions(Permission.REPORTS_READ)
  async getConversionRate() {
    return this.reportsService.getConversionRate();
  }
}
