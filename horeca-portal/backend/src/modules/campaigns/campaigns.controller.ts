import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permission.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Permission } from '../../common/types/permission.types';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Public()
  @Get()
  findActive() {
    return this.campaignsService.findActive();
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermissions(Permission.CAMPAIGNS_READ)
  findAll() {
    return this.campaignsService.findAll();
  }

  @Get('admin/stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermissions(Permission.REPORTS_READ)
  getStats() {
    return this.campaignsService.getStats();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Get(':id/products')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermissions(Permission.CAMPAIGNS_READ)
  getCampaignProducts(@Param('id') id: string) {
    return this.campaignsService.getCampaignProducts(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermissions(Permission.CAMPAIGNS_CREATE)
  create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignsService.create(createCampaignDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermissions(Permission.CAMPAIGNS_UPDATE)
  update(@Param('id') id: string, @Body() updateCampaignDto: UpdateCampaignDto) {
    return this.campaignsService.update(id, updateCampaignDto);
  }

  @Post(':id/products')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermissions(Permission.CAMPAIGNS_UPDATE)
  addProduct(
    @Param('id') id: string,
    @Body() body: { productId: string; campaignPrice?: number },
  ) {
    return this.campaignsService.addProduct(id, body.productId, body.campaignPrice);
  }

  @Delete(':id/products/:productId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermissions(Permission.CAMPAIGNS_UPDATE)
  removeProduct(@Param('id') id: string, @Param('productId') productId: string) {
    return this.campaignsService.removeProduct(id, productId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @RequirePermissions(Permission.CAMPAIGNS_DELETE)
  remove(@Param('id') id: string) {
    return this.campaignsService.remove(id);
  }
}
