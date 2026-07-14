import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get('scan/:qrToken')
  @Public()
  @ApiOperation({ summary: 'QR kod tarama sonucu' })
  async scan(@Param('qrToken') qrToken: string) {
    return this.productsService.findByQrToken(qrToken);
  }

  @Get('barcode/:barcode')
  @Public()
  @ApiOperation({ summary: 'Barkod ile ürün bul' })
  async findByBarcode(@Param('barcode') barcode: string) {
    return this.productsService.findByBarcode(barcode);
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Ürün ara' })
  @ApiQuery({ name: 'q', required: true, type: String })
  async search(@Query('q') q: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.productsService.search(q, page ? +page : 1, limit ? +limit : 20);
  }

  @Post('assign-barcodes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Barkodsuz ürünlere otomatik barkod ata' })
  assignBarcodes() { return this.productsService.assignBarcodes(); }

  @Get(':storeId')
  @Public()
  @ApiOperation({ summary: 'Mağazadaki ürünleri listele' })
  async findAll(
    @Param('storeId') storeId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.productsService.findAll(storeId, page ? +page : 1, limit ? +limit : 20, search);
  }

  @Get(':storeId/:productId')
  @Public()
  @ApiOperation({ summary: 'Ürün detayı' })
  async findOne(@Param('storeId') storeId: string, @Param('productId') productId: string) {
    return this.productsService.findOne(storeId, productId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yeni ürün oluştur' })
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ürün güncelle' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ürün sil' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }

  // Brands
  @Get('brands/all')
  @Public()
  @ApiOperation({ summary: 'Markaları listele' })
  findAllBrands() { return this.productsService.findAllBrands(); }

  @Post('brands')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marka oluştur' })
  createBrand(@Body() body: { name: string; logoUrl?: string }) { return this.productsService.createBrand(body); }

  @Put('brands/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  updateBrand(@Param('id') id: string, @Body() body: any) { return this.productsService.updateBrand(id, body); }

  @Delete('brands/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  removeBrand(@Param('id') id: string) { return this.productsService.removeBrand(id); }

  // Suppliers
  @Get('suppliers/all')
  @Public()
  @ApiOperation({ summary: 'Tedarikçileri listele' })
  findAllSuppliers() { return this.productsService.findAllSuppliers(); }

  @Post('suppliers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  createSupplier(@Body() body: any) { return this.productsService.createSupplier(body); }

  @Put('suppliers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  updateSupplier(@Param('id') id: string, @Body() body: any) { return this.productsService.updateSupplier(id, body); }

  @Delete('suppliers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  removeSupplier(@Param('id') id: string) { return this.productsService.removeSupplier(id); }

  // Units
  @Get('units/all')
  @Public()
  findAllUnits() { return this.productsService.findAllUnits(); }

  @Post('units')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  createUnit(@Body() body: { name: string; symbol?: string }) { return this.productsService.createUnit(body); }

  // Tags
  @Get('tags/all')
  @Public()
  findAllTags() { return this.productsService.findAllTags(); }

  @Post('tags')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  createTag(@Body() body: { name: string; color?: string }) { return this.productsService.createTag(body); }

  @Post(':productId/tags/:tagId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  addTagToProduct(@Param('productId') productId: string, @Param('tagId') tagId: string) {
    return this.productsService.addTagToProduct(productId, tagId);
  }

  @Delete(':productId/tags/:tagId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  removeTagFromProduct(@Param('productId') productId: string, @Param('tagId') tagId: string) {
    return this.productsService.removeTagFromProduct(productId, tagId);
  }

  // Images
  @Post(':productId/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  addImage(@Param('productId') productId: string, @Body() body: { url: string; alt?: string; isPrimary?: boolean }) {
    return this.productsService.addImage(productId, body);
  }

  @Delete('images/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  removeImage(@Param('id') id: string) { return this.productsService.removeImage(id); }

  // Variants
  @Post(':productId/variants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  createVariant(@Param('productId') productId: string, @Body() body: any) {
    return this.productsService.createVariant(productId, body);
  }

  @Put('variants/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  updateVariant(@Param('id') id: string, @Body() body: any) { return this.productsService.updateVariant(id, body); }

  @Delete('variants/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  removeVariant(@Param('id') id: string) { return this.productsService.removeVariant(id); }
}
