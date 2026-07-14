import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';

@Injectable()
export class PurchaseOrderService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 20, status?: string, supplierId?: string) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;
    const where: any = {};
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;

    const [items, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: true,
          items: { include: { product: true } },
          store: true,
        },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return {
      data: items,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: { include: { product: true } },
        store: true,
        warehouse: true,
        invoices: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Purchase order not found');
    }

    return order;
  }

  async create(data: CreatePurchaseOrderDto, userId?: string) {
    const orderNumber = `PO-${Date.now()}`;

    const items = data.items.map((item) => ({
      ...item,
      subtotal: item.quantity * item.unitPrice,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    return this.prisma.purchaseOrder.create({
      data: {
        orderNumber,
        supplierId: data.supplierId,
        storeId: data.storeId,
        warehouseId: data.warehouseId,
        totalAmount,
        notes: data.notes,
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
        createdBy: userId,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
        },
      },
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
    });
  }

  async updateStatus(id: string, status: string) {
    const order = await this.prisma.purchaseOrder.findUnique({ where: { id } });

    if (!order) {
      throw new NotFoundException('Purchase order not found');
    }

    const validTransitions: Record<string, string[]> = {
      DRAFT: ['PENDING', 'CANCELLED'],
      PENDING: ['APPROVED', 'CANCELLED'],
      APPROVED: ['RECEIVED', 'CANCELLED'],
      RECEIVED: [],
      CANCELLED: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      throw new BadRequestException(`Cannot transition from ${order.status} to ${status}`);
    }

    const updateData: any = { status };

    if (status === 'RECEIVED') {
      updateData.receivedDate = new Date();

      // Update stock for received items
      const items = await this.prisma.purchaseOrderItem.findMany({
        where: { purchaseOrderId: id },
      });

      for (const item of items) {
        if (order.storeId) {
          await this.prisma.storeProduct.upsert({
            where: {
              storeId_productId: {
                storeId: order.storeId,
                productId: item.productId,
              },
            },
            update: {
              stockQuantity: { increment: item.quantity },
            },
            create: {
              storeId: order.storeId,
              productId: item.productId,
              stockQuantity: item.quantity,
            },
          });
        }
      }
    }

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    const order = await this.prisma.purchaseOrder.findUnique({ where: { id } });

    if (!order) {
      throw new NotFoundException('Purchase order not found');
    }

    if (order.status !== 'DRAFT') {
      throw new BadRequestException('Only draft orders can be deleted');
    }

    await this.prisma.purchaseOrderItem.deleteMany({
      where: { purchaseOrderId: id },
    });

    return this.prisma.purchaseOrder.delete({ where: { id } });
  }
}
