import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('quotes/recent')
  getRecentQuotes(@Query('limit') limit?: number) {
    return this.adminService.getRecentQuotes(limit);
  }

  @Get('products/popular')
  getPopularProducts(@Query('limit') limit?: number) {
    return this.adminService.getPopularProducts(limit);
  }
}