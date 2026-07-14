import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole, UserLanguage } from '../entities/user.entity';

export class CreateUserDto {
  @IsNumber()
  telegramId: number;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsEnum(UserLanguage)
  @IsOptional()
  language?: UserLanguage;
}