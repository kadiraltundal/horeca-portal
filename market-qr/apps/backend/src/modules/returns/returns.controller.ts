import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnStatusDto } from './dto/update-return-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Returns')
@Controller('returns')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReturnsController {
  constructor(private returnsService: ReturnsService) {}

  @Get('stats/:storeId')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'İade istatistikleri' })
  async getStats(@Param('storeId') storeId: string) {
    return this.returnsService.getStats(storeId);
  }

  @Get(':storeId')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'İade listesi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  async findAll(
    @Param('storeId') storeId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.returnsService.findAll(storeId, page ? +page : 1, limit ? +limit : 20, status);
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'İade detayı' })
  async findOne(@Param('id') id: string) {
    return this.returnsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'İade oluştur' })
  @ApiResponse({ status: 201, description: 'İade başarıyla oluşturuldu' })
  async create(@Body() data: CreateReturnDto, @Request() req: any) {
    return this.returnsService.create(data, req.user.id);
  }

  @Put(':id/status')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'İade durumunu güncelle' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReturnStatusDto,
    @Request() req: any,
  ) {
    return this.returnsService.updateStatus(id, dto, req.user.id);
  }

  @Post(':id/refund')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'İade iade işlemini tamamla' })
  async processRefund(@Param('id') id: string, @Request() req: any) {
    return this.returnsService.processRefund(id, req.user.id);
  }
}
