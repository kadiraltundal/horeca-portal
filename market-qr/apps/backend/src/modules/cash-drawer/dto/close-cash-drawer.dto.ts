import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CloseCashDrawerDto {
  @ApiProperty({ example: 'store-id-123' })
  @IsString()
  storeId: string;

  @ApiProperty({ example: 'user-id-456' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 2500.0, minimum: 0 })
  @IsNumber()
  @Min(0)
  closingBalance: number;

  @ApiPropertyOptional({ example: 'Gün sonu' })
  @IsOptional()
  @IsString()
  notes?: string;
}
