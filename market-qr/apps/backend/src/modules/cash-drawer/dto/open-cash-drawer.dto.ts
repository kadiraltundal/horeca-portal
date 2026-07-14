import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class OpenCashDrawerDto {
  @ApiProperty({ example: 'store-id-123' })
  @IsString()
  storeId: string;

  @ApiProperty({ example: 1000.0, minimum: 0 })
  @IsNumber()
  @Min(0)
  openingBalance: number;

  @ApiPropertyOptional({ example: 'Gün başlangıcı' })
  @IsOptional()
  @IsString()
  notes?: string;
}
