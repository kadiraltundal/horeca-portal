import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReturnItemDto {
  @ApiProperty({ example: 'product-id-123' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  @Min(0.01)
  unitPrice: number;

  @ApiPropertyOptional({ example: 'Ürün arızalı' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: 'USED', enum: ['NEW', 'USED', 'DAMAGED'] })
  @IsOptional()
  @IsString()
  condition?: string;
}

export class CreateReturnDto {
  @ApiProperty({ example: 'order-id-123' })
  @IsString()
  orderId: string;

  @ApiProperty({ example: 'store-id-123' })
  @IsString()
  storeId: string;

  @ApiProperty({ example: 'Müşteri ürünü beğenmedi' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ example: 59.98 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  refundAmount?: number;

  @ApiPropertyOptional({ example: 'CASH', enum: ['CASH', 'CARD', 'GIFT_CARD', 'BANK_TRANSFER'] })
  @IsOptional()
  @IsString()
  refundMethod?: string;

  @ApiPropertyOptional({ example: 'Ek notlar' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ type: [CreateReturnItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReturnItemDto)
  items: CreateReturnItemDto[];
}
