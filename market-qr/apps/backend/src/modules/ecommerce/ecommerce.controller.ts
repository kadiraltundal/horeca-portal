import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { EcommerceService } from './ecommerce.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { SyncProductsDto } from './dto/sync-products.dto';

@ApiTags('E-Commerce')
@Controller('ecommerce')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EcommerceController {
  constructor(private readonly ecommerceService: EcommerceService) {}

  // ─── Platforms ──────────────────────────────────────────────

  @Get('platforms')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'List e-commerce platforms' })
  async listPlatforms() {
    return this.ecommerceService.listPlatforms();
  }

  @Post('platforms')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Add a new e-commerce platform' })
  @ApiResponse({ status: 201, description: 'Platform created' })
  async createPlatform(@Body() dto: CreatePlatformDto) {
    return this.ecommerceService.createPlatform(dto);
  }

  @Put('platforms/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update e-commerce platform' })
  async updatePlatform(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreatePlatformDto>,
  ) {
    return this.ecommerceService.updatePlatform(id, dto);
  }

  @Post('platforms/:id/connect')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Connect to an e-commerce platform' })
  async connectPlatform(@Param('id', ParseUUIDPipe) id: string) {
    return this.ecommerceService.connectPlatform(id);
  }

  // ─── Products ───────────────────────────────────────────────

  @Get('products')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'List e-commerce products' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async listProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.ecommerceService.listProducts(
      page ? +page : 1,
      limit ? +limit : 20,
      search,
    );
  }

  @Post('products/sync')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Sync products to an e-commerce platform' })
  @ApiResponse({ status: 200, description: 'Sync completed' })
  async syncProducts(@Body() dto: SyncProductsDto) {
    return this.ecommerceService.syncProducts(dto);
  }

  // ─── Orders ─────────────────────────────────────────────────

  @Get('orders')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'List platform orders' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'platformId', required: false })
  @ApiQuery({ name: 'status', required: false })
  async listOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('platformId') platformId?: string,
    @Query('status') status?: string,
  ) {
    return this.ecommerceService.listOrders(
      page ? +page : 1,
      limit ? +limit : 20,
      platformId,
      status,
    );
  }

  @Put('orders/:id/status')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Update order status' })
  async updateOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ) {
    return this.ecommerceService.updateOrderStatus(id, status);
  }

  // ─── Sync Logs ──────────────────────────────────────────────

  @Get('sync-logs')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List sync logs' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'platformId', required: false })
  async listSyncLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('platformId') platformId?: string,
  ) {
    return this.ecommerceService.listSyncLogs(
      page ? +page : 1,
      limit ? +limit : 20,
      platformId,
    );
  }

  // ─── Webhook (Public) ───────────────────────────────────────

  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Webhook endpoint for platform notifications (public)' })
  @ApiResponse({ status: 200, description: 'Webhook received' })
  async handleWebhook(@Body() payload: Record<string, unknown>) {
    return this.ecommerceService.handleWebhook(payload);
  }
}
