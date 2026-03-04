import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../../user/dtos/create-user.dto';
import { LoginDto } from '../dtos/login.dto';
import { PasswordService } from '../services/password.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { User } from '../../user/entities/user.entity';
import { UserRole } from '../../common/enums/role.enum';
import { UserService } from '../../user/services/user.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let userService: UserService;

  const mockUser: User = Object.assign(new User(), {
    id: '550e8400-e29b-41d4-a716-446655440200',
    email: 'john@example.com',
    username: 'john_doe',
    password_hash: 'hashed-password',
    first_name: 'John',
    last_name: 'Doe',
    role: UserRole.USER,
    is_active: true,
    created_at: new Date('2026-01-31T10:00:00.000Z'),
    updated_at: new Date('2026-01-31T10:00:00.000Z'),
  });

  const authResponse: AuthResponseDto = {
    access_token: 'jwt-access-token',
    user: {
      id: mockUser.id,
      email: mockUser.email,
      username: mockUser.username,
      first_name: mockUser.first_name,
      last_name: mockUser.last_name,
      role: mockUser.role,
      is_active: mockUser.is_active,
      created_at: mockUser.created_at,
      updated_at: mockUser.updated_at,
    },
  };

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hashPassword: jest.fn(),
            comparePassword: jest.fn(),
          },
        },
      ],
    });

    moduleBuilder.overrideGuard(ThrottlerGuard).useValue({
      canActivate: jest.fn().mockReturnValue(true),
    });

    const module: TestingModule = await moduleBuilder.compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login() - POST /auth/login', () => {
    it('should authenticate user and return token payload', async () => {
      const dto: LoginDto = {
        email: mockUser.email,
        password: 'SecurePassword123!',
      };

      const loginSpy = jest
        .spyOn(authService, 'login')
        .mockResolvedValue(authResponse);

      const result = await controller.login(dto);

      expect(loginSpy).toHaveBeenCalledWith(dto);
      expect(result).toEqual(authResponse);
    });

    it('should propagate UnauthorizedException when credentials are invalid', async () => {
      const dto: LoginDto = {
        email: mockUser.email,
        password: 'WrongPassword!',
      };

      const loginSpy = jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(loginSpy).toHaveBeenCalledWith(dto);
    });
  });

  describe('register() - POST /auth/register', () => {
    it('should create user and then log in immediately', async () => {
      const dto: CreateUserDto = {
        email: mockUser.email,
        username: mockUser.username,
        password: 'SecurePassword123!',
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
      };

      const createSpy = jest
        .spyOn(userService, 'create')
        .mockResolvedValue(mockUser);
      const loginSpy = jest
        .spyOn(authService, 'login')
        .mockResolvedValue(authResponse);

      const result = await controller.register(dto);

      expect(createSpy).toHaveBeenCalledWith(dto);
      expect(loginSpy).toHaveBeenCalledWith({
        email: dto.email,
        password: dto.password,
      });
      expect(result).toEqual(authResponse);
    });

    it('should propagate ConflictException when user creation fails', async () => {
      const dto: CreateUserDto = {
        email: 'already-used@example.com',
        username: 'already_used',
        password: 'SecurePassword123!',
      };

      const createSpy = jest
        .spyOn(userService, 'create')
        .mockRejectedValue(new ConflictException('Email already exists'));
      const loginSpy = jest.spyOn(authService, 'login');

      await expect(controller.register(dto)).rejects.toThrow(ConflictException);
      expect(createSpy).toHaveBeenCalledWith(dto);
      expect(loginSpy).not.toHaveBeenCalled();
    });

    it('should propagate authentication error after successful creation', async () => {
      const dto: CreateUserDto = {
        email: mockUser.email,
        username: mockUser.username,
        password: 'SecurePassword123!',
      };

      const createSpy = jest
        .spyOn(userService, 'create')
        .mockResolvedValue(mockUser);
      const loginSpy = jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.register(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(createSpy).toHaveBeenCalledWith(dto);
      expect(loginSpy).toHaveBeenCalledWith({
        email: dto.email,
        password: dto.password,
      });
    });
  });

  describe('getCurrentUser() - GET /auth/me', () => {
    it('should return currently authenticated user', () => {
      expect(controller.getCurrentUser(mockUser)).toBe(mockUser);
    });
  });
});
