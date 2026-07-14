import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateReturnStatusDto {
  @ApiProperty({ example: 'APPROVED', enum: ['PENDING', 'APPROVED', 'REJECTED', 'RECEIVED', 'COMPLETED'] })
  @IsString()
  status: string;

  @ApiPropertyOptional({ example: 59.98 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  refundAmount?: number;

  @ApiPropertyOptional({ example: 'CASH', enum: ['CASH', 'CARD', 'GIFT_CARD', 'BANK_TRANSFER'] })
  @IsOptional()
  @IsString()
  refundMethod?: string;

  @ApiPropertyOptional({ example: 'İade onaylandı, tutar iade edildi' })
  @IsOptional()
  @IsString()
  notes?: string;
}
