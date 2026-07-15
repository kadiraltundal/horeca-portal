import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permission.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Permission } from '../../common/types/permission.types';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  findAll(@Query() queryDto: QueryProductDto) {
    return this.productsService.findAll(queryDto);
  }

  @Public()
  @Get('search')
  search(@Query('q') query: string, @Query('limit') limit?: number) {
    return this.productsService.search(query, limit);
  }

  @Public()
  @Get('autocomplete')
  autocomplete(@Query('q') query: string, @Query('limit') limit?: number) {
    return this.productsService.autocomplete(query, limit);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Public()
  @Get(':id/alternatives')
  findAlternatives(@Param('id') id: string) {
    return this.productsService.findAlternatives(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.VENDOR)
  @RequirePermissions(Permission.PRODUCTS_CREATE)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.VENDOR)
  @RequirePermissions(Permission.PRODUCTS_UPDATE)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @RequirePermissions(Permission.PRODUCTS_DELETE)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermissions(Permission.PRODUCTS_READ)
  getStats() {
    return this.productsService.getStats();
  }
}
