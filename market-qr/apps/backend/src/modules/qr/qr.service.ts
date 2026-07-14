import { Injectable, NotFoundException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class QrService {
  constructor(private prisma: PrismaService) {}

  async generate(productId: string, storeId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existingQR = await this.prisma.productQR.findFirst({
      where: { productId, storeId },
    });

    if (existingQR) {
      const qrData = await QRCode.toDataURL(
        `${process.env.APP_URL || 'http://localhost:3000'}/scan/${existingQR.qrToken}`,
      );

      return {
        ...existingQR,
        qrImageUrl: qrData,
      };
    }

    const qrToken = randomUUID();
    const scanUrl = `${process.env.APP_URL || 'http://localhost:3000'}/scan/${qrToken}`;

    const qrData = await QRCode.toDataURL(scanUrl);

    const productQR = await this.prisma.productQR.create({
      data: {
        productId,
        storeId,
        qrToken,
        qrImageUrl: qrData,
      },
    });

    return productQR;
  }

  async bulkExport(storeId: string) {
    const productQRs = await this.prisma.productQR.findMany({
      where: { storeId },
      include: {
        product: true,
      },
    });

    const qrImages = await Promise.all(
      productQRs.map(async (qr) => {
        const scanUrl = `${process.env.APP_URL || 'http://localhost:3000'}/scan/${qr.qrToken}`;
        const qrData = await QRCode.toDataURL(scanUrl);

        return {
          productName: qr.product.name,
          sku: qr.product.sku,
          qrToken: qr.qrToken,
          qrImageUrl: qrData,
        };
      }),
    );

    return qrImages;
  }

  async generateAll(storeId: string) {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
    });

    const results: Array<{ productName: string; qrToken: string }> = [];
    for (const product of products) {
      const existing = await this.prisma.productQR.findFirst({
        where: { productId: product.id, storeId },
      });
      if (!existing) {
        const qrToken = randomUUID();
        await this.prisma.productQR.create({
          data: { productId: product.id, storeId, qrToken },
        });
        results.push({ productName: product.name, qrToken });
      }
    }
    return { generated: results.length, products: results };
  }
}
