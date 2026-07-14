import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus } from './entities/payment.entity';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async create(@Request() req: any, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(req.user.id, createPaymentDto);
  }

  @Get()
  async findAllByUser(@Request() req: any) {
    return this.paymentsService.findByUser(req.user.id);
  }

  @Get('admin/all')
  async findAll() {
    return this.paymentsService.findAll();
  }

  @Get('admin/stats')
  async getStats() {
    return this.paymentsService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post(':id/process/click')
  @HttpCode(HttpStatus.OK)
  async processClick(@Param('id') id: string, @Body('externalId') externalId: string) {
    return this.paymentsService.processClick(id, externalId);
  }

  @Post(':id/process/payme')
  @HttpCode(HttpStatus.OK)
  async processPayme(@Param('id') id: string, @Body('externalId') externalId: string) {
    return this.paymentsService.processPayme(id, externalId);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: PaymentStatus) {
    return this.paymentsService.updateStatus(id, status);
  }
}
