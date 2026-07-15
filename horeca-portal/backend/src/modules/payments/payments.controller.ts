import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus } from './entities/payment.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permission.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Permission } from '../../common/types/permission.types';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @RequirePermissions(Permission.PAYMENTS_CREATE)
  async create(@Request() req: any, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(req.user.id, createPaymentDto);
  }

  @Get()
  @RequirePermissions(Permission.PAYMENTS_READ)
  async findAllByUser(@Request() req: any) {
    return this.paymentsService.findByUser(req.user.id);
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermissions(Permission.PAYMENTS_READ)
  async findAll() {
    return this.paymentsService.findAll();
  }

  @Get('admin/stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermissions(Permission.REPORTS_READ)
  async getStats() {
    return this.paymentsService.getStats();
  }

  @Get(':id')
  @RequirePermissions(Permission.PAYMENTS_READ)
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post(':id/process/click')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.PAYMENTS_UPDATE)
  async processClick(@Param('id') id: string, @Body('externalId') externalId: string) {
    return this.paymentsService.processClick(id, externalId);
  }

  @Post(':id/process/payme')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.PAYMENTS_UPDATE)
  async processPayme(@Param('id') id: string, @Body('externalId') externalId: string) {
    return this.paymentsService.processPayme(id, externalId);
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermissions(Permission.PAYMENTS_UPDATE)
  async updateStatus(@Param('id') id: string, @Body('status') status: PaymentStatus) {
    return this.paymentsService.updateStatus(id, status);
  }
}
