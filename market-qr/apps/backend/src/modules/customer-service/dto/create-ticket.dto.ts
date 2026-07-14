import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ example: 'Sipariş teslim edilmedi' })
  @IsString()
  @MinLength(5)
  subject: string;

  @ApiProperty({ example: 'Sipariş numaram 12345 olan ürün hala elime ulaşmadı.' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiPropertyOptional({ example: 'ORDER', enum: ['ORDER', 'PRODUCT', 'DELIVERY', 'PAYMENT', 'OTHER'] })
  @IsOptional()
  @IsEnum(['ORDER', 'PRODUCT', 'DELIVERY', 'PAYMENT', 'OTHER'])
  category?: string;

  @ApiPropertyOptional({ example: 'HIGH', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storeId?: string;
}
