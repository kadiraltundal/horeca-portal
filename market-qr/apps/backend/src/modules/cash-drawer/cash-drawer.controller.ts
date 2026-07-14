import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CashDrawerService } from './cash-drawer.service';
import { OpenCashDrawerDto } from './dto/open-cash-drawer.dto';
import { CloseCashDrawerDto } from './dto/close-cash-drawer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Cash Drawers')
@Controller('cash-drawers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CashDrawerController {
  constructor(private cashDrawerService: CashDrawerService) {}

  @Get(':storeId/open')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Açık kasa durumunu kontrol et' })
  async getOpenDrawer(@Param('storeId') storeId: string, @Request() req: any) {
    return this.cashDrawerService.getOpenDrawer(storeId, req.user.id);
  }

  @Post('open')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Kasa aç' })
  @ApiResponse({ status: 201, description: 'Kasa başarıyla açıldı' })
  async open(@Body() data: OpenCashDrawerDto, @Request() req: any) {
    return this.cashDrawerService.open(data, req.user.id);
  }

  @Post('close')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Kasa kapat' })
  async close(@Body() data: CloseCashDrawerDto) {
    return this.cashDrawerService.close(data);
  }

  @Get(':storeId/history')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Kasa geçmişi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getHistory(
    @Param('storeId') storeId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.cashDrawerService.getDrawerHistory(storeId, page ? +page : 1, limit ? +limit : 20);
  }
}
