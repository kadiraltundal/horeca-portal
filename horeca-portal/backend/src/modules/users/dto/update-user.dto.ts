import { IsString, IsOptional, IsEnum } from 'class-validator';
import { UserLanguage } from '../entities/user.entity';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsEnum(UserLanguage)
  @IsOptional()
  language?: UserLanguage;
}