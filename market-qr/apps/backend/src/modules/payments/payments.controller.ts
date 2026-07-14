import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private svc: PaymentsService) {}

  @Post('initialize')
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'Ödeme başlat' })
  initialize(@Body() body: { orderId: string; method: string; provider?: string }) {
    return this.svc.initialize(body);
  }

  @Post(':orderId/confirm')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Ödeme onayı' })
  confirm(@Param('orderId') orderId: string) {
    return this.svc.confirm(orderId);
  }

  @Post(':orderId/fail')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Ödeme başarısız' })
  fail(@Param('orderId') orderId: string, @Body('reason') reason?: string) {
    return this.svc.fail(orderId, reason);
  }

  @Get(':orderId/status')
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'Ödeme durumu sorgula' })
  getStatus(@Param('orderId') orderId: string) {
    return this.svc.getStatus(orderId);
  }
}
