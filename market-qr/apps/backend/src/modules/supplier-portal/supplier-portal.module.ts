import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SupplierPortalController } from './supplier-portal.controller';
import { SupplierPortalService } from './supplier-portal.service';
import { SupplierPortalJwtStrategy } from './supplier-portal.strategy';
import { PrismaService } from '../../config/prisma.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'supplier-jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('SUPPLIER_JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SupplierPortalController],
  providers: [SupplierPortalService, SupplierPortalJwtStrategy, PrismaService],
  exports: [SupplierPortalService, JwtModule],
})
export class SupplierPortalModule {}
