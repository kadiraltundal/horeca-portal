import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class AddMessageDto {
  @ApiProperty({ example: 'Merhaba, siparişiniz kargoya verilmiştir.' })
  @IsString()
  @MinLength(1)
  content: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}
