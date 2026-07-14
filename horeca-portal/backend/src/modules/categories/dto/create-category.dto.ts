import { IsString, IsOptional, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsString()
  nameUz: string;

  @IsString()
  @IsOptional()
  nameRu?: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}