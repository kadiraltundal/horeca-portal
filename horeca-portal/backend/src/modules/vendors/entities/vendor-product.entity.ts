import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vendor } from './vendor.entity';
import { Product } from '../../products/entities/product.entity';

export enum VendorProductStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('vendor_products')
export class VendorProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vendor_id', type: 'uuid' })
  vendorId: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({
    name: 'vendor_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  vendorPrice: number;

  @Column({ name: 'vendor_sku', type: 'varchar', length: 100, nullable: true })
  vendorSku: string;

  @Column({ name: 'stock_quantity', type: 'integer', default: 0 })
  stockQuantity: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: VendorProductStatus.PENDING,
  })
  status: VendorProductStatus;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Vendor, (vendor) => vendor.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
