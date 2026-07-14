import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuoteCart } from './entities/quote-cart.entity';
import { ProductsService } from '../products/products.service';
import { PricingService } from '../pricing/pricing.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(QuoteCart)
    private cartRepository: Repository<QuoteCart>,
    private productsService: ProductsService,
    private pricingService: PricingService,
  ) {}

  async findByUser(userId: string): Promise<QuoteCart[]> {
    return this.cartRepository.find({
      where: { userId },
      relations: {
        product: {
          images: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async addToUser(userId: string, addToCartDto: AddToCartDto): Promise<QuoteCart> {
    const product = await this.productsService.findOne(addToCartDto.productId);

    // Check if product is already in cart
    const existingItem = await this.cartRepository.findOne({
      where: { userId, productId: addToCartDto.productId },
    });

    if (existingItem) {
      throw new BadRequestException('Product already in cart. Use update instead.');
    }

    // Get quantity-based price (considers pricing tiers)
    const quantity = addToCartDto.quantity || product.minQuantity;
    const unitPrice = await this.pricingService.getUnitPriceForQuantity(product.id, quantity);
    const totalPrice = unitPrice * quantity;

    this.logger.log(
      `Adding to cart: product=${product.id}, qty=${quantity}, unitPrice=${unitPrice}, total=${totalPrice}`,
    );

    const cartItem = this.cartRepository.create({
      userId,
      productId: product.id,
      quantity,
      unitPrice,
      totalPrice,
      note: addToCartDto.note,
    });

    return this.cartRepository.save(cartItem);
  }

  async updateItem(id: string, userId: string, updateCartItemDto: UpdateCartItemDto): Promise<QuoteCart> {
    const cartItem = await this.cartRepository.findOne({
      where: { id, userId },
      relations: {
        product: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Recalculate price with quantity-based pricing
    const quantity = updateCartItemDto.quantity || cartItem.quantity;
    const unitPrice = await this.pricingService.getUnitPriceForQuantity(cartItem.productId, quantity);
    const totalPrice = unitPrice * quantity;

    cartItem.quantity = quantity;
    cartItem.unitPrice = unitPrice;
    cartItem.totalPrice = totalPrice;
    if (updateCartItemDto.note !== undefined) {
      cartItem.note = updateCartItemDto.note;
    }

    this.logger.log(
      `Updating cart item: id=${id}, qty=${quantity}, unitPrice=${unitPrice}, total=${totalPrice}`,
    );

    return this.cartRepository.save(cartItem);
  }

  async removeFromUser(id: string, userId: string): Promise<void> {
    const cartItem = await this.cartRepository.findOne({
      where: { id, userId },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.remove(cartItem);
  }

  async clearUserCart(userId: string): Promise<void> {
    await this.cartRepository.delete({ userId });
  }

  async getCartSummary(userId: string) {
    const items = await this.findByUser(userId);
    const totalAmount = items.reduce((sum, item) => sum + Number(item.totalPrice), 0);
    const itemCount = items.length;

    return {
      items,
      itemCount,
      totalAmount,
    };
  }

  async getStats() {
    const totalItems = await this.cartRepository.count();
    const uniqueUsers = await this.cartRepository
      .createQueryBuilder('cart')
      .select('COUNT(DISTINCT cart.user_id)', 'count')
      .getRawOne();

    return {
      totalItems,
      uniqueUsers: parseInt(uniqueUsers.count, 10),
    };
  }
}
