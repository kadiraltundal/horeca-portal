import { Module } from '@nestjs/common';
import { CashDrawerService } from './cash-drawer.service';
import { CashDrawerController } from './cash-drawer.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [CashDrawerController],
  providers: [CashDrawerService, PrismaService],
  exports: [CashDrawerService],
})
export class CashDrawerModule {}
