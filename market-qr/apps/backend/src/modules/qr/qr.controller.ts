import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QrService } from './qr.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('QR')
@Controller('qr')
export class QrController {
  constructor(private qrService: QrService) {}

  @Post('generate/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'QR kod üret' })
  async generate(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body('storeId') storeId: string,
  ) {
    return this.qrService.generate(productId, storeId);
  }

  @Post('generate-all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tüm ürünlere QR kod üret' })
  async generateAll(@Body('storeId') storeId: string) {
    return this.qrService.generateAll(storeId);
  }

  @Get('bulk-export/:storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toplu QR PDF export' })
  async bulkExport(@Param('storeId') storeId: string) {
    return this.qrService.bulkExport(storeId);
  }
}
