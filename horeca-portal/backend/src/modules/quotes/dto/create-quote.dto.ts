import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateQuoteDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  customerNote?: string;
}