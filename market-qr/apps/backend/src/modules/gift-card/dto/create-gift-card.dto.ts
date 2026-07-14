import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreateGiftCardDto {
  @ApiProperty({ example: 100.0, minimum: 1 })
  @IsNumber()
  @Min(1)
  initialValue: number;

  @ApiPropertyOptional({ example: 'TRY' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'user-id-123' })
  @IsOptional()
  @IsString()
  issuedBy?: string;

  @ApiPropertyOptional({ example: 'user-id-456' })
  @IsOptional()
  @IsString()
  issuedTo?: string;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59Z' })
  @IsOptional()
  @IsString()
  expiresAt?: string;
}
