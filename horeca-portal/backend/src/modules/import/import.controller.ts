import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as csv from 'csv-parse/sync';
import { ImportService, ImportProductRow, ImportResult } from './import.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permission.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Permission } from '../../common/types/permission.types';

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('products')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermissions(Permission.IMPORT_CREATE)
  @UseInterceptors(FileInterceptor('file'))
  async importFromCsv(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImportResult> {
    if (!file) {
      return {
        success: false,
        totalRows: 0,
        imported: 0,
        skipped: 0,
        errors: [{ row: 0, message: 'No file uploaded' }],
        warnings: [],
      };
    }

    const validMimeTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/csv',
      'text/plain',
    ];

    if (!validMimeTypes.includes(file.mimetype) && !file.originalname.endsWith('.csv')) {
      return {
        success: false,
        totalRows: 0,
        imported: 0,
        skipped: 0,
        errors: [{ row: 0, message: 'Invalid file type. Please upload a CSV file.' }],
        warnings: [],
      };
    }

    try {
      const records = csv.parse(file.buffer.toString(), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });

      const rows: ImportProductRow[] = records.map((record: any) => ({
        sku: record.sku || record.SKU,
        name_uz: record.name_uz || record.name_UZ,
        name_ru: record.name_ru || record.name_RU,
        description_uz: record.description_uz,
        description_ru: record.description_ru,
        category_name: record.category_name || record.category,
        brand_name: record.brand_name || record.brand,
        unit: record.unit,
        min_quantity: record.min_quantity ? Number(record.min_quantity) : undefined,
        max_quantity: record.max_quantity ? Number(record.max_quantity) : undefined,
        stock_status: record.stock_status,
        image_url: record.image_url || record.image,
        cost_price: Number(record.cost_price),
        additional_costs: record.additional_costs ? Number(record.additional_costs) : undefined,
        margin_percentage: Number(record.margin_percentage),
        currency: record.currency,
        tier1_min: record.tier1_min ? Number(record.tier1_min) : undefined,
        tier1_max: record.tier1_max ? Number(record.tier1_max) : undefined,
        tier1_price: record.tier1_price ? Number(record.tier1_price) : undefined,
        tier1_margin: record.tier1_margin ? Number(record.tier1_margin) : undefined,
        tier2_min: record.tier2_min ? Number(record.tier2_min) : undefined,
        tier2_max: record.tier2_max ? Number(record.tier2_max) : undefined,
        tier2_price: record.tier2_price ? Number(record.tier2_price) : undefined,
        tier2_margin: record.tier2_margin ? Number(record.tier2_margin) : undefined,
        tier3_min: record.tier3_min ? Number(record.tier3_min) : undefined,
        tier3_max: record.tier3_max ? Number(record.tier3_max) : undefined,
        tier3_price: record.tier3_price ? Number(record.tier3_price) : undefined,
        tier3_margin: record.tier3_margin ? Number(record.tier3_margin) : undefined,
      }));

      return await this.importService.importProducts(rows);
    } catch (error) {
      return {
        success: false,
        totalRows: 0,
        imported: 0,
        skipped: 0,
        errors: [{ row: 0, message: `CSV parsing error: ${error.message}` }],
        warnings: [],
      };
    }
  }

  @Post('products/json')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermissions(Permission.IMPORT_CREATE)
  async importFromJson(
    @Body() body: { products: ImportProductRow[] },
  ): Promise<ImportResult> {
    if (!body.products || !Array.isArray(body.products)) {
      return {
        success: false,
        totalRows: 0,
        imported: 0,
        skipped: 0,
        errors: [{ row: 0, message: 'Invalid request body. Expected { products: ImportProductRow[] }' }],
        warnings: [],
      };
    }

    return await this.importService.importProducts(body.products);
  }

  @Get('template')
  @RequirePermissions(Permission.IMPORT_READ)
  getTemplate(@Res() res: Response) {
    const template = this.importService.getImportTemplate();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=horeca_product_template.csv');
    res.status(HttpStatus.OK).send(template);
  }
}
