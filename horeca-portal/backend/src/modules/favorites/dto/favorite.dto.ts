import { IsString } from 'class-validator';

export class AddFavoriteDto {
  @IsString()
  productId: string;
}

export class FavoriteResponseDto {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;

  constructor(partial: Partial<FavoriteResponseDto>) {
    Object.assign(this, partial);
  }
}
