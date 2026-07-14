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
import { Category } from '../../categories/entities/category.entity';
import { Brand } from '../../brands/entities/brand.entity';
import { ProductImage } from './product-image.entity';
import { ProductAttribute } from './product-attribute.entity';
import { Pricing } from '../../pricing/entities/pricing.entity';

export enum ProductUnit {
  PIECE = 'piece',
  KG = 'kg',
  LITER = 'liter',
  BOX = 'box',
  SET = 'set',
}

export enum StockStatus {
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
  LIMITED = 'limited',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string;

  @Column({ name: 'brand_id', type: 'uuid', nullable: true })
  brandId: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @Column({ name: 'name_uz', type: 'varchar', length: 300 })
  nameUz: string;

  @Column({ name: 'name_ru', type: 'varchar', length: 300, nullable: true })
  nameRu: string;

  @Column({ name: 'description_uz', type: 'text', nullable: true })
  descriptionUz: string;

  @Column({ name: 'description_ru', type: 'text', nullable: true })
  descriptionRu: string;

  @Column({
    type: 'enum',
    enum: ProductUnit,
    default: ProductUnit.PIECE,
  })
  unit: ProductUnit;

  @Column({ name: 'min_quantity', type: 'integer', default: 1 })
  minQuantity: number;

  @Column({ name: 'max_quantity', type: 'integer', nullable: true })
  maxQuantity: number;

  @Column({
    name: 'stock_status',
    type: 'enum',
    enum: StockStatus,
    default: StockStatus.IN_STOCK,
  })
  stockStatus: StockStatus;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Brand, (brand) => brand.products, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];

  @OneToMany(() => ProductAttribute, (attr) => attr.product)
  attributes: ProductAttribute[];

  @OneToMany(() => Pricing, (pricing) => pricing.product)
  pricing: Pricing[];
}