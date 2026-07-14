import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateShiftDto {
  @ApiProperty({ example: 'store-id-123' })
  @IsString()
  storeId: string;

  @ApiProperty({ example: 'user-id-456' })
  @IsString()
  userId: string;

  @ApiProperty({ example: '2026-07-09T08:00:00.000Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2026-07-09T17:00:00.000Z' })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({ example: 'Sabah vardiyası' })
  @IsOptional()
  @IsString()
  notes?: string;
}
