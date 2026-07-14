import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 20) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;
    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        include: { user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } } },
        skip,
        take: l,
      }),
      this.prisma.customer.count(),
    ]);
    return { data: customers, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
  }

  async findOne(userId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true, firstName: true, lastName: true, phone: true } },
        addresses: true,
        devices: true,
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(userId: string) {
    return this.prisma.customer.create({
      data: { userId },
    });
  }

  async addAddress(userId: string, data: { title: string; address: string; city?: string; district?: string; zipCode?: string; isDefault?: boolean }) {
    const customer = await this.prisma.customer.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException('Customer not found');
    return this.prisma.address.create({ data: { customerId: customer.id, ...data } });
  }

  async updateAddress(id: string, data: any) {
    return this.prisma.address.update({ where: { id }, data });
  }

  async removeAddress(id: string) {
    return this.prisma.address.delete({ where: { id } });
  }

  async addDevice(userId: string, data: { deviceType: string; token?: string }) {
    const customer = await this.prisma.customer.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException('Customer not found');
    return this.prisma.customerDevice.create({ data: { customerId: customer.id, ...data } });
  }

  async removeDevice(id: string) {
    return this.prisma.customerDevice.delete({ where: { id } });
  }

  async getOrders(userId: string, page: number = 1, limit: number = 20) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: { orderItems: { include: { product: true } } },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);
    return { data: orders, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
  }
}
