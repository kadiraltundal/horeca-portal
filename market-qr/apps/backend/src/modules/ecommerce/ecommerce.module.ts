import { Module } from '@nestjs/common';
import { EcommerceService } from './ecommerce.service';
import { EcommerceController } from './ecommerce.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [EcommerceController],
  providers: [EcommerceService, PrismaService],
  exports: [EcommerceService],
})
export class EcommerceModule {}
