import { IsString, IsNotEmpty } from 'class-validator';

export class TelegramLoginDto {
  @IsString()
  @IsNotEmpty()
  initData: string;
}