import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WarehouseManagementService } from './warehouse-management.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Warehouse Management')
@Controller('warehouse-management')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WarehouseManagementController {
  constructor(private warehouseService: WarehouseManagementService) {}

  @Get()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Depoları listele' })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  async findAll(@Query('companyId') companyId?: string) {
    return this.warehouseService.findAll(companyId);
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Depo detayı' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.warehouseService.findOne(id);
  }

  @Get(':id/zones')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Bölge listesi' })
  async findZones(@Param('id', ParseUUIDPipe) id: string) {
    return this.warehouseService.findZones(id);
  }

  @Post(':id/zones')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Yeni bölge oluştur' })
  async createZone(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateZoneDto,
  ) {
    return this.warehouseService.createZone(id, dto);
  }

  @Get(':id/stock')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Depo stok bilgisi' })
  async findStock(@Param('id', ParseUUIDPipe) id: string) {
    return this.warehouseService.findStock(id);
  }

  @Post(':id/transfer')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Stok transferi başlat' })
  @ApiResponse({ status: 201, description: 'Transfer başarıyla oluşturuldu' })
  @ApiResponse({ status: 400, description: 'Yetersiz stok veya geçersiz hedef depo' })
  async createTransfer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTransferDto,
  ) {
    return this.warehouseService.createTransfer(id, dto);
  }

  @Get(':id/transfers')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Transfer geçmişi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findTransfers(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.warehouseService.findTransfers(id, page ? +page : 1, limit ? +limit : 20);
  }

  @Get(':id/tasks')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Görev listesi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findTasks(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.warehouseService.findTasks(id, page ? +page : 1, limit ? +limit : 20);
  }

  @Post(':id/tasks')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Yeni görev oluştur' })
  async createTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.warehouseService.createTask(id, dto);
  }

  @Put('tasks/:taskId')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Görev durumunu güncelle' })
  @ApiQuery({ name: 'status', required: true, type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  async updateTaskStatus(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() body: { status: string; completedAt?: string },
  ) {
    return this.warehouseService.updateTaskStatus(taskId, body.status, body.completedAt);
  }
}
