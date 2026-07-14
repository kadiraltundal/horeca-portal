import { IsString, IsNumber, IsOptional, Min, Max, IsUUID, IsArray, ValidateNested, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiProperty({ example: 'Ürün açıklaması' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({ example: 100.00 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: 'store-uuid' })
  @IsUUID()
  storeId: string;

  @ApiPropertyOptional({ example: 'customer-uuid' })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ example: 'SALES', enum: ['SALES', 'PURCHASE', 'RETURN'] })
  @IsString()
  @IsEnum(['SALES', 'PURCHASE', 'RETURN'])
  type: string;

  @ApiPropertyOptional({ example: 'INV-2024-001' })
  @IsString()
  @IsOptional()
  invoiceNumber?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ example: 'Notlar buraya' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: [InvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}
