import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateDeliveryStatusDto {
  @ApiProperty({ example: 'IN_TRANSIT', enum: ['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED'] })
  @IsString()
  status: string;

  @ApiPropertyOptional({ example: 'Kurye-456' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ example: 'Adreste bulunamadı, tekrar denenecek' })
  @IsOptional()
  @IsString()
  notes?: string;
}
