import { Module } from '@nestjs/common';
import { WarehouseManagementService } from './warehouse-management.service';
import { WarehouseManagementController } from './warehouse-management.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [WarehouseManagementController],
  providers: [WarehouseManagementService, PrismaService],
  exports: [WarehouseManagementService],
})
export class WarehouseManagementModule {}
