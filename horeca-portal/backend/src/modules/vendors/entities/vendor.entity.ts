import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { VendorProduct } from './vendor-product.entity';

export enum VendorStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export enum VendorType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
}

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: VendorStatus.PENDING,
  })
  status: VendorStatus;

  @Column({
    type: 'varchar',
    length: 20,
    default: VendorType.COMPANY,
  })
  type: VendorType;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl: string;

  @Column({ name: 'banner_url', type: 'varchar', length: 500, nullable: true })
  bannerUrl: string;

  @Column({ name: 'phone', type: 'varchar', length: 200, nullable: true })
  phone: string;

  @Column({ name: 'email', type: 'varchar', length: 200, nullable: true })
  email: string;

  @Column({ name: 'address', type: 'text', nullable: true })
  address: string;

  @Column({ name: 'city', type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ name: 'country', type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({
    name: 'commission_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  commissionRate: number;

  @Column({ name: 'tax_number', type: 'varchar', length: 50, nullable: true })
  taxNumber: string;

  @Column({ name: 'bank_account', type: 'text', nullable: true })
  bankAccount: string;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  rating: number;

  @Column({ name: 'total_sales', type: 'integer', default: 0 })
  totalSales: number;

  @Column({ name: 'total_revenue', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalRevenue: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => VendorProduct, (vp) => vp.vendor, { cascade: true })
  products: VendorProduct[];
}
