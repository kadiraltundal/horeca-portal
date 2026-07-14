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
import { CustomerServiceService } from './customer-service.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Customer Service')
@Controller('support')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CustomerServiceController {
  constructor(private customerServiceService: CustomerServiceService) {}

  @Get('tickets')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Destek talepleri listesi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'priority', required: false, type: String })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    return this.customerServiceService.findAll(
      page ? +page : 1,
      limit ? +limit : 20,
      status,
      priority,
    );
  }

  @Get('tickets/:id')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Destek talebi detayı' })
  async findOne(@Param('id') id: string) {
    return this.customerServiceService.findOne(id);
  }

  @Post('tickets')
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'Destek talebi oluştur' })
  @ApiResponse({ status: 201, description: 'Destek talebi başarıyla oluşturuldu' })
  async create(@Body() data: CreateTicketDto, @Request() req: any) {
    return this.customerServiceService.create(data, req.user.id);
  }

  @Put('tickets/:id')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Destek talebini güncelle' })
  async update(@Param('id') id: string, @Body() data: UpdateTicketDto, @Request() req: any) {
    return this.customerServiceService.update(id, data);
  }

  @Post('tickets/:id/messages')
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'Destek talebine mesaj ekle' })
  async addMessage(@Param('id') id: string, @Body() data: AddMessageDto, @Request() req: any) {
    return this.customerServiceService.addMessage(id, data, req.user.id);
  }

  @Put('tickets/:id/close')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Destek talebini kapat' })
  async closeTicket(@Param('id') id: string, @Request() req: any) {
    return this.customerServiceService.closeTicket(id);
  }

  @Post('tickets/:id/rate')
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'Destek talebini değerlendir' })
  async rateTicket(
    @Param('id') id: string,
    @Body('rating') rating: number,
    @Body('comment') comment?: string,
    @Request() req?: any,
  ) {
    return this.customerServiceService.rateTicket(id, req?.user?.id, rating, comment);
  }

  @Get('stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Destek istatistikleri' })
  async getStats() {
    return this.customerServiceService.getStats();
  }
}
