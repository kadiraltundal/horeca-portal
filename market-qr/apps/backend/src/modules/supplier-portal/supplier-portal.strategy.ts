import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class SupplierPortalJwtStrategy extends PassportStrategy(Strategy, 'supplier-jwt') {
  constructor(private prisma: PrismaService, private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SUPPLIER_JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string; role: string; supplierId: string }) {
    const user = await this.prisma.supplierPortalUser.findUnique({
      where: { id: payload.sub },
      include: { supplier: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      supplierId: user.supplierId,
      supplier: user.supplier,
    };
  }
}
