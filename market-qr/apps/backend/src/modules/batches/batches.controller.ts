import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BatchesService } from './batches.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Batches')
@Controller('batches')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BatchesController {
  constructor(private svc: BatchesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Partileri listele' })
  findAll(
    @Query('productId') productId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll(productId, warehouseId, page ? +page : 1, limit ? +limit : 20);
  }

  @Get('expiring')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Yaklaşan SKT\'li partiler' })
  getExpiringSoon(@Query('days') days?: string) {
    return this.svc.getExpiringSoon(days ? +days : 30);
  }

  @Get('expired')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Süresi dolmuş partiler' })
  getExpired() { return this.svc.getExpired(); }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Parti detayı' })
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Yeni parti oluştur' })
  create(@Body() body: any) { return this.svc.create(body); }

  @Put(':id')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Parti güncelle' })
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }
}
