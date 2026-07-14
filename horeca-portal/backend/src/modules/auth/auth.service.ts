import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { UsersService } from '../users/users.service';
import { TelegramLoginDto } from './dto/telegram-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateTelegramLogin(telegramLoginDto: TelegramLoginDto) {
    const { initData } = telegramLoginDto;

    // Validate Telegram initData
    const isValid = this.validateTelegramData(initData);
    if (!isValid) {
      throw new UnauthorizedException('Invalid Telegram data');
    }

    // Parse initData
    const data = this.parseInitData(initData);
    const telegramId = parseInt(data.user.id);

    // Find or create user
    let user = await this.usersService.findByTelegramId(telegramId);
    if (!user) {
      user = await this.usersService.create({
        telegramId,
        username: data.user.username,
        firstName: data.user.first_name,
        lastName: data.user.last_name,
      });
    } else {
      // Update user info if changed
      await this.usersService.update(user.id, {
        username: data.user.username,
        firstName: data.user.first_name,
        lastName: data.user.last_name,
      });
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.role);

    return {
      user,
      ...tokens,
    };
  }

  private validateTelegramData(initData: string): boolean {
    const botToken = this.configService.get('TELEGRAM_BOT_TOKEN');
    const appEnv = this.configService.get('APP_ENV', 'development');

    // In development mode, skip Telegram validation for mock data
    if (appEnv === 'development' && initData.includes('hash=test')) {
      return true;
    }

    const dataMap = new URLSearchParams(initData);
    const hash = dataMap.get('hash');
    dataMap.delete('hash');

    if (!hash) {
      return false;
    }

    // Sort parameters
    const dataCheckString = Array.from(dataMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create HMAC
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const hmac = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Compare hashes - must be same length
    if (hmac.length !== hash.length) {
      return false;
    }

    return timingSafeEqual(Buffer.from(hmac), Buffer.from(hash));
  }

  private parseInitData(initData: string) {
    const dataMap = new URLSearchParams(initData);
    const userStr = dataMap.get('user');
    if (!userStr) {
      throw new UnauthorizedException('Invalid Telegram data');
    }
    return {
      user: JSON.parse(userStr),
    };
  }

  private generateTokens(userId: string, role: string) {
    const payload = { sub: userId, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRATION', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid token');
      }
      return this.generateTokens(user.id, user.role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}