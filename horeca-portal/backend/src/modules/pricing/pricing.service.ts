import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pricing } from './entities/pricing.entity';
import { PricingTier } from './entities/pricing-tier.entity';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  constructor(
    @InjectRepository(Pricing)
    private pricingRepository: Repository<Pricing>,
    @InjectRepository(PricingTier)
    private pricingTierRepository: Repository<PricingTier>,
  ) {}

  /**
   * Calculate selling price from cost components
   * Formula: sellingPrice = (costPrice + additionalCosts) * (1 + marginPercentage / 100)
   */
  calculateSellingPrice(
    costPrice: number,
    additionalCosts: number,
    marginPercentage: number,
  ): number {
    const totalCost = costPrice + additionalCosts;
    const sellingPrice = totalCost * (1 + marginPercentage / 100);
    return Math.round(sellingPrice * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate tier unit price from base selling price and tier margin
   */
  calculateTierPrice(
    baseSellingPrice: number,
    tierMarginPercentage?: number,
  ): number {
    if (tierMarginPercentage !== undefined && tierMarginPercentage !== null) {
      // Apply tier-specific margin on top of base cost
      return Math.round(baseSellingPrice * (1 - tierMarginPercentage / 100) * 100) / 100;
    }
    return baseSellingPrice;
  }

  async create(createPricingDto: CreatePricingDto): Promise<Pricing> {
    // Auto-calculate selling price
    const sellingPrice = this.calculateSellingPrice(
      createPricingDto.costPrice,
      createPricingDto.additionalCosts || 0,
      createPricingDto.marginPercentage,
    );

    const pricing = this.pricingRepository.create({
      ...createPricingDto,
      sellingPrice,
    });
    return this.pricingRepository.save(pricing);
  }

  async findByProduct(productId: string): Promise<Pricing | null> {
    return this.pricingRepository.findOne({
      where: { productId, isActive: true },
      relations: {
        tiers: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Pricing> {
    const pricing = await this.pricingRepository.findOne({
      where: { id },
      relations: {
        tiers: true,
        product: true,
      },
    });
    if (!pricing) {
      throw new NotFoundException('Pricing not found');
    }
    return pricing;
  }

  async update(id: string, updatePricingDto: UpdatePricingDto): Promise<Pricing> {
    const pricing = await this.findOne(id);

    // Merge updates
    const updatedData = { ...pricing, ...updatePricingDto };

    // Auto-calculate selling price if cost components changed
    if (
      updatePricingDto.costPrice !== undefined ||
      updatePricingDto.additionalCosts !== undefined ||
      updatePricingDto.marginPercentage !== undefined
    ) {
      const sellingPrice = this.calculateSellingPrice(
        updatedData.costPrice,
        updatedData.additionalCosts || 0,
        updatedData.marginPercentage,
      );
      updatedData.sellingPrice = sellingPrice;

      this.logger.log(
        `Auto-calculated selling price: ${sellingPrice} UZS for pricing ${id}`,
      );
    }

    Object.assign(pricing, updatedData);
    return this.pricingRepository.save(pricing);
  }

  async createWithTiers(
    createPricingDto: CreatePricingDto,
    tiers: { minQuantity: number; maxQuantity?: number; unitPrice?: number; marginPercentage?: number }[],
  ): Promise<Pricing> {
    // Auto-calculate selling price
    const sellingPrice = this.calculateSellingPrice(
      createPricingDto.costPrice,
      createPricingDto.additionalCosts || 0,
      createPricingDto.marginPercentage,
    );

    const pricing = this.pricingRepository.create({
      ...createPricingDto,
      sellingPrice,
    });
    const savedPricing = await this.pricingRepository.save(pricing);

    if (tiers && tiers.length > 0) {
      // Validate tier quantities are sequential
      this.validateTiers(tiers);

      const pricingTiers = tiers.map((tier) => {
        // Auto-calculate tier unit price if not provided
        const tierUnitPrice = tier.unitPrice !== undefined
          ? tier.unitPrice
          : this.calculateTierPrice(sellingPrice, tier.marginPercentage);

        return this.pricingTierRepository.create({
          pricingId: savedPricing.id,
          minQuantity: tier.minQuantity,
          maxQuantity: tier.maxQuantity,
          unitPrice: tierUnitPrice,
          marginPercentage: tier.marginPercentage,
        });
      });
      await this.pricingTierRepository.save(pricingTiers);
    }

    return this.findOne(savedPricing.id);
  }

  async updateTiers(
    pricingId: string,
    tiers: { minQuantity: number; maxQuantity?: number; unitPrice?: number; marginPercentage?: number }[],
  ): Promise<Pricing> {
    const pricing = await this.findOne(pricingId);

    // Delete existing tiers
    await this.pricingTierRepository.delete({ pricingId });

    if (tiers && tiers.length > 0) {
      this.validateTiers(tiers);

      const pricingTiers = tiers.map((tier) => {
        const tierUnitPrice = tier.unitPrice !== undefined
          ? tier.unitPrice
          : this.calculateTierPrice(pricing.sellingPrice, tier.marginPercentage);

        return this.pricingTierRepository.create({
          pricingId,
          minQuantity: tier.minQuantity,
          maxQuantity: tier.maxQuantity,
          unitPrice: tierUnitPrice,
          marginPercentage: tier.marginPercentage,
        });
      });
      await this.pricingTierRepository.save(pricingTiers);
    }

    return this.findOne(pricingId);
  }

  /**
   * Get the appropriate unit price for a given quantity
   */
  async getUnitPriceForQuantity(productId: string, quantity: number): Promise<number> {
    const pricing = await this.findByProduct(productId);
    if (!pricing) {
      throw new NotFoundException('Pricing not found for this product');
    }

    // Check if there's a matching tier
    if (pricing.tiers && pricing.tiers.length > 0) {
      const matchingTier = pricing.tiers.find(
        (tier) =>
          quantity >= tier.minQuantity &&
          (tier.maxQuantity === null || quantity <= tier.maxQuantity),
      );

      if (matchingTier) {
        return matchingTier.unitPrice;
      }
    }

    // Default to base selling price
    return pricing.sellingPrice;
  }

  private validateTiers(tiers: { minQuantity: number; maxQuantity?: number }[]): void {
    // Sort by minQuantity
    const sorted = [...tiers].sort((a, b) => a.minQuantity - b.minQuantity);

    for (let i = 0; i < sorted.length; i++) {
      const tier = sorted[i];

      if (tier.minQuantity <= 0) {
        throw new BadRequestException('Tier min quantity must be greater than 0');
      }

      if (tier.maxQuantity !== undefined && tier.maxQuantity !== null) {
        if (tier.maxQuantity < tier.minQuantity) {
          throw new BadRequestException('Tier max quantity must be greater than min quantity');
        }
      }

      // Check for gaps between tiers
      if (i > 0) {
        const prevTier = sorted[i - 1];
        if (prevTier.maxQuantity !== undefined && prevTier.maxQuantity !== null) {
          if (tier.minQuantity <= prevTier.maxQuantity) {
            throw new BadRequestException('Tier ranges must not overlap');
          }
        }
      }
    }
  }

  async remove(id: string): Promise<void> {
    const pricing = await this.findOne(id);
    pricing.isActive = false;
    await this.pricingRepository.save(pricing);
  }
}
