import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ZReportService } from './z-report.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Z Reports')
@Controller('z-reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ZReportController {
  constructor(private zReportService: ZReportService) {}

  @Post('generate/:storeId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Gün sonu raporu oluştur' })
  @ApiResponse({ status: 201, description: 'Rapor başarıyla oluşturuldu' })
  async generate(@Param('storeId') storeId: string, @Request() req: any) {
    return this.zReportService.generate(storeId, req.user.id);
  }

  @Get(':storeId')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Rapor listesi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Param('storeId') storeId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.zReportService.findAll(storeId, page ? +page : 1, limit ? +limit : 20);
  }

  @Get('detail/:id')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Rapor detayı' })
  async findOne(@Param('id') id: string) {
    return this.zReportService.findOne(id);
  }

  @Get('daily/:storeId')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Günlük özet' })
  @ApiQuery({ name: 'date', required: false, type: String })
  async getDailySummary(
    @Param('storeId') storeId: string,
    @Query('date') date?: string,
  ) {
    return this.zReportService.getDailySummary(storeId, date);
  }
}
