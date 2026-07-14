import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor, VendorStatus } from './entities/vendor.entity';
import { VendorProduct } from './entities/vendor-product.entity';
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
    const vendor = this.vendorRepository.create({
      userId,
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
    vendor.approvedAt = new Date();

    this.logger.log(`Approving vendor ${id}`);
    return this.vendorRepository.save(vendor);
  }

  async reject(id: string, reason: string): Promise<Vendor> {
    const vendor = await this.findOne(id);
    vendor.status = VendorStatus.REJECTED;
    vendor.suspendReason = reason;

    return this.vendorRepository.save(vendor);
  }

  async suspend(id: string, reason: string): Promise<Vendor> {
    const vendor = await this.findOne(id);
    vendor.status = VendorStatus.SUSPENDED;
    vendor.suspendedAt = new Date();
    vendor.suspendReason = reason;

    return this.vendorRepository.save(vendor);
  }

  async addProduct(vendorId: string, productId: string, customPrice?: number): Promise<VendorProduct> {
    const vendorProduct = this.vendorProductRepository.create({
      vendorId,
      productId,
      customPrice,
    });

    return this.vendorProductRepository.save(vendorProduct);
  }

  async removeProduct(vendorId: string, productId: string): Promise<void> {
    await this.vendorProductRepository.delete({
      vendorId,
      productId,
    });
  }
}
