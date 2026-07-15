import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Request,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { RequirePermissions } from '../../common/decorators/permission.decorator';
import { Permission } from '../../common/types/permission.types';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @RequirePermissions(Permission.FAVORITES_READ)
  findAll(@Request() req: any) {
    return this.favoritesService.findByUser(req.user.id);
  }

  @Post(':productId')
  @RequirePermissions(Permission.FAVORITES_CREATE)
  addFavorite(@Request() req: any, @Param('productId') productId: string) {
    return this.favoritesService.addToUser(req.user.id, productId);
  }

  @Delete(':productId')
  @RequirePermissions(Permission.FAVORITES_DELETE)
  removeFavorite(@Request() req: any, @Param('productId') productId: string) {
    return this.favoritesService.removeFromUser(req.user.id, productId);
  }
}
