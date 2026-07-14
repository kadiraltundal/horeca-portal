import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.favoritesService.findByUser(req.user.id);
  }

  @Post(':productId')
  addFavorite(@Request() req: any, @Param('productId') productId: string) {
    return this.favoritesService.addToUser(req.user.id, productId);
  }

  @Delete(':productId')
  removeFavorite(@Request() req: any, @Param('productId') productId: string) {
    return this.favoritesService.removeFromUser(req.user.id, productId);
  }
}