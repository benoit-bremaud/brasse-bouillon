import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';

import { AuthResponseDto } from '../dtos/auth-response.dto';
import { ForgotPasswordResponseDto } from '../dtos/forgot-password-response.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dtos/login.dto';
import { PasswordService } from './password.service';
import { ResetPasswordResponseDto } from '../dtos/reset-password-response.dto';
import { UserService } from '../../user/services/user.service';

/**
 * Lifetime of a password-reset token in milliseconds. Set to 1 hour
 * per the onboarding brainstorm §2.7.
 */
const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

/**
 * Generic acknowledgment returned by the forgot-password endpoint
 * regardless of whether the email exists. Prevents account
 * enumeration by keeping the response identical in both cases.
 */
const FORGOT_PASSWORD_GENERIC_MESSAGE =
  'If an account exists for that email, a reset link has been sent.';

/**
 * SHA-256 of the raw reset token. Deterministic (same input always
 * produces the same hash) so the database can look up a user by
 * token hash directly, unlike bcrypt which uses per-call salts.
 *
 * SHA-256 is sufficient here because the raw token is a UUIDv4
 * (122 bits of entropy) and lives 1 hour at most: an attacker would
 * need to guess a specific token's bytes within that window, which
 * is infeasible. Bcrypt's resistance to brute force is meant for
 * low-entropy human passwords, not for random tokens.
 */
function hashResetToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Auth Service
 *
 * Handles authentication logic:
 * - User login with email/password
 * - JWT token generation
 * - Token validation and refresh
 *
 * @class AuthService
 *
 * @example
 * const response = await authService.login(loginDto);
 * // Returns { access_token: 'jwt...', user: {...} }
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  /**
   * Constructor - Injects dependencies
   *
   * @param {JwtService} jwtService - For JWT operations
   * @param {UserService} userService - For user queries
   * @param {PasswordService} passwordService - For bcrypt operations
   */
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
  ) {}

  /**
   * User login endpoint
   *
   * Validates email + password, then generates JWT token.
   *
   * @param {LoginDto} loginDto - { email, password }
   *
   * @returns {Promise<AuthResponseDto>} { access_token, user }
   *
   * @throws {UnauthorizedException} If credentials are invalid
   * @throws {NotFoundException} If user does not exist
   *
   * @example
   * const response = await authService.login({
   *   email: 'john@example.com',
   *   password: 'SecurePass123!'
   * });
   * // Output: { access_token: 'eyJhbGc...', user: {...} }
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userService.findByEmail(email);
    if (!user || !user.is_active) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare passwords
    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const access_token = this.generateToken(user.id);

    // Return response (WITHOUT password)
    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        bio: user.bio,
        role: user.role,
        is_active: user.is_active,
        deletion_requested_at: user.deletion_requested_at,
        deletion_scheduled_for: user.deletion_scheduled_for,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    };
  }

  /**
   * Generate JWT token
   *
   * Creates a signed JWT with user ID as payload.
   * Token expires after JWT_EXPIRATION time.
   *
   * @param {string} userId - User ID to encode in JWT
   *
   * @returns {string} JWT token (can be used in Authorization header)
   *
   * @example
   * const token = this.generateToken('550e8400-e29b-41d4-a716-446655440000');
   * // Output: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  private generateToken(userId: string): string {
    const payload = { sub: userId };
    return this.jwtService.sign(payload);
  }

  /**
   * Validate user for local strategy (login)
   *
   * Used by passport-local for authentication.
   * Returns user data if credentials are valid.
   *
   * @param {string} email - User's email
   * @param {string} password - User's password
   *
   * @returns {Promise<any>} User object (without password)
   *
   * @throws {UnauthorizedException} If credentials are invalid
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (!user || !user.is_active) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...result } = user;
    return result;
  }

  /**
   * Request a password reset.
   *
   * Always returns the same generic acknowledgment regardless of
   * whether the email exists, to prevent account enumeration. When
   * the email DOES exist, a fresh token is generated, hashed, and
   * persisted on the user with a 1-hour expiry. The raw token is
   * logged via Logger so v0.1 dev environments can read it out of
   * the logs and complete the flow manually.
   *
   * TODO (v0.2): replace the Logger emission with a real email
   * dispatch (SMTP / Resend / SendGrid) once the email infrastructure
   * lands. The endpoint contract stays unchanged.
   *
   * @param email Email of the account that needs a reset
   * @returns Always the same generic acknowledgment.
   */
  async requestPasswordReset(
    email: string,
  ): Promise<ForgotPasswordResponseDto> {
    const user = await this.userService.findByEmail(email);

    if (user && user.is_active) {
      const rawToken = randomUUID();
      const tokenHash = hashResetToken(rawToken);
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

      await this.userService.setPasswordResetToken(
        user.id,
        tokenHash,
        expiresAt,
      );

      // v0.1 dispatch strategy: in non-production environments we
      // emit the raw token + email so operators can complete the
      // flow manually until SMTP / Resend / SendGrid lands in v0.2.
      // In production the raw token is NEVER logged — only that an
      // event happened — so log access cannot be used to take over
      // accounts. The log gate is intentional: a misconfigured
      // env that flips NODE_ENV is the only way the token leaks,
      // and we reject that surface before it can ship.
      if (process.env.NODE_ENV !== 'production') {
        this.logger.warn(
          `[PASSWORD-RESET] Token issued for ${email}. Raw token: ${rawToken} (expires ${expiresAt.toISOString()})`,
        );
      } else {
        this.logger.log(
          `[PASSWORD-RESET] Token issued (user_id=${user.id}, expires=${expiresAt.toISOString()})`,
        );
      }
    }

    return { message: FORGOT_PASSWORD_GENERIC_MESSAGE };
  }

  /**
   * Complete a password reset.
   *
   * Hashes the raw token submitted by the client (SHA-256, deterministic)
   * and looks it up against the user table. If a non-expired match is
   * found and the user is active, the password is updated and the
   * reset fields are cleared in a single atomic SQL UPDATE that is
   * conditional on the token hash still being present — so two
   * concurrent requests with the same valid token cannot both
   * succeed (only the first UPDATE matches a row; the second sees
   * 0 affected rows and is rejected).
   *
   * Any failure mode (token unknown, expired, deactivated user, lost
   * race) surfaces as a generic 400 BadRequestException so the
   * response does not reveal which condition failed.
   *
   * On success, bcrypt is used to hash the new plain-text password
   * before storage. Bcrypt is for *passwords*; the reset *token* uses
   * SHA-256 (high-entropy, single-use, deterministic — see
   * `hashResetToken` for the rationale).
   *
   * @param token       Raw token received by email (single-use)
   * @param newPassword Plain-text new password (validated by the DTO)
   * @returns Confirmation message; the client logs in again afterwards.
   * @throws BadRequestException if the token is invalid, expired, the
   *         user is deactivated, or the atomic UPDATE matches 0 rows.
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<ResetPasswordResponseDto> {
    const tokenHash = hashResetToken(token);
    const user =
      await this.userService.findByValidPasswordResetTokenHash(tokenHash);

    if (!user) {
      // Generic message — does not reveal whether the token was
      // unknown, expired, already used, or belongs to a deactivated
      // account.
      throw new BadRequestException('Invalid or expired password reset token');
    }

    if (!user.is_active) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const newHash = await this.passwordService.hashPassword(newPassword);
    const success = await this.userService.completePasswordReset(
      user.id,
      tokenHash,
      newHash,
    );

    if (!success) {
      // Lost race: another request consumed the token between our
      // SELECT and our UPDATE. Surface the same generic 400 so the
      // attacker cannot distinguish race-loss from any other failure.
      throw new BadRequestException('Invalid or expired password reset token');
    }

    return {
      message: 'Password has been reset successfully. Please log in.',
    };
  }
}
