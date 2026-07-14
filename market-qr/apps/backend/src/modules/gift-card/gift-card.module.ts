import { Module } from '@nestjs/common';
import { GiftCardService } from './gift-card.service';
import { GiftCardController } from './gift-card.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [GiftCardController],
  providers: [GiftCardService, PrismaService],
  exports: [GiftCardService],
})
export class GiftCardModule {}
