import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.store.findMany({
      include: {
        _count: {
          select: { storeProducts: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        storeProducts: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
        shelves: true,
        _count: {
          select: { storeProducts: true, orders: true, users: true },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  async create(data: {
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    workingHours?: string;
  }) {
    return this.prisma.store.create({
      data,
    });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      address: string;
      latitude: number;
      longitude: number;
      phone: string;
      workingHours: string;
      isActive: boolean;
    }>,
  ) {
    const store = await this.prisma.store.findUnique({ where: { id } });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return this.prisma.store.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const store = await this.prisma.store.findUnique({ where: { id } });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return this.prisma.store.delete({ where: { id } });
  }
}
