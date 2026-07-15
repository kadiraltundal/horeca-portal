import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permission.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Permission } from '../../common/types/permission.types';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @Roles(UserRole.CUSTOMER, UserRole.SUPPLIER)
  @RequirePermissions(Permission.VENDORS_CREATE)
  async create(@Request() req: any, @Body() createVendorDto: CreateVendorDto) {
    return this.vendorsService.create(req.user.id, createVendorDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermissions(Permission.VENDORS_READ)
  async findAll() {
    return this.vendorsService.findAll();
  }

  @Get('my')
  @RequirePermissions(Permission.VENDORS_READ)
  async findMyVendors(@Request() req: any) {
    return this.vendorsService.findByUser(req.user.id);
  }

  @Get(':id')
  @RequirePermissions(Permission.VENDORS_READ)
  async findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(id);
  }

  @Put(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermissions(Permission.VENDORS_APPROVE)
  @HttpCode(HttpStatus.OK)
  async approve(@Param('id') id: string) {
    return this.vendorsService.approve(id);
  }

  @Put(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermissions(Permission.VENDORS_APPROVE)
  @HttpCode(HttpStatus.OK)
  async reject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.vendorsService.reject(id, reason);
  }

  @Put(':id/suspend')
  @Roles(UserRole.ADMIN)
  @RequirePermissions(Permission.VENDORS_UPDATE)
  @HttpCode(HttpStatus.OK)
  async suspend(@Param('id') id: string, @Body('reason') reason: string) {
    return this.vendorsService.suspend(id, reason);
  }

  @Post(':id/products')
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @RequirePermissions(Permission.VENDORS_UPDATE)
  async addProduct(
    @Param('id') id: string,
    @Body('productId') productId: string,
    @Body('vendorPrice') vendorPrice: number,
    @Body('vendorSku') vendorSku?: string,
    @Body('stockQuantity') stockQuantity?: number,
  ) {
    return this.vendorsService.addProduct(id, productId, vendorPrice, vendorSku, stockQuantity);
  }

  @Delete(':id/products/:productId')
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @RequirePermissions(Permission.VENDORS_UPDATE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeProduct(@Param('id') id: string, @Param('productId') productId: string) {
    await this.vendorsService.removeProduct(id, productId);
  }
}
