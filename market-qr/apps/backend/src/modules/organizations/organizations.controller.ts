import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private svc: OrganizationsService) {}

  // Company
  @Get('companies')
  @Public()
  @ApiOperation({ summary: 'Firmaları listele' })
  findAllCompanies() { return this.svc.findAllCompanies(); }

  @Get('companies/:id')
  @Public()
  @ApiOperation({ summary: 'Firma detayı' })
  findCompany(@Param('id') id: string) { return this.svc.findCompany(id); }

  @Post('companies')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Firma oluştur' })
  createCompany(@Body() body: any) { return this.svc.createCompany(body); }

  @Put('companies/:id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Firma güncelle' })
  updateCompany(@Param('id') id: string, @Body() body: any) { return this.svc.updateCompany(id, body); }

  // Region
  @Get('regions')
  @Public()
  @ApiOperation({ summary: 'Bölgeleri listele' })
  findAllRegions(@Query('companyId') companyId?: string) { return this.svc.findAllRegions(companyId); }

  @Post('regions')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN')
  @ApiOperation({ summary: 'Bölge oluştur' })
  createRegion(@Body() body: any) { return this.svc.createRegion(body); }

  @Put('regions/:id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN')
  @ApiOperation({ summary: 'Bölge güncelle' })
  updateRegion(@Param('id') id: string, @Body() body: any) { return this.svc.updateRegion(id, body); }

  @Delete('regions/:id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Bölge sil' })
  removeRegion(@Param('id') id: string) { return this.svc.removeRegion(id); }

  // Warehouse
  @Get('warehouses')
  @Public()
  @ApiOperation({ summary: 'Depoları listele' })
  findAllWarehouses(@Query('companyId') companyId?: string) { return this.svc.findAllWarehouses(companyId); }

  @Get('warehouses/:id')
  @Public()
  @ApiOperation({ summary: 'Depo detayı' })
  findWarehouse(@Param('id') id: string) { return this.svc.findWarehouse(id); }

  @Post('warehouses')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN')
  @ApiOperation({ summary: 'Depo oluştur' })
  createWarehouse(@Body() body: any) { return this.svc.createWarehouse(body); }

  @Put('warehouses/:id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN')
  @ApiOperation({ summary: 'Depo güncelle' })
  updateWarehouse(@Param('id') id: string, @Body() body: any) { return this.svc.updateWarehouse(id, body); }

  @Delete('warehouses/:id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Depo sil' })
  removeWarehouse(@Param('id') id: string) { return this.svc.removeWarehouse(id); }
}
