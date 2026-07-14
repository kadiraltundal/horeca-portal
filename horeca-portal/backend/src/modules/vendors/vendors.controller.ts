import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';

@Controller('vendors')
@UseGuards(JwtAuthGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  async create(@Request() req: any, @Body() createVendorDto: CreateVendorDto) {
    return this.vendorsService.create(req.user.id, createVendorDto);
  }

  @Get()
  async findAll() {
    return this.vendorsService.findAll();
  }

  @Get('my')
  async findMyVendors(@Request() req: any) {
    return this.vendorsService.findByUser(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(id);
  }

  @Put(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approve(@Param('id') id: string) {
    return this.vendorsService.approve(id);
  }

  @Put(':id/reject')
  @HttpCode(HttpStatus.OK)
  async reject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.vendorsService.reject(id, reason);
  }

  @Put(':id/suspend')
  @HttpCode(HttpStatus.OK)
  async suspend(@Param('id') id: string, @Body('reason') reason: string) {
    return this.vendorsService.suspend(id, reason);
  }

  @Post(':id/products')
  async addProduct(
    @Param('id') id: string,
    @Body('productId') productId: string,
    @Body('customPrice') customPrice?: number,
  ) {
    return this.vendorsService.addProduct(id, productId, customPrice);
  }

  @Delete(':id/products/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeProduct(@Param('id') id: string, @Param('productId') productId: string) {
    await this.vendorsService.removeProduct(id, productId);
  }
}
