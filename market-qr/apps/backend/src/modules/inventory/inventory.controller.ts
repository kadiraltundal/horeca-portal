import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get(':storeId')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Mağaza stok listesi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Param('storeId') storeId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventoryService.findAll(storeId, page ? +page : 1, limit ? +limit : 20);
  }

  @Get('alerts/:storeId')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Düşük stok uyarıları' })
  async getAlerts(@Param('storeId') storeId: string) {
    return this.inventoryService.getAlerts(storeId);
  }

  @Put(':storeId/:productId')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Stok güncelle' })
  async updateStock(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
    @Body() body: {
      stockQuantity?: number;
      shelfNumber?: string;
      minStockThreshold?: number;
    },
  ) {
    return this.inventoryService.updateStock(storeId, productId, body);
  }

  @Post('bulk-update')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Toplu stok güncelleme (Excel import)' })
  async bulkUpdate(
    @Body() body: {
      storeId: string;
      items: Array<{
        productId: string;
        stockQuantity: number;
        shelfNumber?: string;
      }>;
    },
  ) {
    return this.inventoryService.bulkUpdate(body.storeId, body.items);
  }
}
