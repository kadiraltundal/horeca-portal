import {
  Injectable, UnauthorizedException, ConflictException,
  NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../config/prisma.service';
import { MobileLoginDto } from './dto/mobile-login.dto';
import { MobileRegisterDto } from './dto/mobile-register.dto';
import { MobileOrderDto } from './dto/mobile-order.dto';

@Injectable()
export class MobileService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ── Auth ──

  async login(dto: MobileLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      ...tokens,
    };
  }

  async register(dto: MobileRegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: 'CUSTOMER',
      },
    });

    // Create customer record
    const customer = await this.prisma.customer.create({
      data: { userId: user.id },
    });

    // Register device if provided
    if (dto.deviceType && dto.pushToken) {
      await this.prisma.customerDevice.create({
        data: {
          customerId: customer.id,
          deviceType: dto.deviceType,
          token: dto.pushToken,
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
      customer: {
        id: customer.id,
        tier: customer.tier,
        points: customer.points,
      },
      ...tokens,
    };
  }

  // ── Products ──

  async listProducts(params: {
    storeId?: string;
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
  }) {
    const { storeId, page, limit, search, categoryId } = params;
    const skip = (page - 1) * limit;

    if (storeId) {
      const where: any = { storeId };
      if (search) {
        where.product = {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        };
      }
      if (categoryId) {
        where.product = { ...where.product, categoryId };
      }

      const [storeProducts, total] = await Promise.all([
        this.prisma.storeProduct.findMany({
          where,
          include: {
            product: {
              include: {
                category: { select: { id: true, name: true } },
                brand: { select: { id: true, name: true } },
                images: { orderBy: { isPrimary: 'desc' }, take: 3 },
              },
            },
          },
          skip,
          take: limit,
          orderBy: { product: { name: 'asc' } },
        }),
        this.prisma.storeProduct.count({ where }),
      ]);

      return {
        data: storeProducts.map((sp) => ({
          id: sp.product.id,
          name: sp.product.name,
          description: sp.product.description,
          price: sp.product.price,
          currency: sp.product.currency,
          image: sp.product.images[0]?.url || null,
          images: sp.product.images,
          category: sp.product.category,
          brand: sp.product.brand,
          inStock: sp.stockQuantity > 0,
          stockQuantity: sp.stockQuantity,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    // No storeId — list all active products
    const where: any = { isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          images: { orderBy: { isPrimary: 'desc' }, take: 3 },
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        currency: p.currency,
        image: p.images[0]?.url || null,
        images: p.images,
        category: p.category,
        brand: p.brand,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        supplier: { select: { id: true, name: true } },
        unit: true,
        images: { orderBy: { isPrimary: 'desc' } },
        variants: { where: { isActive: true } },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // ── Categories ──

  async listCategories() {
    return this.prisma.category.findMany({
      where: { parentId: null, isActive: true },
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: { where: { isActive: true } },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // ── Orders ──

  async createOrder(userId: string, dto: MobileOrderDto) {
    // Ensure customer exists
    let customer = await this.prisma.customer.findUnique({ where: { userId } });
    if (!customer) {
      customer = await this.prisma.customer.create({ data: { userId } });
    }

    // Validate address if provided
    if (dto.addressId) {
      const address = await this.prisma.address.findUnique({
        where: { id: dto.addressId },
      });
      if (!address || address.customerId !== customer.id) {
        throw new NotFoundException('Address not found');
      }
    }

    // Calculate totals
    let subtotal = 0;
    const lines: Array<{
      productId: string;
      name: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      vatRate: number;
    }> = [];

    for (const item of dto.items) {
      const storeProduct = await this.prisma.storeProduct.findUnique({
        where: {
          storeId_productId: { storeId: dto.storeId, productId: item.productId },
        },
        include: { product: true },
      });
      if (!storeProduct) {
        throw new NotFoundException(`Product ${item.productId} not found in store`);
      }
      if (storeProduct.stockQuantity < item.quantity) {
        throw new ConflictException(`Insufficient stock for ${storeProduct.product.name}`);
      }

      const lineSubtotal = storeProduct.product.price * item.quantity;
      subtotal += lineSubtotal;
      lines.push({
        productId: item.productId,
        name: storeProduct.product.name,
        quantity: item.quantity,
        unitPrice: storeProduct.product.price,
        subtotal: lineSubtotal,
        vatRate: storeProduct.product.vatRate,
      });
    }

    // Coupon validation
    let discount = 0;
    let discountDescription = '';
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode },
        include: { promotion: true },
      });
      if (coupon && coupon.isActive && (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date())) {
        if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
          if (!coupon.minAmount || subtotal >= coupon.minAmount) {
            if (coupon.promotion.discountType === 'PERCENTAGE') {
              discount = subtotal * (coupon.promotion.discountValue / 100);
            } else {
              discount = Math.min(coupon.promotion.discountValue, subtotal);
            }
            discountDescription = coupon.promotion.title;
          }
        }
      }
    }

    const afterDiscount = subtotal - discount;
    const vatAmount = lines.reduce(
      (sum, line) => sum + line.subtotal * (line.vatRate / 100),
      0,
    );
    const total = afterDiscount + vatAmount;

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          totalAmount: total,
          discountAmount: discount,
          paymentMethod: dto.paymentMethod,
          status: 'PENDING',
          user: { connect: { id: userId } },
          store: { connect: { id: dto.storeId } },
          orderItems: {
            create: lines.map((l) => ({
              product: { connect: { id: l.productId } },
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              subtotal: l.subtotal,
            })),
          },
        },
        include: { orderItems: { include: { product: { select: { name: true, price: true } } } } },
      });

      // Decrement stock
      for (const item of dto.items) {
        await tx.storeProduct.update({
          where: {
            storeId_productId: { storeId: dto.storeId, productId: item.productId },
          },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      // Increment coupon usage
      if (dto.couponCode) {
        await tx.coupon.updateMany({
          where: { code: dto.couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    return {
      ...order,
      calculation: {
        lines,
        subtotal,
        discount,
        discountDescription,
        vatAmount,
        total,
      },
    };
  }

  async myOrders(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: {
          store: { select: { id: true, name: true, address: true } },
          orderItems: {
            include: {
              product: {
                select: { id: true, name: true, price: true },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        store: { select: { id: true, name: true, address: true, phone: true } },
        orderItems: {
          include: {
            product: {
              select: { id: true, name: true, price: true },
            },
          },
        },
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  // ── Favorites ──

  async addFavorite(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.prisma.userFavorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) {
      throw new ConflictException('Already in favorites');
    }

    return this.prisma.userFavorite.create({
      data: { userId, productId },
      include: {
        product: {
          select: { id: true, name: true, price: true },
        },
      },
    });
  }

  async removeFavorite(userId: string, productId: string) {
    const favorite = await this.prisma.userFavorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.userFavorite.delete({
      where: { userId_productId: { userId, productId } },
    });
  }

  async myFavorites(userId: string) {
    const favorites = await this.prisma.userFavorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: { select: { id: true, name: true } },
            images: { orderBy: { isPrimary: 'desc' }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((f) => ({
      id: f.id,
      createdAt: f.createdAt,
      product: {
        id: f.product.id,
        name: f.product.name,
        description: f.product.description,
        price: f.product.price,
        currency: f.product.currency,
        image: f.product.images[0]?.url || null,
        category: f.product.category,
      },
    }));
  }

  // ── Profile ──

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; phone?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatarUrl: true,
      },
    });
  }

  // ── Devices ──

  async registerDevice(userId: string, data: { deviceType: string; token: string }) {
    let customer = await this.prisma.customer.findUnique({ where: { userId } });
    if (!customer) {
      customer = await this.prisma.customer.create({ data: { userId } });
    }

    // Upsert device by token
    const existing = await this.prisma.customerDevice.findFirst({
      where: { customerId: customer.id, token: data.token },
    });

    if (existing) {
      return this.prisma.customerDevice.update({
        where: { id: existing.id },
        data: { isActive: true, deviceType: data.deviceType },
      });
    }

    return this.prisma.customerDevice.create({
      data: {
        customerId: customer.id,
        deviceType: data.deviceType,
        token: data.token,
      },
    });
  }

  // ── Promotions ──

  async listPromotions() {
    const now = new Date();
    return this.prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      select: {
        id: true,
        title: true,
        description: true,
        discountType: true,
        discountValue: true,
        startDate: true,
        endDate: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Helpers ──

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
