import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
  Min,
} from 'class-validator';
import { ProductUnit, StockStatus } from '../entities/product.entity';

export class CreateProductDto {
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  brandId?: string;

  @IsString()
  sku: string;

  @IsString()
  nameUz: string;

  @IsString()
  @IsOptional()
  nameRu?: string;

  @IsString()
  @IsOptional()
  descriptionUz?: string;

  @IsString()
  @IsOptional()
  descriptionRu?: string;

  @IsEnum(ProductUnit)
  @IsOptional()
  unit?: ProductUnit;

  @IsNumber()
  @Min(1)
  @IsOptional()
  minQuantity?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxQuantity?: number;

  @IsEnum(StockStatus)
  @IsOptional()
  stockStatus?: StockStatus;
}