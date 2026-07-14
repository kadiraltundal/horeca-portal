import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: 'receiver-user-uuid' })
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @ApiProperty({ example: 'Sipariş Durumu' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: 'Siparişiniz hazırlanıyor.' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
