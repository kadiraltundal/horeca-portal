import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SchedulerService } from './scheduler.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Scheduler')
@Controller('scheduler')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SchedulerController {
  constructor(private schedulerService: SchedulerService) {}

  @Get('status')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Zamanlayıcı durumu' })
  async getStatus() {
    return this.schedulerService.getSchedulerStatus();
  }

  @Post('run')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Tüm zamanlanmış görevleri çalıştır' })
  @ApiResponse({ status: 200, description: 'Görevler başarıyla çalıştırıldı' })
  async runAll() {
    return this.schedulerService.runAllTasks();
  }

  @Post('close-expired-promotions')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Süresi dolmuş kampanyaları kapat' })
  async closeExpiredPromotions() {
    return this.schedulerService.closeExpiredPromotions();
  }

  @Post('mark-expiring-products')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'SKT yaklaşıyor ürünleri işaretle' })
  async markExpiringProducts() {
    return this.schedulerService.markExpiringProducts();
  }

  @Post('cleanup-expired-sessions')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Süresi dolmuş oturumları temizle' })
  async cleanupExpiredSessions() {
    return this.schedulerService.cleanupExpiredSessions();
  }
}
