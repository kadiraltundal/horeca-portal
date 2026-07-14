import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { mockRegisterDto, mockLoginDto } from '../../../test-utils/mock-fixtures';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    authService = module.get(AuthService) as jest.Mocked<AuthService>;
  });

  describe('register', () => {
    it('should call authService.register with dto', async () => {
      const dto = mockRegisterDto();
      const expected = { user: { id: '1', email: dto.email }, accessToken: 'token', refreshToken: 'refresh' };
      authService.register.mockResolvedValue(expected as any);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('login', () => {
    it('should call authService.login with dto', async () => {
      const dto = mockLoginDto();
      const expected = { user: { id: '1', email: dto.email }, accessToken: 'token', refreshToken: 'refresh' };
      authService.login.mockResolvedValue(expected as any);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('refresh', () => {
    it('should call authService.refreshToken with refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const expected = { accessToken: 'new-token', refreshToken: 'new-refresh' };
      authService.refreshToken.mockResolvedValue(expected as any);

      const result = await controller.refresh(refreshToken);

      expect(authService.refreshToken).toHaveBeenCalledWith(refreshToken);
      expect(result).toEqual(expected);
    });
  });
});
