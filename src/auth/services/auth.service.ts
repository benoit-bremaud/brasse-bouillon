import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthResponseDto } from '../dtos/auth-response.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dtos/login.dto';
import { PasswordService } from './password.service';
import { UserService } from '../../user/services/user.service';

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
    if (!user) {
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
        role: user.role,
        is_active: user.is_active,
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
    if (!user) {
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
}
