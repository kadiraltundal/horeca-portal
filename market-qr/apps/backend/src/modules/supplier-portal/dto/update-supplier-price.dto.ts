import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSupplierPriceDto {
  @ApiProperty({ example: 150.5 })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ example: 'TRY' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'Fiyat güncellemesi' })
  @IsOptional()
  @IsString()
  notes?: string;
}
