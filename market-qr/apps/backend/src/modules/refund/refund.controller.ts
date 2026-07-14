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
import { RefundService } from './refund.service';
import { CreateRefundDto } from './dto/create-refund.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Refunds')
@Controller('refunds')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RefundController {
  constructor(private refundService: RefundService) {}

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
    return this.refundService.findAll(storeId, page ? +page : 1, limit ? +limit : 20, status);
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'İade detayı' })
  async findOne(@Param('id') id: string) {
    return this.refundService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'İade oluştur' })
  @ApiResponse({ status: 201, description: 'İade başarıyla oluşturuldu' })
  async create(@Body() data: CreateRefundDto, @Request() req: any) {
    return this.refundService.create(data, req.user.id);
  }

  @Put(':id/status')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'İade durumunu güncelle' })
  async updateStatus(@Param('id') id: string, @Body('status') status: string, @Request() req: any) {
    return this.refundService.updateStatus(id, status, req.user.id);
  }
}
