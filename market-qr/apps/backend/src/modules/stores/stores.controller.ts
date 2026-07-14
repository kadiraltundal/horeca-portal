import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Stores')
@Controller('stores')
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Mağazaları listele' })
  async findAll() {
    return this.storesService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Mağaza detayı' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.storesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yeni mağaza oluştur' })
  async create(@Body() body: {
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    workingHours?: string;
  }) {
    return this.storesService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mağaza güncelle' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: Partial<{
      name: string;
      address: string;
      latitude: number;
      longitude: number;
      phone: string;
      workingHours: string;
      isActive: boolean;
    }>,
  ) {
    return this.storesService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mağaza sil' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.storesService.remove(id);
  }
}
