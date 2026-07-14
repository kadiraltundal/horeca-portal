import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsIn, Min } from 'class-validator';

export class CreateStockMovementDto {
  @ApiProperty({ example: 'store-id-123' })
  @IsString()
  storeId: string;

  @ApiProperty({ example: 'product-id-456' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 'IN', enum: ['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT', 'RETURN'] })
  @IsString()
  @IsIn(['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT', 'RETURN'])
  type: string;

  @ApiProperty({ example: 10, minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 'ORDER', enum: ['ORDER', 'PURCHASE', 'TRANSFER', 'MANUAL'] })
  @IsOptional()
  @IsString()
  @IsIn(['ORDER', 'PURCHASE', 'TRANSFER', 'MANUAL'])
  referenceType?: string;

  @ApiPropertyOptional({ example: 'order-id-789' })
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiPropertyOptional({ example: 'Yeni stok girişi' })
  @IsOptional()
  @IsString()
  notes?: string;
}
