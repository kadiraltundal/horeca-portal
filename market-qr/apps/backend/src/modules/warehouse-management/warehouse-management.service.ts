import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class WarehouseManagementService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    const where = companyId ? { companyId } : {};
    return this.prisma.warehouse.findMany({
      where,
      include: {
        company: { select: { id: true, name: true } },
        warehouseStocks: { include: { product: { select: { id: true, name: true, sku: true } } } },
        _count: { select: { warehouseStocks: true, purchaseOrders: true } },
      },
    });
  }

  async findOne(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true } },
        warehouseStocks: {
          include: { product: { select: { id: true, name: true, sku: true, barcode: true } } },
        },
        _count: { select: { warehouseStocks: true, purchaseOrders: true } },
      },
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    return warehouse;
  }

  async findZones(warehouseId: string) {
    await this.ensureWarehouseExists(warehouseId);
    return this.prisma.warehouseZone.findMany({
      where: { warehouseId },
      include: {
        _count: { select: { tasks: true } },
      },
    });
  }

  async createZone(warehouseId: string, dto: CreateZoneDto) {
    await this.ensureWarehouseExists(warehouseId);
    return this.prisma.warehouseZone.create({
      data: {
        warehouseId,
        name: dto.name,
        code: dto.code,
        floor: dto.floor,
        description: dto.description,
        capacity: dto.capacity,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findStock(warehouseId: string) {
    await this.ensureWarehouseExists(warehouseId);
    return this.prisma.warehouseStock.findMany({
      where: { warehouseId },
      include: {
        product: {
          select: { id: true, name: true, sku: true, barcode: true, price: true },
        },
      },
    });
  }

  async createTransfer(warehouseId: string, dto: CreateTransferDto) {
    await this.ensureWarehouseExists(warehouseId);

    if (dto.toWarehouseId === warehouseId) {
      throw new BadRequestException('Source and target warehouse cannot be the same');
    }

    const targetWarehouse = await this.prisma.warehouse.findUnique({
      where: { id: dto.toWarehouseId },
    });
    if (!targetWarehouse) throw new NotFoundException('Target warehouse not found');

    const sourceStock = await this.prisma.warehouseStock.findUnique({
      where: { warehouseId_productId: { warehouseId, productId: dto.productId } },
    });

    if (!sourceStock || sourceStock.quantity < dto.quantity) {
      throw new BadRequestException('Insufficient stock in source warehouse');
    }

    const transferNumber = `TRF-${Date.now().toString(36).toUpperCase()}`;

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.warehouseStock.update({
        where: { warehouseId_productId: { warehouseId, productId: dto.productId } },
        data: { quantity: { decrement: dto.quantity } },
      });

      await tx.warehouseStock.upsert({
        where: { warehouseId_productId: { warehouseId: dto.toWarehouseId, productId: dto.productId } },
        create: {
          warehouseId: dto.toWarehouseId,
          productId: dto.productId,
          quantity: dto.quantity,
        },
        update: { quantity: { increment: dto.quantity } },
      });

      return tx.warehouseTransfer.create({
        data: {
          transferNumber,
          fromWarehouseId: warehouseId,
          toWarehouseId: dto.toWarehouseId,
          productId: dto.productId,
          quantity: dto.quantity,
          status: 'IN_TRANSIT',
          notes: dto.notes,
          requestedBy: dto.requestedBy,
        },
        include: {
          fromWarehouse: { select: { id: true, name: true } },
          toWarehouse: { select: { id: true, name: true } },
          product: { select: { id: true, name: true, sku: true } },
        },
      });
    });

    return result;
  }

  async findTransfers(warehouseId: string, page: number = 1, limit: number = 20) {
    await this.ensureWarehouseExists(warehouseId);
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;

    const where = {
      OR: [
        { fromWarehouseId: warehouseId },
        { toWarehouseId: warehouseId },
      ],
    };

    const [transfers, total] = await Promise.all([
      this.prisma.warehouseTransfer.findMany({
        where,
        include: {
          fromWarehouse: { select: { id: true, name: true } },
          toWarehouse: { select: { id: true, name: true } },
          product: { select: { id: true, name: true, sku: true } },
        },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.warehouseTransfer.count({ where }),
    ]);

    return { data: transfers, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
  }

  async findTasks(warehouseId: string, page: number = 1, limit: number = 20) {
    await this.ensureWarehouseExists(warehouseId);
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;

    const where = { warehouseId };

    const [tasks, total] = await Promise.all([
      this.prisma.warehouseTask.findMany({
        where,
        include: {
          zone: { select: { id: true, name: true, code: true } },
        },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.warehouseTask.count({ where }),
    ]);

    return { data: tasks, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
  }

  async createTask(warehouseId: string, dto: CreateTaskDto) {
    await this.ensureWarehouseExists(warehouseId);

    if (dto.zoneId) {
      const zone = await this.prisma.warehouseZone.findUnique({
        where: { id: dto.zoneId },
      });
      if (!zone || zone.warehouseId !== warehouseId) {
        throw new NotFoundException('Zone not found in this warehouse');
      }
    }

    return this.prisma.warehouseTask.create({
      data: {
        warehouseId,
        zoneId: dto.zoneId,
        type: dto.type ?? 'COUNT',
        title: dto.title,
        description: dto.description,
        status: 'PENDING',
        assignedTo: dto.assignedTo,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
      include: {
        zone: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async updateTaskStatus(taskId: string, status: string, completedAt?: string) {
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const task = await this.prisma.warehouseTask.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.warehouseTask.update({
      where: { id: taskId },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? (completedAt ? new Date(completedAt) : new Date()) : task.completedAt,
      },
      include: {
        zone: { select: { id: true, name: true, code: true } },
      },
    });
  }

  private async ensureWarehouseExists(warehouseId: string) {
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id: warehouseId } });
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    return warehouse;
  }
}
