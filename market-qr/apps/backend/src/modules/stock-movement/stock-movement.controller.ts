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
import { StockMovementService } from './stock-movement.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Stock Movements')
@Controller('stock-movements')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StockMovementController {
  constructor(private stockMovementService: StockMovementService) {}

  @Get(':storeId')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Stok hareket listesi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  async findAll(
    @Param('storeId') storeId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
  ) {
    return this.stockMovementService.findAll(storeId, page ? +page : 1, limit ? +limit : 20, type);
  }

  @Get(':storeId/product/:productId')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Ürüne göre stok hareketleri' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findByProduct(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.stockMovementService.findByProduct(storeId, productId, page ? +page : 1, limit ? +limit : 20);
  }

  @Post()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Stok hareketi oluştur' })
  @ApiResponse({ status: 201, description: 'Stok hareketi başarıyla oluşturuldu' })
  async create(@Body() data: CreateStockMovementDto, @Request() req: any) {
    return this.stockMovementService.create(data, req.user.id);
  }

  @Get(':storeId/stats')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Stok hareket istatistikleri' })
  async getStats(@Param('storeId') storeId: string) {
    return this.stockMovementService.getStats(storeId);
  }
}
