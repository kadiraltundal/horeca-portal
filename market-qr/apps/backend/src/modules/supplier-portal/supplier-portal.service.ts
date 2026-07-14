import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../config/prisma.service';
import { SupplierLoginDto } from './dto/supplier-login.dto';
import { UpdateSupplierPriceDto } from './dto/update-supplier-price.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class SupplierPortalService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: SupplierLoginDto) {
    const user = await this.prisma.supplierPortalUser.findUnique({
      where: { email: dto.email },
      include: { supplier: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Geçersiz credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Geçersiz credentials');
    }

    await this.prisma.supplierPortalUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      supplierId: user.supplierId,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        supplierId: user.supplierId,
        supplierName: user.supplier.name,
      },
      accessToken,
    };
  }

  async getDashboard(userId: string) {
    const user = await this.prisma.supplierPortalUser.findUnique({
      where: { id: userId },
      include: { supplier: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const supplierId = user.supplierId;

    const [products, pendingOrders, totalOrders, recentMessages, unreadMessages] =
      await Promise.all([
        this.prisma.product.count({
          where: { supplierId, isActive: true },
        }),
        this.prisma.purchaseOrder.count({
          where: { supplierId, status: 'PENDING' },
        }),
        this.prisma.purchaseOrder.aggregate({
          where: { supplierId },
          _sum: { totalAmount: true },
          _count: true,
        }),
        this.prisma.supplierMessage.findMany({
          where: { receiverId: userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { sender: { select: { firstName: true, lastName: true } } },
        }),
        this.prisma.supplierMessage.count({
          where: { receiverId: userId, isRead: false },
        }),
      ]);

    return {
      supplier: {
        id: user.supplierId,
        name: user.supplier.name,
        rating: user.supplier.rating,
      },
      stats: {
        totalProducts: products,
        pendingOrders,
        totalOrders: totalOrders._count,
        totalRevenue: totalOrders._sum.totalAmount || 0,
        unreadMessages,
      },
      recentMessages,
    };
  }

  async getProducts(userId: string) {
    const user = await this.prisma.supplierPortalUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const products = await this.prisma.product.findMany({
      where: { supplierId: user.supplierId, isActive: true },
      include: {
        category: { select: { name: true } },
        unit: { select: { name: true, symbol: true } },
        _count: { select: { purchaseItems: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return products;
  }

  async updateProductPrice(userId: string, productId: string, dto: UpdateSupplierPriceDto) {
    const user = await this.prisma.supplierPortalUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.role === 'VIEWER') {
      throw new ForbiddenException('Fiyat güncelleme yetkiniz yok');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.supplierId !== user.supplierId) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: {
        price: dto.price,
        ...(dto.currency && { currency: dto.currency }),
      },
    });

    return updated;
  }

  async getOrders(userId: string) {
    const user = await this.prisma.supplierPortalUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const orders = await this.prisma.purchaseOrder.findMany({
      where: { supplierId: user.supplierId },
      include: {
        store: { select: { name: true } },
        warehouse: { select: { name: true } },
        items: {
          include: {
            product: { select: { name: true, sku: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders;
  }

  async updateOrderStatus(userId: string, orderId: string, status: string) {
    const user = await this.prisma.supplierPortalUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.role === 'VIEWER') {
      throw new ForbiddenException('Sipariş güncelleme yetkiniz yok');
    }

    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id: orderId },
    });

    if (!order || order.supplierId !== user.supplierId) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    const validStatuses = ['PENDING', 'APPROVED', 'RECEIVED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new ForbiddenException('Geçersiz sipariş durumu');
    }

    const updated = await this.prisma.purchaseOrder.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === 'RECEIVED' && { receivedDate: new Date() }),
      },
    });

    return updated;
  }

  async getMessages(userId: string) {
    const messages = await this.prisma.supplierMessage.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, email: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return messages;
  }

  async sendMessage(userId: string, dto: SendMessageDto) {
    const user = await this.prisma.supplierPortalUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const receiver = await this.prisma.supplierPortalUser.findUnique({
      where: { id: dto.receiverId },
    });

    if (!receiver || receiver.supplierId !== user.supplierId) {
      throw new NotFoundException('Alıcı bulunamadı');
    }

    const message = await this.prisma.supplierMessage.create({
      data: {
        senderId: userId,
        receiverId: dto.receiverId,
        subject: dto.subject,
        content: dto.content,
      },
      include: {
        sender: { select: { firstName: true, lastName: true } },
        receiver: { select: { firstName: true, lastName: true } },
      },
    });

    return message;
  }

  async getNotifications(userId: string) {
    const messages = await this.prisma.supplierMessage.findMany({
      where: { receiverId: userId, isRead: false },
      include: {
        sender: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const pendingOrders = await this.prisma.purchaseOrder.findMany({
      where: {
        supplierId: (
          await this.prisma.supplierPortalUser.findUnique({ where: { id: userId } })
        )?.supplierId,
        status: 'PENDING',
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      unreadMessages: messages,
      pendingOrders,
      totalCount: messages.length + pendingOrders.length,
    };
  }
}
