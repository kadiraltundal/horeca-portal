import { IsEnum, IsString, IsOptional } from 'class-validator';
import { QuoteStatus } from '../entities/quote.entity';

export class UpdateQuoteStatusDto {
  @IsEnum(QuoteStatus)
  status: QuoteStatus;

  @IsString()
  @IsOptional()
  adminNote?: string;
}