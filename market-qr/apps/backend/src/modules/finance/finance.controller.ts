import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Finance')
@Controller('finance')
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  // ===== Invoices =====

  @Get('invoices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Faturaları listele' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAllInvoices(
    @Query('storeId') storeId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.financeService.findAllInvoices({
      storeId,
      status,
      type,
      startDate,
      endDate,
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
    });
  }

  @Post('invoices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yeni fatura oluştur' })
  async createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.financeService.createInvoice(dto);
  }

  @Get('invoices/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fatura detayı' })
  async findOneInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.findOneInvoice(id);
  }

  @Put('invoices/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fatura durumunu güncelle' })
  async updateInvoiceStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ) {
    return this.financeService.updateInvoiceStatus(id, status);
  }

  // ===== Expenses =====

  @Get('expenses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Giderleri listele' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAllExpenses(
    @Query('storeId') storeId?: string,
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.financeService.findAllExpenses({
      storeId,
      status,
      categoryId,
      startDate,
      endDate,
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
    });
  }

  @Post('expenses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yeni gider oluştur' })
  async createExpense(@Body() dto: CreateExpenseDto) {
    return this.financeService.createExpense(dto);
  }

  @Put('expenses/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gider durumunu güncelle (onayla/reddet)' })
  async updateExpenseStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
    @Body('approvedBy') approvedBy?: string,
  ) {
    return this.financeService.updateExpenseStatus(id, status, approvedBy);
  }

  // ===== Reports =====

  @Get('tax-report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vergi raporu (aylık/yıllık)' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'month', required: false })
  async getTaxReport(
    @Query('storeId') storeId?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.financeService.getTaxReport({
      storeId,
      year: year ? +year : new Date().getFullYear(),
      month: month ? +month : undefined,
    });
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Finansal özet (gelir, gider, kâr)' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getSummary(
    @Query('storeId') storeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financeService.getSummary({ storeId, startDate, endDate });
  }
}
