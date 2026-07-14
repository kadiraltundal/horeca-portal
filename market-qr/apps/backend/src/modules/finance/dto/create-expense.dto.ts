import { IsString, IsNumber, IsOptional, Min, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ example: 'store-uuid' })
  @IsUUID()
  storeId: string;

  @ApiPropertyOptional({ example: 'category-uuid' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ example: 'Ofis Malzemeleri' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Kalem ve kağıt alımı' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 150.00 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ example: 'TRY' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ example: 'https://receipt-url.com/receipt.jpg' })
  @IsString()
  @IsOptional()
  receiptUrl?: string;
}
