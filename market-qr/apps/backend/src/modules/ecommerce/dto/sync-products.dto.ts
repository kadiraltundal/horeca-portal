import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SyncProductsDto {
  @ApiProperty({ example: 'uuid-of-platform' })
  @IsString()
  platformId: string;

  @ApiPropertyOptional({
    example: ['uuid-product-1', 'uuid-product-2'],
    description: 'Specific product IDs to sync. If empty, sync all active products.',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productIds?: string[];
}
