import { Module } from '@nestjs/common';
import { BatchesService } from './batches.service';
import { BatchesController } from './batches.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [BatchesController],
  providers: [BatchesService, PrismaService],
  exports: [BatchesService],
})
export class BatchesModule {}
