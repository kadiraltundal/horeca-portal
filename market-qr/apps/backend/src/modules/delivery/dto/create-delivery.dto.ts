import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateDeliveryOrderDto {
  @ApiProperty({ example: 'order-id-123' })
  @IsString()
  orderId: string;

  @ApiProperty({ example: 'store-id-123' })
  @IsString()
  storeId: string;

  @ApiPropertyOptional({ example: 'customer-id-123' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ example: 'Atatürk Cd. No:1, Kadıköy, İstanbul' })
  @IsString()
  address: string;

  @ApiPropertyOptional({ example: 41.0082 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 28.9784 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: 'Kapıya bırakılabilir' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 15.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryFee?: number;
}

export class CreateDeliveryZoneDto {
  @ApiProperty({ example: 'store-id-123' })
  @IsString()
  storeId: string;

  @ApiProperty({ example: 'Kadıköy Teslimat Bölgesi' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Kadıköy ilçesi geneli' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 5, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  radius?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
