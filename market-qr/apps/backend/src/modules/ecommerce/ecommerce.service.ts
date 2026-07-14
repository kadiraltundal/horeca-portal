import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { SyncProductsDto } from './dto/sync-products.dto';
import { PlatformStrategy } from './strategies/platform.strategy';
import { TrendyolStrategy } from './strategies/trendyol.strategy';
import { HepsiburadaStrategy } from './strategies/hepsiburada.strategy';

@Injectable()
export class EcommerceService {
  private readonly logger = new Logger(EcommerceService.name);
  private readonly strategies = new Map<string, PlatformStrategy>();

  constructor(private prisma: PrismaService) {
    this.strategies.set('TRENDYOL', new TrendyolStrategy());
    this.strategies.set('HEPSIBURADA', new HepsiburadaStrategy());
  }

  // ─── Platforms ──────────────────────────────────────────────

  async listPlatforms() {
    return this.prisma.ecommercePlatform.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { products: true, orders: true },
        },
      },
    });
  }

  async createPlatform(dto: CreatePlatformDto) {
    return this.prisma.ecommercePlatform.create({ data: dto });
  }

  async updatePlatform(id: string, dto: Partial<CreatePlatformDto>) {
    await this.ensurePlatformExists(id);
    return this.prisma.ecommercePlatform.update({ where: { id }, data: dto });
  }

  async connectPlatform(id: string) {
    const platform = await this.prisma.ecommercePlatform.findUnique({ where: { id } });
    if (!platform) throw new NotFoundException('Platform not found');

    const strategy = this.strategies.get(platform.type);
    if (!strategy) {
      throw new BadRequestException(`No strategy registered for platform type: ${platform.type}`);
    }

    if (!platform.apiKey || !platform.apiSecret || !platform.baseUrl) {
      throw new BadRequestException('Platform is missing apiKey, apiSecret, or baseUrl');
    }

    const connected = await strategy.connect(
      platform.apiKey,
      platform.apiSecret,
      platform.baseUrl,
    );

    return { connected, platformType: platform.type };
  }

  // ─── Products ───────────────────────────────────────────────

  async listProducts(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          product: {
            name: { contains: search, mode: 'insensitive' as const },
          },
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.ecommerceProduct.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true, price: true } },
          platform: { select: { id: true, name: true, type: true } },
        },
      }),
      this.prisma.ecommerceProduct.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async syncProducts(dto: SyncProductsDto) {
    const platform = await this.prisma.ecommercePlatform.findUnique({
      where: { id: dto.platformId },
    });
    if (!platform) throw new NotFoundException('Platform not found');

    const strategy = this.strategies.get(platform.type);
    if (!strategy) {
      throw new BadRequestException(`No strategy registered for platform type: ${platform.type}`);
    }

    const where = dto.productIds?.length
      ? { id: { in: dto.productIds }, isActive: true }
      : { isActive: true };

    const products = await this.prisma.product.findMany({ where });

    const platformProducts = products.map((p) => ({
      sku: p.sku,
      name: p.name,
      description: p.description ?? undefined,
      price: p.price,
      currency: p.currency,
      stock: 0,
      barcode: p.barcode ?? undefined,
    }));

    const result = await strategy.pushProducts(platformProducts);

    await this.prisma.ecommerceSyncLog.create({
      data: {
        platformId: dto.platformId,
        type: 'PRODUCT',
        action: 'PUSH',
        status: result.success ? 'SUCCESS' : 'FAILED',
        message: `Synced ${result.syncedCount} products, ${result.failedCount} failed`,
        details: result.errors.length > 0 ? { errors: result.errors } : undefined,
      },
    });

    // Update sync status for each product
    for (const product of products) {
      const existing = await this.prisma.ecommerceProduct.findFirst({
        where: { platformId: dto.platformId, productId: product.id },
      });

      if (existing) {
        await this.prisma.ecommerceProduct.update({
          where: { id: existing.id },
          data: { syncStatus: 'SYNCED', lastSyncAt: new Date() },
        });
      } else {
        await this.prisma.ecommerceProduct.create({
          data: {
            platformId: dto.platformId,
            productId: product.id,
            syncStatus: 'SYNCED',
            lastSyncAt: new Date(),
          },
        });
      }
    }

    await this.prisma.ecommercePlatform.update({
      where: { id: dto.platformId },
      data: { lastSyncAt: new Date() },
    });

    return result;
  }

  // ─── Orders ─────────────────────────────────────────────────

  async listOrders(
    page = 1,
    limit = 20,
    platformId?: string,
    status?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (platformId) where.platformId = platformId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.ecommerceOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          platform: { select: { id: true, name: true, type: true } },
        },
      }),
      this.prisma.ecommerceOrder.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateOrderStatus(id: string, status: string) {
    const order = await this.prisma.ecommerceOrder.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    const platform = await this.prisma.ecommercePlatform.findUnique({
      where: { id: order.platformId },
    });
    if (!platform) throw new NotFoundException('Platform not found');

    const strategy = this.strategies.get(platform.type);
    if (strategy) {
      await strategy.updateOrderStatus(order.platformOrderId, status);
    }

    return this.prisma.ecommerceOrder.update({
      where: { id },
      data: { status },
    });
  }

  // ─── Sync Logs ──────────────────────────────────────────────

  async listSyncLogs(page = 1, limit = 20, platformId?: string) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (platformId) where.platformId = platformId;

    const [data, total] = await Promise.all([
      this.prisma.ecommerceSyncLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          platform: { select: { id: true, name: true, type: true } },
        },
      }),
      this.prisma.ecommerceSyncLog.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Webhook ────────────────────────────────────────────────

  async handleWebhook(payload: Record<string, unknown>) {
    const platformType = payload.platformType as string;
    const eventType = payload.event as string;

    this.logger.log(`Webhook received: ${platformType} - ${eventType}`);

    await this.prisma.ecommerceSyncLog.create({
      data: {
        platformId: (payload.platformId as string) ?? '',
        type: 'ORDER',
        action: 'PULL',
        status: 'SUCCESS',
        message: `Webhook: ${eventType}`,
        details: payload as any,
      },
    });

    return { received: true };
  }

  // ─── Helpers ────────────────────────────────────────────────

  private async ensurePlatformExists(id: string) {
    const exists = await this.prisma.ecommercePlatform.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Platform not found');
  }
}
