import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Suppliers')
@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Get()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Tedarikçi listesi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.suppliersService.findAll(page ? +page : 1, limit ? +limit : 20, search);
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Tedarikçi detayı' })
  async findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Tedarikçi oluştur' })
  @ApiResponse({ status: 201, description: 'Tedarikçi başarıyla oluşturuldu' })
  async create(@Body() data: CreateSupplierDto) {
    return this.suppliersService.create(data);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Tedarikçi güncelle' })
  async update(@Param('id') id: string, @Body() data: UpdateSupplierDto) {
    return this.suppliersService.update(id, data);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Tedarikçi sil' })
  async remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }

  @Get(':id/stats')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Tedarikçi istatistikleri' })
  async getStats(@Param('id') id: string) {
    return this.suppliersService.getSupplierStats(id);
  }
}
