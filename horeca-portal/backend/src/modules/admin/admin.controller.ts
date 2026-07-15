import { Controller, Get, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permission.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Permission } from '../../common/types/permission.types';

@Controller('admin')
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @RequirePermissions(Permission.REPORTS_READ)
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('quotes/recent')
  @RequirePermissions(Permission.QUOTES_READ)
  getRecentQuotes(@Query('limit') limit?: number) {
    return this.adminService.getRecentQuotes(limit);
  }

  @Get('products/popular')
  @RequirePermissions(Permission.PRODUCTS_READ)
  getPopularProducts(@Query('limit') limit?: number) {
    return this.adminService.getPopularProducts(limit);
  }
}
