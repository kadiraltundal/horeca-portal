import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { Response } from 'express';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(storeId: string, page: number = 1, limit: number = 20, status?: string) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;
    const where: any = { storeId };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          orderItems: { include: { product: true } },
          payment: true,
        },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data: orders, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, cashierNumber: true } },
        store: true,
        orderItems: { include: { product: true } },
        payment: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async calculate(storeId: string, items: Array<{ productId: string; quantity: number }>, couponCode?: string) {
    let subtotal = 0;
    const lines: Array<{ productId: string; name: string; quantity: number; unitPrice: number; subtotal: number; vatRate: number }> = [];

    for (const item of items) {
      const storeProduct = await this.prisma.storeProduct.findUnique({
        where: { storeId_productId: { storeId, productId: item.productId } },
        include: { product: true },
      });
      if (!storeProduct) throw new BadRequestException(`Product ${item.productId} not found`);
      if (storeProduct.stockQuantity < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${storeProduct.product.name}`);
      }

      const lineSubtotal = storeProduct.product.price * item.quantity;
      subtotal += lineSubtotal;
      lines.push({
        productId: item.productId,
        name: storeProduct.product.name,
        quantity: item.quantity,
        unitPrice: storeProduct.product.price,
        subtotal: lineSubtotal,
        vatRate: storeProduct.product.vatRate,
      });
    }

    let discount = 0;
    let discountDescription = '';

    if (couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: couponCode },
        include: { promotion: true },
      });
      if (coupon && coupon.isActive && (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date())) {
        if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
          if (!coupon.minAmount || subtotal >= coupon.minAmount) {
            if (coupon.promotion.discountType === 'PERCENTAGE') {
              discount = subtotal * (coupon.promotion.discountValue / 100);
            } else {
              discount = Math.min(coupon.promotion.discountValue, subtotal);
            }
            discountDescription = coupon.promotion.title;
          }
        }
      }
    }

    const afterDiscount = subtotal - discount;
    const vatAmount = lines.reduce((sum, line) => {
      return sum + (line.subtotal * (line.vatRate / 100));
    }, 0);
    const total = afterDiscount + vatAmount;

    return {
      lines,
      subtotal,
      discount,
      discountDescription,
      vatAmount,
      total,
    };
  }

  async create(data: {
    userId: string;
    storeId: string;
    paymentMethod: string;
    items: Array<{ productId: string; quantity: number }>;
    couponCode?: string;
  }) {
    const calc = await this.calculate(data.storeId, data.items, data.couponCode);

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          totalAmount: calc.total,
          discountAmount: calc.discount,
          paymentMethod: data.paymentMethod,
          status: 'PENDING',
          user: { connect: { id: data.userId } },
          store: { connect: { id: data.storeId } },
          orderItems: {
            create: calc.lines.map(l => ({
              product: { connect: { id: l.productId } },
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              subtotal: l.subtotal,
            })),
          },
        },
        include: { orderItems: true },
      });

      for (const item of data.items) {
        await tx.storeProduct.update({
          where: { storeId_productId: { storeId: data.storeId, productId: item.productId } },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      if (data.couponCode) {
        await tx.coupon.updateMany({
          where: { code: data.couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    return { ...order, calculation: calc };
  }

  async updateStatus(id: string, status: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    const validStatuses = ['PENDING', 'PAID', 'COMPLETED', 'CANCELLED', 'REFUNDED'];
    if (!validStatuses.includes(status)) throw new BadRequestException('Invalid status');

    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      const orderItems = await this.prisma.orderItem.findMany({ where: { orderId: id } });
      await this.prisma.$transaction(async (tx) => {
        for (const item of orderItems) {
          await tx.storeProduct.update({
            where: { storeId_productId: { storeId: order.storeId, productId: item.productId } },
            data: { stockQuantity: { increment: item.quantity } },
          });
        }
        await tx.order.update({ where: { id }, data: { status } });
      });
      return this.findOne(id);
    }

    return this.prisma.order.update({ where: { id }, data: { status }, include: { orderItems: true } });
  }

  async getStats(storeId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayOrders, monthOrders, totalRevenue] = await Promise.all([
      this.prisma.order.count({ where: { storeId, createdAt: { gte: startOfDay }, status: { not: 'CANCELLED' } } }),
      this.prisma.order.count({ where: { storeId, createdAt: { gte: startOfMonth }, status: { not: 'CANCELLED' } } }),
      this.prisma.order.aggregate({ where: { storeId, status: { in: ['PAID', 'COMPLETED'] } }, _sum: { totalAmount: true } }),
    ]);

    return { todayOrders, monthOrders, totalRevenue: totalRevenue._sum.totalAmount ?? 0 };
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async getReceipt(id: string, res: Response) {
    const order = await this.findOne(id);
    const store = (order as any).store;

    const escape = this.escapeHtml;
    const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Fiş - #${order.id.slice(0, 8)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', monospace; font-size: 12px; width: 80mm; padding: 5mm; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .line { border-top: 1px dashed #000; margin: 3mm 0; }
    .row { display: flex; justify-content: space-between; }
    .item { margin: 2mm 0; }
    .total { font-size: 14px; font-weight: bold; margin-top: 3mm; }
    @media print { body { width: 80mm; } }
  </style>
</head>
<body>
  <div class="center bold" style="font-size:16px">MARKET QR</div>
  <div class="center">${escape(store?.name || 'Market')}</div>
  <div class="center" style="font-size:10px">${escape(store?.address || '')}</div>
  <div class="line"></div>
  <div class="row"><span>Fiş No:</span><span>#${escape(order.id.slice(0, 8))}</span></div>
  <div class="row"><span>Tarih:</span><span>${escape(new Date(order.createdAt).toLocaleString('tr-TR'))}</span></div>
  <div class="row"><span>Kasiyer:</span><span>${escape((order.user as any)?.cashierNumber || 'N/A')} - ${escape(order.user?.firstName || '')} ${escape(order.user?.lastName || '')}</span></div>
  <div class="line"></div>
  <div class="bold" style="margin:2mm 0">ÜRÜNLER</div>
  ${(order.orderItems as any[]).map(item => `
    <div class="item">
      <div class="row"><span>${escape(item.product.name)}</span><span>₺${item.subtotal.toFixed(2)}</span></div>
      <div class="row" style="font-size:10px"><span>${item.quantity} x ₺${item.unitPrice.toFixed(2)}</span><span></span></div>
    </div>
  `).join('')}
  <div class="line"></div>
  <div class="row"><span>Ara Toplam:</span><span>₺${(order as any).totalAmount.toFixed(2)}</span></div>
  ${order.discountAmount > 0 ? `<div class="row"><span>İndirim:</span><span>-₺${order.discountAmount.toFixed(2)}</span></div>` : ''}
  <div class="total row"><span>TOPLAM:</span><span>₺${(order as any).totalAmount.toFixed(2)}</span></div>
  <div class="line"></div>
  <div class="row"><span>Ödeme:</span><span>${order.paymentMethod === 'CASH' ? 'NAKİT' : 'KART'}</span></div>
  <div class="line"></div>
  <div class="center" style="font-size:10px; margin-top:5mm">Bu bir electronic fiştir.</div>
  <div class="center" style="font-size:10px">Market QR ile alışveriş yaptığınız için teşekkürler!</div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  }
}
