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
import { Product } from '../../products/entities/product.entity';
import { PricingTier } from './pricing-tier.entity';

export enum Currency {
  UZS = 'UZS',
  USD = 'USD',
}

@Entity('pricing')
export class Pricing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'cost_price', type: 'decimal', precision: 12, scale: 2 })
  costPrice: number;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.UZS,
  })
  currency: Currency;

  @Column({
    name: 'additional_costs',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  additionalCosts: number;

  @Column({
    name: 'margin_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  marginPercentage: number;

  @Column({
    name: 'selling_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  sellingPrice: number;

  @Column({ name: 'valid_from', type: 'timestamp', default: () => 'NOW()' })
  validFrom: Date;

  @Column({ name: 'valid_until', type: 'timestamp', nullable: true })
  validUntil: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Product, (product) => product.pricing, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @OneToMany(() => PricingTier, (tier) => tier.pricing)
  tiers: PricingTier[];
}