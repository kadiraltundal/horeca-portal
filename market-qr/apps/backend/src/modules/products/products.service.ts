import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(storeId: string, page: number = 1, limit: number = 20, search?: string) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;
    const where: any = storeId ? { storeId } : {};

    if (search) {
      where.product = {
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
          { barcode: { contains: search } },
          { description: { contains: search } },
        ],
      };
    }

    const [products, total] = await Promise.all([
      this.prisma.storeProduct.findMany({
        where,
        include: {
          product: {
            include: {
              category: true,
              brand: true,
              supplier: true,
              unit: true,
              images: { orderBy: { isPrimary: 'desc' } },
              tags: { include: { tag: true } },
              variants: true,
            },
          },
        },
        skip,
        take: l,
        orderBy: { product: { name: 'asc' } },
      }),
      this.prisma.storeProduct.count({ where }),
    ]);

    return { data: products, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
  }

  async findOne(storeId: string, productId: string) {
    const storeProduct = await this.prisma.storeProduct.findUnique({
      where: { storeId_productId: { storeId, productId } },
      include: {
        product: {
          include: {
            category: true,
            brand: true,
            supplier: true,
            unit: true,
            images: true,
            tags: { include: { tag: true } },
            variants: { include: { attributes: true } },
          },
        },
      },
    });
    if (!storeProduct) throw new NotFoundException('Product not found in this store');
    return storeProduct;
  }

  async findByQrToken(qrToken: string) {
    const productQR = await this.prisma.productQR.findUnique({
      where: { qrToken },
      include: {
        product: { include: { category: true } },
        store: true,
      },
    });
    if (!productQR) throw new NotFoundException('Invalid QR code');

    const storeProduct = await this.prisma.storeProduct.findUnique({
      where: { storeId_productId: { storeId: productQR.storeId, productId: productQR.productId } },
    });

    return { product: productQR.product, store: productQR.store, storeProduct };
  }

  async findByBarcode(barcode: string) {
    const product = await this.prisma.product.findFirst({
      where: { barcode },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Product not found by barcode');
    return product;
  }

  async search(query: string, page: number = 1, limit: number = 20) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { sku: { contains: query } },
            { barcode: { contains: query } },
            { description: { contains: query } },
          ],
        },
        include: { category: true },
        skip,
        take: l,
      }),
      this.prisma.product.count({
        where: {
          OR: [
            { name: { contains: query } },
            { sku: { contains: query } },
            { barcode: { contains: query } },
          ],
        },
      }),
    ]);
    return { data: products, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
  }

  async create(dto: CreateProductDto) {
    const sku = dto.sku || `PRD-${Date.now().toString(36).toUpperCase()}`;
    const barcode = dto.barcode || await this.generateBarcode();
    return this.prisma.product.create({
      data: {
        sku,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        currency: dto.currency || 'TRY',
        vatRate: dto.vatRate ?? 20,
        barcode,
        weight: dto.weight,
        volume: dto.volume,
        country: dto.country,
        origin: dto.origin,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
        supplierId: dto.supplierId,
        unitId: dto.unitId,
        isActive: dto.isActive ?? true,
      },
    });
  }

  private async generateBarcode(): Promise<string> {
    const prefix = '869'; // Turkey EAN-13 prefix
    let barcode: string;
    let exists = true;
    while (exists) {
      const body = prefix + Math.random().toString().slice(2, 12).padEnd(9, '0');
      const checkDigit = this.calculateEan13CheckDigit(body);
      barcode = body + checkDigit;
      const existing = await this.prisma.product.findFirst({ where: { barcode } });
      exists = !!existing;
    }
    return barcode!;
  }

  private calculateEan13CheckDigit(code: string): string {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
    }
    return ((10 - (sum % 10)) % 10).toString();
  }

  async assignBarcodes() {
    const products = await this.prisma.product.findMany({ where: { barcode: null } });
    const updated: Array<{ id: string; name: string; barcode: string }> = [];
    for (const product of products) {
      const barcode = await this.generateBarcode();
      await this.prisma.product.update({ where: { id: product.id }, data: { barcode } });
      updated.push({ id: product.id, name: product.name, barcode });
    }
    return { updated: updated.length, products: updated };
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return this.prisma.product.delete({ where: { id } });
  }

  // Brands
  async findAllBrands() {
    return this.prisma.brand.findMany({ include: { _count: { select: { products: true } } } });
  }
  async createBrand(data: { name: string; logoUrl?: string }) {
    return this.prisma.brand.create({ data });
  }
  async updateBrand(id: string, data: any) {
    return this.prisma.brand.update({ where: { id }, data });
  }
  async removeBrand(id: string) {
    return this.prisma.brand.delete({ where: { id } });
  }

  // Suppliers
  async findAllSuppliers() {
    return this.prisma.supplier.findMany({ include: { _count: { select: { products: true, batches: true } } } });
  }
  async createSupplier(data: any) {
    return this.prisma.supplier.create({ data });
  }
  async updateSupplier(id: string, data: any) {
    return this.prisma.supplier.update({ where: { id }, data });
  }
  async removeSupplier(id: string) {
    return this.prisma.supplier.delete({ where: { id } });
  }

  // Units
  async findAllUnits() {
    return this.prisma.unit.findMany();
  }
  async createUnit(data: { name: string; symbol?: string }) {
    return this.prisma.unit.create({ data });
  }

  // Tags
  async findAllTags() {
    return this.prisma.tag.findMany({ include: { _count: { select: { products: true } } } });
  }
  async createTag(data: { name: string; color?: string }) {
    return this.prisma.tag.create({ data });
  }
  async addTagToProduct(productId: string, tagId: string) {
    return this.prisma.productTag.create({ data: { productId, tagId } });
  }
  async removeTagFromProduct(productId: string, tagId: string) {
    return this.prisma.productTag.delete({ where: { productId_tagId: { productId, tagId } } });
  }

  // Images
  async addImage(productId: string, data: { url: string; alt?: string; isPrimary?: boolean }) {
    return this.prisma.productImage.create({ data: { productId, ...data } });
  }
  async removeImage(id: string) {
    return this.prisma.productImage.delete({ where: { id } });
  }

  // Variants
  async createVariant(productId: string, data: { name: string; sku: string; barcode?: string; price: number }) {
    return this.prisma.productVariant.create({ data: { productId, ...data } });
  }
  async updateVariant(id: string, data: any) {
    return this.prisma.productVariant.update({ where: { id }, data });
  }
  async removeVariant(id: string) {
    return this.prisma.productVariant.delete({ where: { id } });
  }
}
