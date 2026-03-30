import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserService } from '../../user/services/user.service';

/**
 * JWT Strategy
 *
 * Validates JWT tokens from Authorization header.
 * Used as middleware to protect routes with @UseGuards(JwtAuthGuard).
 *
 * How it works:
 * 1. Client sends request with: Authorization: Bearer <token>
 * 2. Strategy extracts token from header
 * 3. Verifies token signature using JWT secret
 * 4. Calls validate() method with decoded payload
 * 5. If valid, req.user is set to returned object
 * 6. If invalid, throws UnauthorizedException
 *
 * @class JwtStrategy
 * @extends PassportStrategy
 *
 * @example
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * async getProfile(@Request() req) {
 *   return req.user; // User data from JWT
 * }
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructor - Configures JWT extraction and validation
   *
   * @param {ConfigService} configService - For accessing env variables
   * @param {UserService} userService - For user lookups
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      // Extract JWT from Authorization header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Verify token signature using JWT_SECRET
      secretOrKey: secret,

      // Disable token expiration check (validate() will handle it)
      ignoreExpiration: false,
    });
  }

  /**
   * Validate JWT payload and fetch user
   *
   * Called by Passport after JWT signature is verified.
   * Returns object that becomes req.user in the request.
   *
   * @param {object} payload - Decoded JWT payload { sub: userId, iat, exp }
   * @param {string} payload.sub - User ID encoded in token
   *
   * @returns {Promise<User>} User object from database
   *
   * @throws {UnauthorizedException} If user not found or token invalid
   *
   * @example
   * // Valid JWT decoded to:
   * // { sub: '550e8400-e29b-41d4-a716-446655440000', iat: 1234567890, exp: 1234571490 }
   * // Returns: User object with that ID
   */
  async validate(payload: { sub: string }): Promise<any> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.userService.findByIdRaw(payload.sub);
    if (!user || !user.is_active) {
      throw new UnauthorizedException('Invalid token');
    }

    // Remove password hash before attaching user to request
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...safeUser } = user;
    return safeUser;
  }
}
