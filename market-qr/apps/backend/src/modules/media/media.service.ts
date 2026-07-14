import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async findAll(type?: string, productId?: string) {
    const where: any = {};
    if (type) where.type = type;
    if (productId) where.productId = productId;
    return this.prisma.media.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async create(data: { filename: string; url: string; mimeType: string; size: number; type: string; productId?: string }) {
    return this.prisma.media.create({ data });
  }

  async remove(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    return this.prisma.media.delete({ where: { id } });
  }
}
