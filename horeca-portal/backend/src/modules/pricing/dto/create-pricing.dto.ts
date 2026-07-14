import { IsUUID, IsNumber, IsEnum, IsOptional, IsDateString, Min, Max } from 'class-validator';
import { Currency } from '../entities/pricing.entity';

export class CreatePricingDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(0)
  costPrice: number;

  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @IsNumber()
  @Min(0)
  @IsOptional()
  additionalCosts?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  marginPercentage: number;

  // sellingPrice is auto-calculated: (costPrice + additionalCosts) * (1 + marginPercentage / 100)
  @IsNumber()
  @Min(0)
  @IsOptional()
  sellingPrice?: number;

  @IsDateString()
  @IsOptional()
  validFrom?: Date;

  @IsDateString()
  @IsOptional()
  validUntil?: Date;
}
