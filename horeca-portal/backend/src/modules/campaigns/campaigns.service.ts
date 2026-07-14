import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { CampaignProduct } from './entities/campaign-product.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
    @InjectRepository(CampaignProduct)
    private campaignProductsRepository: Repository<CampaignProduct>,
  ) {}

  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    const campaign = this.campaignsRepository.create(createCampaignDto);
    return this.campaignsRepository.save(campaign);
  }

  async findActive(): Promise<Campaign[]> {
    const now = new Date();
    return this.campaignsRepository.find({
      where: {
        isActive: true,
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
      relations: {
        products: {
          images: true,
          pricing: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<Campaign[]> {
    return this.campaignsRepository.find({
      relations: {
        products: {
          images: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.campaignsRepository.findOne({
      where: { id },
      relations: {
        products: {
          images: true,
          pricing: true,
        },
      },
    });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return campaign;
  }

  async update(id: string, updateCampaignDto: UpdateCampaignDto): Promise<Campaign> {
    const campaign = await this.findOne(id);
    Object.assign(campaign, updateCampaignDto);
    return this.campaignsRepository.save(campaign);
  }

  async remove(id: string): Promise<void> {
    const campaign = await this.findOne(id);
    campaign.isActive = false;
    await this.campaignsRepository.save(campaign);
  }

  async addProduct(campaignId: string, productId: string, campaignPrice?: number): Promise<CampaignProduct> {
    const campaign = await this.findOne(campaignId);

    // Check if product already in campaign
    const existing = await this.campaignProductsRepository.findOne({
      where: { campaignId, productId },
    });

    if (existing) {
      throw new BadRequestException('Product already in this campaign');
    }

    const campaignProduct = this.campaignProductsRepository.create({
      campaignId,
      productId,
      campaignPrice,
    });

    return this.campaignProductsRepository.save(campaignProduct);
  }

  async removeProduct(campaignId: string, productId: string): Promise<void> {
    const campaignProduct = await this.campaignProductsRepository.findOne({
      where: { campaignId, productId },
    });

    if (!campaignProduct) {
      throw new NotFoundException('Product not found in this campaign');
    }

    await this.campaignProductsRepository.remove(campaignProduct);
  }

  async getCampaignProducts(campaignId: string): Promise<CampaignProduct[]> {
    return this.campaignProductsRepository.find({
      where: { campaignId },
      relations: {
        product: true,
      },
    });
  }

  async getStats() {
    const totalCampaigns = await this.campaignsRepository.count();
    const activeCampaigns = await this.campaignsRepository.count({
      where: { isActive: true },
    });

    const now = new Date();
    const ongoingCampaigns = await this.campaignsRepository.count({
      where: {
        isActive: true,
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
    });

    return {
      totalCampaigns,
      activeCampaigns,
      ongoingCampaigns,
    };
  }
}