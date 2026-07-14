import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateZoneDto {
  @ApiProperty({ example: 'A-01' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'ZN-A01' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  floor?: number;

  @ApiPropertyOptional({ example: 'Soğuk depo bölgesi' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 500 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
