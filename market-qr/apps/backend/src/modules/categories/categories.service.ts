import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return categories;
  }

  async create(data: { name: string; parentId?: string }) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        parentId: data.parentId,
      },
    });
  }

  async update(id: string, data: { name?: string; sortOrder?: number }) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { children: true, products: true },
    });

    if (!category) {
      throw new Error('Kategori bulunamadı');
    }

    if (category.products.length > 0) {
      throw new Error('Bu kategoride ürünler var. Önce ürünleri taşıyın veya silin.');
    }

    if (category.children.length > 0) {
      throw new Error('Bu kategoride alt kategoriler var. Önce alt kategorileri silin.');
    }

    return this.prisma.category.delete({ where: { id } });
  }
}
