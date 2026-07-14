import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Not } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CacheService } from '../../common/services/cache.service';

@Injectable()
export class ProductsService {
  private readonly CACHE_TTL = 300000; // 5 minutes

  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private productImagesRepository: Repository<ProductImage>,
    @InjectRepository(ProductAttribute)
    private productAttributesRepository: Repository<ProductAttribute>,
    private cacheService: CacheService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  async findAll(queryDto: QueryProductDto) {
    const { page = 1, limit = 20, search, categoryId, brandId, sortBy = 'createdAt', sortOrder = 'DESC' } = queryDto;

    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.pricing', 'pricing')
      .where('product.isActive = :isActive', { isActive: true });

    if (search) {
      queryBuilder.andWhere(
        '(product.nameUz ILIKE :search OR product.nameRu ILIKE :search OR product.sku ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (brandId) {
      queryBuilder.andWhere('product.brandId = :brandId', { brandId });
    }

    const [items, total] = await queryBuilder
      .orderBy(`product.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Product> {
    const cacheKey = `product:${id}`;
    const cached = await this.cacheService.get<Product>(cacheKey);
    if (cached) {
      return cached;
    }

    const product = await this.productsRepository.findOne({
      where: { id },
      relations: {
        category: true,
        brand: true,
        images: true,
        attributes: true,
        pricing: {
          tiers: true,
        },
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.cacheService.set(cacheKey, product, this.CACHE_TTL);
    return product;
  }

  async findBySku(sku: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { sku },
      relations: {
        category: true,
        brand: true,
        images: true,
        attributes: true,
        pricing: true,
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findAlternatives(id: string): Promise<Product[]> {
    const product = await this.findOne(id);
    return this.productsRepository.find({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        id: Not(id),
      },
      relations: {
        images: true,
        pricing: true,
      },
      take: 6,
    });
  }

  async search(query: string, limit: number = 20) {
    return this.productsRepository.find({
      where: [
        { nameUz: Like(`%${query}%`), isActive: true },
        { nameRu: Like(`%${query}%`), isActive: true },
        { sku: Like(`%${query}%`), isActive: true },
      ],
      relations: {
        images: true,
        pricing: true,
      },
      take: limit,
    });
  }

  async autocomplete(query: string, limit: number = 10) {
    if (!query || query.length < 2) {
      return [];
    }

    const products = await this.productsRepository
      .createQueryBuilder('product')
      .select([
        'product.id',
        'product.nameUz',
        'product.nameRu',
        'product.sku',
      ])
      .leftJoin('product.images', 'image')
      .addSelect('image.imageUrl', 'imageUrl')
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere(
        '(product.nameUz ILIKE :query OR product.nameRu ILIKE :query OR product.sku ILIKE :query)',
        { query: `%${query}%` },
      )
      .groupBy('product.id')
      .addGroupBy('image.imageUrl')
      .limit(limit)
      .getRawMany();

    return products.map((p) => ({
      id: p.product_id,
      nameUz: p.product_name_uz,
      nameRu: p.product_name_ru,
      sku: p.product_sku,
      imageUrl: p.imageUrl,
    }));
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    product.isActive = false;
    await this.productsRepository.save(product);
  }

  async getStats() {
    const totalProducts = await this.productsRepository.count();
    const activeProducts = await this.productsRepository.count({
      where: { isActive: true },
    });
    const outOfStock = await this.productsRepository.count({
      where: { stockStatus: 'out_of_stock' as any },
    });

    return {
      totalProducts,
      activeProducts,
      outOfStock,
    };
  }
}