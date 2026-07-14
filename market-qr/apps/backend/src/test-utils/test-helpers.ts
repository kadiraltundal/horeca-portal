import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../config/prisma.service';
import { createPrismaMock } from './prisma-mock';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext } from '@nestjs/common';

export interface TestContext {
  module: TestingModule;
  prisma: ReturnType<typeof createPrismaMock>;
  jwtService: JwtService;
  configService: ConfigService;
}

export const createTestingModule = async (
  imports: any[],
  providers: any[],
): Promise<TestContext> => {
  const prismaMock = createPrismaMock();

  const module = await Test.createTestingModule({
    imports,
    providers: [
      ...providers,
      {
        provide: PrismaService,
        useValue: prismaMock,
      },
      {
        provide: JwtService,
        useValue: {
          signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
          verify: jest.fn().mockReturnValue({ sub: 'user-123', email: 'test@example.com', role: 'ADMIN' }),
          verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-123', email: 'test@example.com', role: 'ADMIN' }),
        },
      },
      {
        provide: ConfigService,
        useValue: {
          get: jest.fn((key: string) => {
            const config: Record<string, string> = {
              JWT_SECRET: 'test-secret',
              JWT_REFRESH_SECRET: 'test-refresh-secret',
              DATABASE_URL: 'mysql://root:1234@localhost:3306/test',
            };
            return config[key];
          }),
        },
      },
    ],
  }).compile();

  return {
    module,
    prisma: prismaMock,
    jwtService: module.get(JwtService),
    configService: module.get(ConfigService),
  };
};

export const createMockExecutionContext = (user?: any): ExecutionContext => {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user: user || { id: 'user-123', email: 'test@example.com', role: 'ADMIN', storeId: 'store-123' },
      }),
      getResponse: () => ({
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        setHeader: jest.fn().mockReturnThis(),
      }),
    }),
    switchToRpc: () => ({
      getContext: () => ({}),
      getData: () => ({}),
    }),
    switchToWs: () => ({
      getData: () => ({}),
      getClient: () => ({}),
    }),
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
    getArgs: () => [],
    getArgByIndex: () => ({}),
    switchToArgs: () => ({
      getArgByIndex: () => ({}),
    }),
  } as unknown as ExecutionContext;
};

export const generateToken = (payload: {
  sub: string;
  email: string;
  role: string;
}): string => {
  // Simple base64 token for testing
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 900000 })).toString('base64');
  return `${header}.${body}.mock-signature`;
};
