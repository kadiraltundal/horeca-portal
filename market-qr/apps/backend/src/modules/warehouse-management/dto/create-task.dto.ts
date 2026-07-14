import { IsString, IsOptional, IsUUID, IsDateString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiPropertyOptional({ example: 'uuid-of-zone' })
  @IsUUID()
  @IsOptional()
  zoneId?: string;

  @ApiPropertyOptional({ enum: ['COUNT', 'MOVE', 'REPLENISH', 'AUDIT'], default: 'COUNT' })
  @IsString()
  @IsIn(['COUNT', 'MOVE', 'REPLENISH', 'AUDIT'])
  @IsOptional()
  type?: string;

  @ApiProperty({ example: 'Rafları say' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'A-01 bölgesindeki rafları say' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'uuid-of-staff' })
  @IsString()
  @IsOptional()
  assignedTo?: string;

  @ApiPropertyOptional({ example: '2024-01-15T18:00:00Z' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
