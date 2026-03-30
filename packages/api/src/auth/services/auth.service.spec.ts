import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dtos/login.dto';
import { PasswordService } from './password.service';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import { UserRole } from '../../common/enums/role.enum';
import { UserService } from '../../user/services/user.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userService: UserService;
  let passwordService: PasswordService;

  const makeUser = (overrides: Partial<User> = {}): User => {
    return Object.assign(new User(), {
      id: '550e8400-e29b-41d4-a716-446655440100',
      email: 'john@example.com',
      username: 'john_doe',
      password_hash: 'hashed-password',
      first_name: 'John',
      last_name: 'Doe',
      role: UserRole.USER,
      is_active: true,
      created_at: new Date('2026-01-31T10:00:00.000Z'),
      updated_at: new Date('2026-01-31T10:00:00.000Z'),
      ...overrides,
    });
  };

  beforeEach(() => {
    jwtService = {
      sign: jest.fn(),
    } as unknown as JwtService;

    userService = {
      findByEmail: jest.fn(),
    } as unknown as UserService;

    passwordService = {
      comparePassword: jest.fn(),
    } as unknown as PasswordService;

    service = new AuthService(jwtService, userService, passwordService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login()', () => {
    it('should return access token and sanitized user when credentials are valid', async () => {
      const user = makeUser();
      const dto: LoginDto = {
        email: user.email,
        password: 'SecurePassword123!',
      };

      const findByEmailSpy = jest
        .spyOn(userService, 'findByEmail')
        .mockResolvedValue(user);
      const comparePasswordSpy = jest
        .spyOn(passwordService, 'comparePassword')
        .mockResolvedValue(true);
      const signSpy = jest
        .spyOn(jwtService, 'sign')
        .mockReturnValue('jwt-access-token');

      const result = await service.login(dto);

      expect(findByEmailSpy).toHaveBeenCalledWith(dto.email);
      expect(comparePasswordSpy).toHaveBeenCalledWith(
        dto.password,
        user.password_hash,
      );
      expect(signSpy).toHaveBeenCalledWith({ sub: user.id });
      expect(result).toEqual({
        access_token: 'jwt-access-token',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      });
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      const dto: LoginDto = {
        email: 'missing@example.com',
        password: 'SecurePassword123!',
      };

      const findByEmailSpy = jest
        .spyOn(userService, 'findByEmail')
        .mockResolvedValue(null);
      const comparePasswordSpy = jest.spyOn(passwordService, 'comparePassword');
      const signSpy = jest.spyOn(jwtService, 'sign');

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(findByEmailSpy).toHaveBeenCalledWith(dto.email);
      expect(comparePasswordSpy).not.toHaveBeenCalled();
      expect(signSpy).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const inactiveUser = makeUser({ is_active: false });
      const dto: LoginDto = {
        email: inactiveUser.email,
        password: 'SecurePassword123!',
      };

      const findByEmailSpy = jest
        .spyOn(userService, 'findByEmail')
        .mockResolvedValue(inactiveUser);
      const comparePasswordSpy = jest.spyOn(passwordService, 'comparePassword');
      const signSpy = jest.spyOn(jwtService, 'sign');

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(findByEmailSpy).toHaveBeenCalledWith(dto.email);
      expect(comparePasswordSpy).not.toHaveBeenCalled();
      expect(signSpy).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const user = makeUser();
      const dto: LoginDto = {
        email: user.email,
        password: 'WrongPassword!',
      };

      const findByEmailSpy = jest
        .spyOn(userService, 'findByEmail')
        .mockResolvedValue(user);
      const comparePasswordSpy = jest
        .spyOn(passwordService, 'comparePassword')
        .mockResolvedValue(false);
      const signSpy = jest.spyOn(jwtService, 'sign');

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(findByEmailSpy).toHaveBeenCalledWith(dto.email);
      expect(comparePasswordSpy).toHaveBeenCalledWith(
        dto.password,
        user.password_hash,
      );
      expect(signSpy).not.toHaveBeenCalled();
    });
  });

  describe('validateUser()', () => {
    it('should return user without password_hash when credentials are valid', async () => {
      const user = makeUser();
      const password = 'SecurePassword123!';

      const findByEmailSpy = jest
        .spyOn(userService, 'findByEmail')
        .mockResolvedValue(user);
      const comparePasswordSpy = jest
        .spyOn(passwordService, 'comparePassword')
        .mockResolvedValue(true);

      const result: unknown = await service.validateUser(user.email, password);

      expect(result).toEqual(
        expect.objectContaining({
          id: user.id,
          email: user.email,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          is_active: user.is_active,
        }),
      );
      expect(result).not.toEqual(
        expect.objectContaining({
          password_hash: user.password_hash,
        }),
      );

      expect(findByEmailSpy).toHaveBeenCalledWith(user.email);
      expect(comparePasswordSpy).toHaveBeenCalledWith(
        password,
        user.password_hash,
      );
    });

    it('should throw UnauthorizedException when user does not exist during validation', async () => {
      const findByEmailSpy = jest
        .spyOn(userService, 'findByEmail')
        .mockResolvedValue(null);
      const comparePasswordSpy = jest.spyOn(passwordService, 'comparePassword');

      await expect(
        service.validateUser('missing@example.com', 'SecurePassword123!'),
      ).rejects.toThrow(UnauthorizedException);

      expect(findByEmailSpy).toHaveBeenCalledWith('missing@example.com');
      expect(comparePasswordSpy).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user is inactive during validation', async () => {
      const inactiveUser = makeUser({ is_active: false });

      const findByEmailSpy = jest
        .spyOn(userService, 'findByEmail')
        .mockResolvedValue(inactiveUser);
      const comparePasswordSpy = jest.spyOn(passwordService, 'comparePassword');

      await expect(
        service.validateUser(inactiveUser.email, 'SecurePassword123!'),
      ).rejects.toThrow(UnauthorizedException);

      expect(findByEmailSpy).toHaveBeenCalledWith(inactiveUser.email);
      expect(comparePasswordSpy).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid during validation', async () => {
      const user = makeUser();
      const wrongPassword = 'WrongPassword!';

      const findByEmailSpy = jest
        .spyOn(userService, 'findByEmail')
        .mockResolvedValue(user);
      const comparePasswordSpy = jest
        .spyOn(passwordService, 'comparePassword')
        .mockResolvedValue(false);

      await expect(
        service.validateUser(user.email, wrongPassword),
      ).rejects.toThrow(UnauthorizedException);

      expect(findByEmailSpy).toHaveBeenCalledWith(user.email);
      expect(comparePasswordSpy).toHaveBeenCalledWith(
        wrongPassword,
        user.password_hash,
      );
    });
  });
});
