import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor, VendorStatus } from './entities/vendor.entity';
import { VendorProduct, VendorProductStatus } from './entities/vendor-product.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';

@Injectable()
export class VendorsService {
  private readonly logger = new Logger(VendorsService.name);

  constructor(
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(VendorProduct)
    private vendorProductRepository: Repository<VendorProduct>,
  ) {}

  async create(userId: string, createVendorDto: CreateVendorDto): Promise<Vendor> {
    const slug = this.generateSlug(createVendorDto.name);
    const vendor = this.vendorRepository.create({
      userId,
      slug,
      ...createVendorDto,
    });

    this.logger.log(`Creating vendor for user ${userId}`);
    return this.vendorRepository.save(vendor);
  }

  async findAll(): Promise<Vendor[]> {
    return this.vendorRepository.find({
      relations: { user: true, products: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({
      where: { id },
      relations: { user: true, products: { product: true } },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  async findByUser(userId: string): Promise<Vendor[]> {
    return this.vendorRepository.find({
      where: { userId },
      relations: { products: true },
    });
  }

  async approve(id: string): Promise<Vendor> {
    const vendor = await this.findOne(id);
    vendor.status = VendorStatus.APPROVED;

    this.logger.log(`Approving vendor ${id}`);
    return this.vendorRepository.save(vendor);
  }

  async reject(id: string, reason: string): Promise<Vendor> {
    const vendor = await this.findOne(id);
    vendor.status = VendorStatus.REJECTED;

    return this.vendorRepository.save(vendor);
  }

  async suspend(id: string, reason: string): Promise<Vendor> {
    const vendor = await this.findOne(id);
    vendor.status = VendorStatus.SUSPENDED;

    return this.vendorRepository.save(vendor);
  }

  async addProduct(
    vendorId: string,
    productId: string,
    vendorPrice: number,
    vendorSku?: string,
    stockQuantity?: number,
  ): Promise<VendorProduct> {
    const vendorProduct = this.vendorProductRepository.create({
      vendorId,
      productId,
      vendorPrice,
      vendorSku,
      stockQuantity,
      status: VendorProductStatus.PENDING,
    });

    return this.vendorProductRepository.save(vendorProduct);
  }

  async updateProduct(
    vendorId: string,
    productId: string,
    updateData: Partial<Pick<VendorProduct, 'vendorPrice' | 'vendorSku' | 'stockQuantity' | 'status'>>,
  ): Promise<VendorProduct> {
    const vendorProduct = await this.vendorProductRepository.findOne({
      where: { vendorId, productId },
    });

    if (!vendorProduct) {
      throw new NotFoundException('Vendor product not found');
    }

    Object.assign(vendorProduct, updateData);
    return this.vendorProductRepository.save(vendorProduct);
  }

  async removeProduct(vendorId: string, productId: string): Promise<void> {
    await this.vendorProductRepository.delete({
      vendorId,
      productId,
    });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);
  }
}
