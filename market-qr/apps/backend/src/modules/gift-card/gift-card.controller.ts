import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GiftCardService } from './gift-card.service';
import { CreateGiftCardDto } from './dto/create-gift-card.dto';
import { RedeemGiftCardDto } from './dto/redeem-gift-card.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Gift Cards')
@Controller('gift-cards')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GiftCardController {
  constructor(private giftCardService: GiftCardService) {}

  @Get()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Hediye kartları listesi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.giftCardService.findAll(
      page ? +page : 1,
      limit ? +limit : 20,
      status,
    );
  }

  @Get('stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Hediye kartı istatistikleri' })
  async getStats() {
    return this.giftCardService.getStats();
  }

  @Get(':code')
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'Hediye kartı detayı (kod ile)' })
  async findOne(@Param('code') code: string) {
    return this.giftCardService.findOne(code);
  }

  @Post()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Hediye kartı oluştur' })
  @ApiResponse({ status: 201, description: 'Hediye kartı başarıyla oluşturuldu' })
  async create(@Body() data: CreateGiftCardDto) {
    return this.giftCardService.create(data);
  }

  @Post(':code/redeem')
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'Hediye kartını kullan' })
  async redeem(@Param('code') code: string, @Body() data: RedeemGiftCardDto) {
    return this.giftCardService.redeem(code, data);
  }

  @Post(':code/activate')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Hediye kartını aktifleştir' })
  async activate(@Param('code') code: string) {
    return this.giftCardService.activate(code);
  }

  @Post(':code/cancel')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Hediye kartını iptal et' })
  async cancel(@Param('code') code: string) {
    return this.giftCardService.cancel(code);
  }

  @Get(':code/transactions')
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiOperation({ summary: 'Hediye kartı işlemleri' })
  async getTransactions(@Param('code') code: string) {
    return this.giftCardService.getTransactions(code);
  }
}
