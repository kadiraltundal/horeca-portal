import { Module } from '@nestjs/common';
import { ZReportService } from './z-report.service';
import { ZReportController } from './z-report.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [ZReportController],
  providers: [ZReportService, PrismaService],
  exports: [ZReportService],
})
export class ZReportModule {}
