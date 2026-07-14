import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CheckInDto {
  @ApiProperty({ example: 'user-id-456' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'store-id-123' })
  @IsString()
  storeId: string;

  @ApiPropertyOptional({ example: 'Zamanında giriş' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CheckOutDto {
  @ApiProperty({ example: 'user-id-456' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'store-id-123' })
  @IsString()
  storeId: string;

  @ApiPropertyOptional({ example: 'Zamanında çıkış' })
  @IsOptional()
  @IsString()
  notes?: string;
}
