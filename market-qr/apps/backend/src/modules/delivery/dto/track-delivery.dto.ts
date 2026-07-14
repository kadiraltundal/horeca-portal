import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class TrackDeliveryDto {
  @ApiProperty({ example: 41.0082 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 28.9784 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: 'IN_TRANSIT' })
  @IsString()
  status: string;

  @ApiPropertyOptional({ example: 'Trafik yoğunluğu nedeniyle gecikme' })
  @IsOptional()
  @IsString()
  notes?: string;
}
