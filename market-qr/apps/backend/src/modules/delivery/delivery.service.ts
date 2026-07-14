import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateDeliveryOrderDto, CreateDeliveryZoneDto } from './dto/create-delivery.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { TrackDeliveryDto } from './dto/track-delivery.dto';

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

  async findAllOrders(storeId: string, page: number = 1, limit: number = 20, status?: string) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;
    const where: any = { storeId };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.deliveryOrder.findMany({
        where,
        include: {
          order: true,
          tracking: { orderBy: { timestamp: 'desc' }, take: 1 },
        },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.deliveryOrder.count({ where }),
    ]);

    return {
      data: items,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }

  async findOneOrder(id: string) {
    const deliveryOrder = await this.prisma.deliveryOrder.findUnique({
      where: { id },
      include: {
        order: { include: { orderItems: { include: { product: true } } } },
        store: true,
        tracking: { orderBy: { timestamp: 'desc' } },
      },
    });

    if (!deliveryOrder) {
      throw new NotFoundException('Delivery order not found');
    }

    return deliveryOrder;
  }

  async createOrder(data: CreateDeliveryOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.storeId !== data.storeId) {
      throw new BadRequestException('Order does not belong to this store');
    }

    return this.prisma.deliveryOrder.create({
      data: {
        orderId: data.orderId,
        storeId: data.storeId,
        customerId: data.customerId,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        notes: data.notes,
        deliveryFee: data.deliveryFee ?? 0,
      },
      include: {
        order: true,
      },
    });
  }

  async updateOrderStatus(id: string, dto: UpdateDeliveryStatusDto) {
    const deliveryOrder = await this.prisma.deliveryOrder.findUnique({ where: { id } });

    if (!deliveryOrder) {
      throw new NotFoundException('Delivery order not found');
    }

    const validTransitions: Record<string, string[]> = {
      PENDING: ['ASSIGNED', 'FAILED'],
      ASSIGNED: ['PICKED_UP', 'FAILED'],
      PICKED_UP: ['IN_TRANSIT'],
      IN_TRANSIT: ['DELIVERED', 'FAILED'],
      DELIVERED: [],
      FAILED: ['PENDING'],
    };

    if (!validTransitions[deliveryOrder.status]?.includes(dto.status)) {
      throw new BadRequestException(`Cannot transition from ${deliveryOrder.status} to ${dto.status}`);
    }

    const updateData: any = { status: dto.status };

    if (dto.assignedTo) updateData.assignedTo = dto.assignedTo;
    if (dto.notes) updateData.notes = dto.notes;

    if (dto.status === 'DELIVERED') {
      updateData.actualTime = new Date();
    }

    return this.prisma.deliveryOrder.update({
      where: { id },
      data: updateData,
    });
  }

  async getTracking(deliveryOrderId: string) {
    const deliveryOrder = await this.prisma.deliveryOrder.findUnique({
      where: { id: deliveryOrderId },
    });

    if (!deliveryOrder) {
      throw new NotFoundException('Delivery order not found');
    }

    return this.prisma.deliveryTracking.findMany({
      where: { deliveryOrderId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async addTracking(deliveryOrderId: string, dto: TrackDeliveryDto) {
    const deliveryOrder = await this.prisma.deliveryOrder.findUnique({
      where: { id: deliveryOrderId },
    });

    if (!deliveryOrder) {
      throw new NotFoundException('Delivery order not found');
    }

    return this.prisma.deliveryTracking.create({
      data: {
        deliveryOrderId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        status: dto.status,
        notes: dto.notes,
      },
    });
  }

  async findAllZones(storeId: string) {
    return this.prisma.deliveryZone.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createZone(data: CreateDeliveryZoneDto) {
    return this.prisma.deliveryZone.create({
      data: {
        storeId: data.storeId,
        name: data.name,
        description: data.description,
        radius: data.radius ?? 5,
        isActive: data.isActive ?? true,
      },
    });
  }

  async getStats(storeId: string) {
    const where = { storeId };

    const [total, pending, inTransit, delivered, failed, totalDeliveryFees] = await Promise.all([
      this.prisma.deliveryOrder.count({ where }),
      this.prisma.deliveryOrder.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.deliveryOrder.count({ where: { ...where, status: 'IN_TRANSIT' } }),
      this.prisma.deliveryOrder.count({ where: { ...where, status: 'DELIVERED' } }),
      this.prisma.deliveryOrder.count({ where: { ...where, status: 'FAILED' } }),
      this.prisma.deliveryOrder.aggregate({
        where: { ...where, status: 'DELIVERED' },
        _sum: { deliveryFee: true },
      }),
    ]);

    return {
      total,
      pending,
      inTransit,
      delivered,
      failed,
      totalDeliveryFees: totalDeliveryFees._sum.deliveryFee ?? 0,
    };
  }
}
