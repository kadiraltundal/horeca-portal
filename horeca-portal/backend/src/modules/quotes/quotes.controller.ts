import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Request,
} from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permission.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Permission } from '../../common/types/permission.types';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  @RequirePermissions(Permission.QUOTES_READ)
  findAll(@Request() req: any) {
    return this.quotesService.findByUser(req.user.id);
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermissions(Permission.QUOTES_READ)
  findAllAdmin() {
    return this.quotesService.findAll();
  }

  @Get(':id')
  @RequirePermissions(Permission.QUOTES_READ)
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.quotesService.findOne(id);
  }

  @Post()
  @RequirePermissions(Permission.QUOTES_CREATE)
  create(@Request() req: any, @Body() createQuoteDto: CreateQuoteDto) {
    return this.quotesService.create(req.user.id, createQuoteDto);
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermissions(Permission.QUOTES_UPDATE)
  updateStatus(
    @Param('id') id: string,
    @Body() updateQuoteStatusDto: UpdateQuoteStatusDto,
  ) {
    return this.quotesService.updateStatus(id, updateQuoteStatusDto);
  }

  @Post(':id/repeat')
  @RequirePermissions(Permission.QUOTES_CREATE)
  repeatQuote(@Request() req: any, @Param('id') id: string) {
    return this.quotesService.repeatQuote(id, req.user.id);
  }
}
