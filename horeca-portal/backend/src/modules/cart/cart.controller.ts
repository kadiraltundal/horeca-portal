import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Request() req: any) {
    return this.cartService.findByUser(req.user.id);
  }

  @Get('summary')
  getCartSummary(@Request() req: any) {
    return this.cartService.getCartSummary(req.user.id);
  }

  @Post()
  addToCart(@Request() req: any, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToUser(req.user.id, addToCartDto);
  }

  @Put(':id')
  updateCartItem(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(id, req.user.id, updateCartItemDto);
  }

  @Delete(':id')
  removeFromCart(@Request() req: any, @Param('id') id: string) {
    return this.cartService.removeFromUser(id, req.user.id);
  }

  @Delete()
  clearCart(@Request() req: any) {
    return this.cartService.clearUserCart(req.user.id);
  }
}