import { IsString, IsOptional, IsEnum, IsNumber, IsEmail, IsBoolean } from 'class-validator';
import { VendorType } from '../entities/vendor.entity';

export class CreateVendorDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(VendorType)
  type?: VendorType;

  @IsOptional()
  @IsNumber()
  commissionRate?: number;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @IsOptional()
  @IsString()
  taxNumber?: string;

  @IsOptional()
  @IsString()
  bankAccount?: string;
}
