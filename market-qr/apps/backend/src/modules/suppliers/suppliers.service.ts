import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 20, search?: string) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;
    const where = search ? {
      OR: [
        { name: { contains: search } },
        { contactName: { contains: search } },
        { email: { contains: search } },
      ],
    } : {};

    const [items, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        include: {
          _count: {
            select: { products: true, batches: true, purchaseOrders: true },
          },
        },
        skip,
        take: l,
        orderBy: { name: 'asc' },
      }),
      this.prisma.supplier.count({ where }),
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
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        products: true,
        batches: { take: 10, orderBy: { createdAt: 'desc' } },
        purchaseOrders: { take: 10, orderBy: { createdAt: 'desc' } },
        invoices: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return supplier;
  }

  async create(data: CreateSupplierDto) {
    const existing = await this.prisma.supplier.findFirst({
      where: {
        OR: [
          { name: data.name },
          ...(data.taxNumber ? [{ taxNumber: data.taxNumber }] : []),
        ],
      },
    });

    if (existing) {
      throw new ConflictException('Supplier with this name or tax number already exists');
    }

    return this.prisma.supplier.create({ data });
  }

  async update(id: string, data: UpdateSupplierDto) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return this.prisma.supplier.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: { _count: { select: { products: true, purchaseOrders: true } } },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    if (supplier._count.products > 0 || supplier._count.purchaseOrders > 0) {
      throw new ConflictException('Cannot delete supplier with linked products or orders');
    }

    return this.prisma.supplier.delete({ where: { id } });
  }

  async getSupplierStats(id: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const [totalOrders, totalInvoices, pendingInvoices] = await Promise.all([
      this.prisma.purchaseOrder.count({ where: { supplierId: id } }),
      this.prisma.supplierInvoice.count({ where: { supplierId: id } }),
      this.prisma.supplierInvoice.count({ where: { supplierId: id, status: 'PENDING' } }),
    ]);

    const totalSpent = await this.prisma.supplierInvoice.aggregate({
      where: { supplierId: id, status: 'PAID' },
      _sum: { totalAmount: true },
    });

    return {
      supplier,
      stats: {
        totalOrders,
        totalInvoices,
        pendingInvoices,
        totalSpent: totalSpent._sum.totalAmount || 0,
      },
    };
  }
}
