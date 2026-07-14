import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';
import { ProductAttribute } from '../products/entities/product-attribute.entity';
import { Category } from '../categories/entities/category.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Pricing } from '../pricing/entities/pricing.entity';
import { PricingTier } from '../pricing/entities/pricing-tier.entity';
import { PricingService } from '../pricing/pricing.service';

export interface ImportProductRow {
  sku: string;
  name_uz: string;
  name_ru?: string;
  description_uz?: string;
  description_ru?: string;
  category_name?: string;
  brand_name?: string;
  unit?: string;
  min_quantity?: number;
  max_quantity?: number;
  stock_status?: string;
  image_url?: string;
  cost_price: number;
  additional_costs?: number;
  margin_percentage: number;
  currency?: string;
  // Tier columns: tier1_min, tier1_max, tier1_price, tier2_min, tier2_max, tier2_price, etc.
  [key: string]: any;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  imported: number;
  skipped: number;
  errors: ImportError[];
  warnings: string[];
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  value?: any;
}

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private productImagesRepository: Repository<ProductImage>,
    @InjectRepository(ProductAttribute)
    private productAttributesRepository: Repository<ProductAttribute>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Brand)
    private brandsRepository: Repository<Brand>,
    @InjectRepository(Pricing)
    private pricingRepository: Repository<Pricing>,
    @InjectRepository(PricingTier)
    private pricingTierRepository: Repository<PricingTier>,
    private pricingService: PricingService,
    private dataSource: DataSource,
  ) {}

  async importProducts(rows: ImportProductRow[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      totalRows: rows.length,
      imported: 0,
      skipped: 0,
      errors: [],
      warnings: [],
    };

    // Use transaction for data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2; // Excel row (1-indexed + header)

        try {
          // Validate required fields
          if (!row.sku || !row.name_uz || !row.cost_price || row.margin_percentage === undefined) {
            result.errors.push({
              row: rowNum,
              message: `Required fields missing: sku, name_uz, cost_price, margin_percentage`,
            });
            result.skipped++;
            continue;
          }

          // Check if product already exists by SKU
          const existingProduct = await this.productsRepository.findOne({
            where: { sku: row.sku },
          });

          if (existingProduct) {
            result.warnings.push(`Row ${rowNum}: SKU '${row.sku}' already exists, updating...`);
            // Update existing product
            await this.updateExistingProduct(existingProduct, row, rowNum, result);
          } else {
            // Create new product
            await this.createNewProduct(row, rowNum, result);
          }

          result.imported++;
        } catch (error) {
          this.logger.error(`Error importing row ${rowNum}: ${error.message}`);
          result.errors.push({
            row: rowNum,
            message: error.message,
          });
          result.skipped++;
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      result.success = false;
      result.errors.push({
        row: 0,
        message: `Transaction failed: ${error.message}`,
      });
    } finally {
      await queryRunner.release();
    }

    return result;
  }

  private async createNewProduct(
    row: ImportProductRow,
    rowNum: number,
    result: ImportResult,
  ): Promise<void> {
    // Find or create category
    let categoryId: string | null = null;
    if (row.category_name) {
      const category = await this.findOrCreateCategory(row.category_name);
      categoryId = category.id;
    }

    // Find or create brand
    let brandId: string | null = null;
    if (row.brand_name) {
      const brand = await this.findOrCreateBrand(row.brand_name);
      brandId = brand.id;
    }

    // Create product
    const productEntity = this.productsRepository.create({
      sku: row.sku,
      nameUz: row.name_uz,
      nameRu: row.name_ru,
      descriptionUz: row.description_uz,
      descriptionRu: row.description_ru,
      categoryId,
      brandId,
      unit: (row.unit as any) || 'piece',
      minQuantity: row.min_quantity || 1,
      maxQuantity: row.max_quantity,
      stockStatus: (row.stock_status as any) || 'in_stock',
      isActive: true,
    } as Product);

    const savedProduct: Product = await this.productsRepository.save(productEntity) as unknown as Product;

    // Create product image if provided
    if (row.image_url) {
      const image = this.productImagesRepository.create({
        productId: savedProduct.id,
        imageUrl: row.image_url,
        altText: row.name_uz,
        sortOrder: 0,
        isPrimary: true,
      });
      await this.productImagesRepository.save(image);
    }

    // Create pricing
    await this.createPricing(savedProduct.id, row, rowNum, result);
  }

  private async updateExistingProduct(
    product: Product,
    row: ImportProductRow,
    rowNum: number,
    result: ImportResult,
  ): Promise<void> {
    // Update product fields
    product.nameUz = row.name_uz;
    if (row.name_ru) product.nameRu = row.name_ru;
    if (row.description_uz) product.descriptionUz = row.description_uz;
    if (row.description_ru) product.descriptionRu = row.description_ru;
    if (row.unit) product.unit = row.unit as any;
    if (row.min_quantity) product.minQuantity = row.min_quantity;
    if (row.max_quantity) product.maxQuantity = row.max_quantity;
    if (row.stock_status) product.stockStatus = row.stock_status as any;

    // Update category if provided
    if (row.category_name) {
      const category = await this.findOrCreateCategory(row.category_name);
      product.categoryId = category.id;
    }

    // Update brand if provided
    if (row.brand_name) {
      const brand = await this.findOrCreateBrand(row.brand_name);
      product.brandId = brand.id;
    }

    await this.productsRepository.save(product);

    // Update pricing
    await this.updatePricing(product.id, row, rowNum, result);
  }

  private async createPricing(
    productId: string,
    row: ImportProductRow,
    rowNum: number,
    result: ImportResult,
  ): Promise<void> {
    // Calculate selling price
    const sellingPrice = this.pricingService.calculateSellingPrice(
      row.cost_price,
      row.additional_costs || 0,
      row.margin_percentage,
    );

    const pricing = this.pricingRepository.create({
      productId,
      costPrice: row.cost_price,
      additionalCosts: row.additional_costs || 0,
      marginPercentage: row.margin_percentage,
      sellingPrice,
      currency: (row.currency as any) || 'UZS',
      isActive: true,
    });

    const savedPricing = await this.pricingRepository.save(pricing);

    // Parse and create tiers from dynamic columns
    const tiers = this.parseTiersFromRow(row);
    if (tiers.length > 0) {
      const pricingTiers = tiers.map((tier) =>
        this.pricingTierRepository.create({
          pricingId: savedPricing.id,
          minQuantity: tier.minQuantity,
          maxQuantity: tier.maxQuantity,
          unitPrice: tier.unitPrice,
          marginPercentage: tier.marginPercentage,
        }),
      );
      await this.pricingTierRepository.save(pricingTiers);
    }
  }

  private async updatePricing(
    productId: string,
    row: ImportProductRow,
    rowNum: number,
    result: ImportResult,
  ): Promise<void> {
    // Find existing pricing
    const existingPricing = await this.pricingRepository.findOne({
      where: { productId, isActive: true },
    });

    if (existingPricing) {
      // Update existing pricing
      existingPricing.costPrice = row.cost_price;
      existingPricing.additionalCosts = row.additional_costs || 0;
      existingPricing.marginPercentage = row.margin_percentage;
      existingPricing.sellingPrice = this.pricingService.calculateSellingPrice(
        row.cost_price,
        row.additional_costs || 0,
        row.margin_percentage,
      );
      if (row.currency) existingPricing.currency = row.currency as any;

      await this.pricingRepository.save(existingPricing);

      // Update tiers
      const tiers = this.parseTiersFromRow(row);
      if (tiers.length > 0) {
        // Delete existing tiers
        await this.pricingTierRepository.delete({ pricingId: existingPricing.id });

        // Create new tiers
        const pricingTiers = tiers.map((tier) =>
          this.pricingTierRepository.create({
            pricingId: existingPricing.id,
            minQuantity: tier.minQuantity,
            maxQuantity: tier.maxQuantity,
            unitPrice: tier.unitPrice,
            marginPercentage: tier.marginPercentage,
          }),
        );
        await this.pricingTierRepository.save(pricingTiers);
      }
    } else {
      // Create new pricing
      await this.createPricing(productId, row, rowNum, result);
    }
  }

  private parseTiersFromRow(row: ImportProductRow): {
    minQuantity: number;
    maxQuantity?: number;
    unitPrice: number;
    marginPercentage?: number;
  }[] {
    const tiers: {
      minQuantity: number;
      maxQuantity?: number;
      unitPrice: number;
      marginPercentage?: number;
    }[] = [];

    // Parse tier columns: tier1_min, tier1_max, tier1_price, tier2_min, etc.
    for (let i = 1; i <= 10; i++) {
      const minKey = `tier${i}_min`;
      const maxKey = `tier${i}_max`;
      const priceKey = `tier${i}_price`;
      const marginKey = `tier${i}_margin`;

      if (row[minKey] !== undefined && row[priceKey] !== undefined) {
        tiers.push({
          minQuantity: Number(row[minKey]),
          maxQuantity: row[maxKey] ? Number(row[maxKey]) : undefined,
          unitPrice: Number(row[priceKey]),
          marginPercentage: row[marginKey] ? Number(row[marginKey]) : undefined,
        });
      }
    }

    return tiers;
  }

  private async findOrCreateCategory(name: string): Promise<Category> {
    // Try to find by name (case-insensitive)
    let category = await this.categoriesRepository
      .createQueryBuilder('cat')
      .where('LOWER(cat.name_uz) = LOWER(:name)', { name })
      .getOne();

    if (!category) {
      // Create new category
      const slug = this.generateSlug(name);
      category = this.categoriesRepository.create({
        nameUz: name,
        slug,
        isActive: true,
      });
      category = await this.categoriesRepository.save(category);
      this.logger.log(`Created new category: ${name}`);
    }

    return category;
  }

  private async findOrCreateBrand(name: string): Promise<Brand> {
    // Try to find by name (case-insensitive)
    let brand = await this.brandsRepository
      .createQueryBuilder('brand')
      .where('LOWER(brand.name) = LOWER(:name)', { name })
      .getOne();

    if (!brand) {
      // Create new brand
      const slug = this.generateSlug(name);
      brand = this.brandsRepository.create({
        name,
        slug,
        isActive: true,
      });
      brand = await this.brandsRepository.save(brand);
      this.logger.log(`Created new brand: ${name}`);
    }

    return brand;
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Generate CSV template for product import
   */
  getImportTemplate(): string {
    const headers = [
      'sku',
      'name_uz',
      'name_ru',
      'description_uz',
      'description_ru',
      'category_name',
      'brand_name',
      'unit',
      'min_quantity',
      'max_quantity',
      'stock_status',
      'image_url',
      'cost_price',
      'additional_costs',
      'margin_percentage',
      'currency',
      'tier1_min',
      'tier1_max',
      'tier1_price',
      'tier1_margin',
      'tier2_min',
      'tier2_max',
      'tier2_price',
      'tier2_margin',
      'tier3_min',
      'tier3_max',
      'tier3_price',
      'tier3_margin',
    ];

    // Sample row
    const sampleRow = [
      'CHEM-001',
      'Kir yuvish kukuni',
      'Стиральный порошок',
      'Professional kir yuvish kukuni',
      'Профессиональный стиральный порошок',
      'Kimyoviy mahsulotlar',
      'Tide',
      'kg',
      '1',
      '100',
      'in_stock',
      'https://example.com/image.jpg',
      '45000',
      '5000',
      '25',
      'UZS',
      '1',
      '10',
      '62500',
      '20',
      '11',
      '50',
      '56250',
      '15',
      '51',
      '',
      '53125',
      '10',
    ];

    return [headers.join(','), sampleRow.join(',')].join('\n');
  }
}
