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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, PaymentStatus } from './entities/order.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permission.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Permission } from '../../common/types/permission.types';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @RequirePermissions(Permission.ORDERS_CREATE)
  async create(@Request() req: any, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @Get()
  @RequirePermissions(Permission.ORDERS_READ)
  async findAllByUser(@Request() req: any) {
    return this.ordersService.findByUser(req.user.id);
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermissions(Permission.ORDERS_READ)
  async findAll() {
    return this.ordersService.findAll();
  }

  @Get('admin/stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermissions(Permission.REPORTS_READ)
  async getStats() {
    return this.ordersService.getStats();
  }

  @Get(':id')
  @RequirePermissions(Permission.ORDERS_READ)
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermissions(Permission.ORDERS_UPDATE)
  async updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.ordersService.updateStatus(id, status);
  }

  @Put(':id/payment-status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermissions(Permission.ORDERS_UPDATE)
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body('paymentStatus') paymentStatus: PaymentStatus,
  ) {
    return this.ordersService.updatePaymentStatus(id, paymentStatus);
  }

  @Put(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.ORDERS_UPDATE)
  async cancel(@Param('id') id: string, @Body('reason') reason: string) {
    return this.ordersService.cancel(id, reason);
  }
}
