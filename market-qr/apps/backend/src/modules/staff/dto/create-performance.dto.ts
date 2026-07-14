import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class CreatePerformanceDto {
  @ApiProperty({ example: 'user-id-456' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'store-id-123' })
  @IsString()
  storeId: string;

  @ApiProperty({ example: 'SALES', enum: ['SALES', 'ORDERS', 'CUSTOMER_SERVICE', 'EFFICIENCY'] })
  @IsString()
  metricType: string;

  @ApiProperty({ example: 95.5, minimum: 0 })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiProperty({ example: 'DAILY', enum: ['DAILY', 'WEEKLY', 'MONTHLY'] })
  @IsString()
  period: string;

  @ApiProperty({ example: '2026-07-09T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-07-09T23:59:59.999Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 'Günlük satış hedefi aşıldı' })
  @IsOptional()
  @IsString()
  notes?: string;
}
