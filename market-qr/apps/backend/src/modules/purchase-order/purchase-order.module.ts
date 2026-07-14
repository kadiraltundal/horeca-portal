import { Module } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderController } from './purchase-order.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService, PrismaService],
  exports: [PurchaseOrderService],
})
export class PurchaseOrderModule {}
