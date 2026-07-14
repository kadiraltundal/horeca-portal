import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../../config/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createPrismaMock } from '../../../test-utils/prisma-mock';
import { mockUser, mockRegisterDto, mockLoginDto } from '../../../test-utils/mock-fixtures';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof createPrismaMock>;
  let jwtService: JwtService;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-access-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                JWT_SECRET: 'test-secret',
                JWT_REFRESH_SECRET: 'test-refresh-secret',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const dto = mockRegisterDto();
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const createdUser = mockUser({ password: hashedPassword, email: dto.email, firstName: dto.firstName, lastName: dto.lastName });

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(createdUser);

      const result = await service.register(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.user.email).toBe(dto.email);
      expect(result.user.firstName).toBe(dto.firstName);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw ConflictException if email already exists', async () => {
      const dto = mockRegisterDto();
      prisma.user.findUnique.mockResolvedValue(mockUser({ email: dto.email }));

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('should hash the password before storing', async () => {
      const dto = mockRegisterDto();
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser());

      await service.register(dto);

      const createCall = prisma.user.create.mock.calls[0][0];
      expect(createCall.data.password).not.toBe(dto.password);
      expect(createCall.data.password).toMatch(/^\$2[aby]?\$/);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const dto = mockLoginDto();
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const user = mockUser({ password: hashedPassword, email: dto.email });

      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.login(dto);

      expect(result.user.email).toBe(dto.email);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const dto = mockLoginDto();
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      const dto = mockLoginDto({ password: 'wrongpassword' });
      const user = mockUser({ email: dto.email });
      prisma.user.findUnique.mockResolvedValue(user);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      const user = mockUser();
      (jwtService.verify as jest.Mock).mockReturnValue({ sub: user.id });
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.refreshToken('valid-refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({ sub: 'nonexistent-id' });
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshToken('valid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
