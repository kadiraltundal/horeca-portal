import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsObject()
  notificationPreferences?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    orderUpdates?: boolean;
    promotions?: boolean;
    newProducts?: boolean;
  };
}

export class SettingsResponseDto {
  id: string;
  userId: string;
  language: string;
  notificationPreferences: any;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<SettingsResponseDto>) {
    Object.assign(this, partial);
  }
}
