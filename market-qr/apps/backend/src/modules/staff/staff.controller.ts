import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { CheckInDto, CheckOutDto } from './dto/check-in-out.dto';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  // ===== Shifts =====

  @Get('shifts')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Vardiyaları listele' })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  @ApiQuery({ name: 'date', required: false, type: String })
  findShifts(
    @Query('storeId') storeId?: string,
    @Query('date') date?: string,
  ) {
    return this.staffService.findShifts({ storeId, date });
  }

  @Post('shifts')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Vardiya oluştur' })
  createShift(@Body() data: CreateShiftDto) {
    return this.staffService.createShift(data);
  }

  @Put('shifts/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Vardiyayı güncelle' })
  updateShift(@Param('id') id: string, @Body() data: Partial<CreateShiftDto>) {
    return this.staffService.updateShift(id, data);
  }

  @Delete('shifts/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Vardiyayı sil' })
  deleteShift(@Param('id') id: string) {
    return this.staffService.deleteShift(id);
  }

  // ===== Attendance =====

  @Get('attendance/:storeId')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Devam listesi' })
  findAttendance(@Param('storeId') storeId: string) {
    return this.staffService.findAttendance(storeId);
  }

  @Post('attendance/check-in')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Check-in yap' })
  checkIn(@Body() data: CheckInDto) {
    return this.staffService.checkIn(data);
  }

  @Post('attendance/check-out')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Check-out yap' })
  checkOut(@Body() data: CheckOutDto) {
    return this.staffService.checkOut(data);
  }

  // ===== Performance =====

  @Get('performance')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Performans metriklerini listele' })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'metricType', required: false, type: String })
  @ApiQuery({ name: 'period', required: false, type: String })
  findPerformance(
    @Query('storeId') storeId?: string,
    @Query('userId') userId?: string,
    @Query('metricType') metricType?: string,
    @Query('period') period?: string,
  ) {
    return this.staffService.findPerformance({ storeId, userId, metricType, period });
  }

  @Post('performance')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Performans metriği oluştur' })
  createPerformance(@Body() data: CreatePerformanceDto) {
    return this.staffService.createPerformance(data);
  }
}
