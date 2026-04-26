import { createHash } from 'crypto';

import { AuthService } from './auth.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dtos/login.dto';
import { PasswordService } from './password.service';
import { User } from '../../user/entities/user.entity';
import { UserRole } from '../../common/enums/role.enum';
import { UserService } from '../../user/services/user.service';

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

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
      setPasswordResetToken: jest.fn(),
      findByValidPasswordResetTokenHash: jest.fn(),
      completePasswordReset: jest.fn(),
    } as unknown as UserService;

    passwordService = {
      comparePassword: jest.fn(),
      hashPassword: jest.fn(),
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

  describe('requestPasswordReset()', () => {
    describe('happy path', () => {
      it('issues a SHA-256 hashed token, stores it, and returns the generic acknowledgment', async () => {
        const user = makeUser();
        const findByEmailSpy = jest
          .spyOn(userService, 'findByEmail')
          .mockResolvedValue(user);
        const setTokenSpy = jest
          .spyOn(userService, 'setPasswordResetToken')
          .mockResolvedValue(undefined);

        const response = await service.requestPasswordReset(user.email);

        expect(response.message).toMatch(/If an account exists/);
        expect(findByEmailSpy).toHaveBeenCalledWith(user.email);
        expect(setTokenSpy).toHaveBeenCalledTimes(1);

        const [storedUserId, storedHash, storedExpiry] = setTokenSpy.mock
          .calls[0] as [string, string, Date];
        expect(storedUserId).toBe(user.id);
        // SHA-256 of a UUIDv4 hex string is exactly 64 hex chars.
        expect(storedHash).toMatch(/^[a-f0-9]{64}$/);
        const ttlMs = storedExpiry.getTime() - Date.now();
        // 1h target ± 5s tolerance — wide enough that slow CI runners
        // can still pass the check, narrow enough that we'd notice a
        // bug that doubled or halved the TTL.
        expect(ttlMs).toBeGreaterThan(60 * 60 * 1000 - 5_000);
        expect(ttlMs).toBeLessThanOrEqual(60 * 60 * 1000 + 5_000);
      });
    });

    describe('sad path — anti-enumeration', () => {
      it('returns the generic acknowledgment without storing a token when the email is unknown', async () => {
        jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
        const setTokenSpy = jest.spyOn(userService, 'setPasswordResetToken');

        const response = await service.requestPasswordReset(
          'unknown@example.com',
        );

        expect(response.message).toMatch(/If an account exists/);
        expect(setTokenSpy).not.toHaveBeenCalled();
      });

      it('returns the generic acknowledgment without storing a token when the user is deactivated', async () => {
        const user = makeUser({ is_active: false });
        jest.spyOn(userService, 'findByEmail').mockResolvedValue(user);
        const setTokenSpy = jest.spyOn(userService, 'setPasswordResetToken');

        const response = await service.requestPasswordReset(user.email);

        expect(response.message).toMatch(/If an account exists/);
        expect(setTokenSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('resetPassword()', () => {
    describe('happy path', () => {
      it('hashes the token (SHA-256), validates expiry via UserService, and writes the new password', async () => {
        const rawToken = '6f4e5b2a-7c3d-4f10-9b3e-1c8f7d2a3e0f';
        const tokenHash = sha256(rawToken);
        const user = makeUser({
          password_reset_token_hash: tokenHash,
          password_reset_expires_at: new Date(Date.now() + 30 * 60 * 1000),
        });
        const findByHashSpy = jest
          .spyOn(userService, 'findByValidPasswordResetTokenHash')
          .mockResolvedValue(user);
        const hashPasswordSpy = jest
          .spyOn(passwordService, 'hashPassword')
          .mockResolvedValue('new-bcrypt-hash');
        const completeResetSpy = jest
          .spyOn(userService, 'completePasswordReset')
          .mockResolvedValue(true);

        const response = await service.resetPassword(
          rawToken,
          'NewSecurePass123!',
        );

        expect(findByHashSpy).toHaveBeenCalledWith(tokenHash);
        expect(hashPasswordSpy).toHaveBeenCalledWith('NewSecurePass123!');
        expect(completeResetSpy).toHaveBeenCalledWith(
          user.id,
          tokenHash,
          'new-bcrypt-hash',
        );
        expect(response.message).toMatch(/successfully/);
      });

      it('throws BadRequestException when the atomic UPDATE matches 0 rows (race lost)', async () => {
        const rawToken = '6f4e5b2a-7c3d-4f10-9b3e-1c8f7d2a3e0f';
        const tokenHash = sha256(rawToken);
        const user = makeUser({
          password_reset_token_hash: tokenHash,
          password_reset_expires_at: new Date(Date.now() + 30 * 60 * 1000),
        });
        jest
          .spyOn(userService, 'findByValidPasswordResetTokenHash')
          .mockResolvedValue(user);
        jest
          .spyOn(passwordService, 'hashPassword')
          .mockResolvedValue('new-bcrypt-hash');
        // Simulate the race: another request consumed the token
        // between our SELECT and our UPDATE — affected = 0.
        jest
          .spyOn(userService, 'completePasswordReset')
          .mockResolvedValue(false);

        await expect(
          service.resetPassword(rawToken, 'NewSecurePass123!'),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('sad path — generic 400 on every failure mode', () => {
      it('throws BadRequestException when the token is unknown / expired', async () => {
        jest
          .spyOn(userService, 'findByValidPasswordResetTokenHash')
          .mockResolvedValue(null);
        const hashPasswordSpy = jest.spyOn(passwordService, 'hashPassword');
        const completeResetSpy = jest.spyOn(
          userService,
          'completePasswordReset',
        );

        await expect(
          service.resetPassword('any-token', 'NewSecurePass123!'),
        ).rejects.toThrow(BadRequestException);

        expect(hashPasswordSpy).not.toHaveBeenCalled();
        expect(completeResetSpy).not.toHaveBeenCalled();
      });

      it('throws BadRequestException when the user is deactivated even with a valid token', async () => {
        const user = makeUser({ is_active: false });
        jest
          .spyOn(userService, 'findByValidPasswordResetTokenHash')
          .mockResolvedValue(user);
        const completeResetSpy = jest.spyOn(
          userService,
          'completePasswordReset',
        );

        await expect(
          service.resetPassword('token', 'NewSecurePass123!'),
        ).rejects.toThrow(BadRequestException);

        expect(completeResetSpy).not.toHaveBeenCalled();
      });
    });

    describe('edge case', () => {
      it('treats two raw tokens differing by one char as different hashes', async () => {
        const findByHashSpy = jest
          .spyOn(userService, 'findByValidPasswordResetTokenHash')
          .mockResolvedValue(null);

        await expect(
          service.resetPassword('token-a', 'NewSecurePass123!'),
        ).rejects.toThrow(BadRequestException);
        await expect(
          service.resetPassword('token-b', 'NewSecurePass123!'),
        ).rejects.toThrow(BadRequestException);

        const calls = findByHashSpy.mock.calls as string[][];
        expect(calls[0][0]).toBe(sha256('token-a'));
        expect(calls[1][0]).toBe(sha256('token-b'));
        expect(calls[0][0]).not.toBe(calls[1][0]);
      });
    });
  });
});
