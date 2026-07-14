import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pricing } from './pricing.entity';

@Entity('pricing_tiers')
export class PricingTier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'pricing_id', type: 'uuid' })
  pricingId: string;

  @Column({ name: 'min_quantity', type: 'integer' })
  minQuantity: number;

  @Column({ name: 'max_quantity', type: 'integer', nullable: true })
  maxQuantity: number;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  unitPrice: number;

  @Column({
    name: 'margin_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  marginPercentage: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Pricing, (pricing) => pricing.tiers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pricing_id' })
  pricing: Pricing;
}