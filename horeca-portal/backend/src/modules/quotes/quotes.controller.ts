import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('quotes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.quotesService.findByUser(req.user.id);
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  findAllAdmin() {
    return this.quotesService.findAll();
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.quotesService.findOne(id);
  }

  @Post()
  create(@Request() req: any, @Body() createQuoteDto: CreateQuoteDto) {
    return this.quotesService.create(req.user.id, createQuoteDto);
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() updateQuoteStatusDto: UpdateQuoteStatusDto,
  ) {
    return this.quotesService.updateStatus(id, updateQuoteStatusDto);
  }

  @Post(':id/repeat')
  repeatQuote(@Request() req: any, @Param('id') id: string) {
    return this.quotesService.repeatQuote(id, req.user.id);
  }
}