import { Module } from '@nestjs/common';
import { ScanService } from './scan.service';
import { ScanController } from './scan.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [ScanController],
  providers: [ScanService, PrismaService],
  exports: [ScanService],
})
export class ScanModule {}
