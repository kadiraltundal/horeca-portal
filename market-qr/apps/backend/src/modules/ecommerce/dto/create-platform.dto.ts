import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PlatformType {
  TRENDYOL = 'TRENDYOL',
  HEPSIBURADA = 'HEPSIBURADA',
  N11 = 'N11',
  AMAZON = 'AMAZON',
  CUSTOM = 'CUSTOM',
}

export class CreatePlatformDto {
  @ApiProperty({ example: 'Mağaza Trendyol' })
  @IsString()
  name: string;

  @ApiProperty({ enum: PlatformType, example: PlatformType.TRENDYOL })
  @IsEnum(PlatformType)
  type: PlatformType;

  @ApiPropertyOptional({ example: 'your-api-key' })
  @IsString()
  @IsOptional()
  apiKey?: string;

  @ApiPropertyOptional({ example: 'your-api-secret' })
  @IsString()
  @IsOptional()
  apiSecret?: string;

  @ApiPropertyOptional({ example: 'https://api.trendyol.com' })
  @IsString()
  @IsOptional()
  baseUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
