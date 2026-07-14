import { Module } from '@nestjs/common';
import { CustomerServiceService } from './customer-service.service';
import { CustomerServiceController } from './customer-service.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [CustomerServiceController],
  providers: [CustomerServiceService, PrismaService],
  exports: [CustomerServiceService],
})
export class CustomerServiceModule {}
