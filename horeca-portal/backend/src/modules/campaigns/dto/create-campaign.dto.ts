import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min } from 'class-validator';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export class CreateCampaignDto {
  @IsString()
  titleUz: string;

  @IsString()
  @IsOptional()
  titleRu?: string;

  @IsString()
  @IsOptional()
  descriptionUz?: string;

  @IsString()
  @IsOptional()
  descriptionRu?: string;

  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  minQuantity?: number;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;
}