import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PasswordService } from './services/password.service';
import { UserModule } from '../user/user.module';
import type * as jwt from 'jsonwebtoken';

/**
 * Auth Module
 *
 * Handles authentication and JWT management.
 * Provides login, registration, and token validation.
 *
 * Exports:
 * - AuthService - For auth operations
 * - PasswordService - For password hashing
 * - JwtAuthGuard - For route protection
 * - CurrentUser - Decorator for getting user
 *
 * @module AuthModule
 *
 * @example
 * // In AppModule
 * @Module({
 *   imports: [AuthModule, UserModule],
 * })
 * export class AppModule {}
 *
 * @example
 * // In a protected route
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * async getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 */
@Module({
  imports: [
    // Import UserModule to access UserService
    UserModule,

    // Configure Passport for JWT strategy
    PassportModule,

    // Configure JWT with secret and expiration
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not defined in environment variables');
        }

        const rawExpiresIn = configService.get<string>('JWT_EXPIRATION');
        const expiresIn: jwt.SignOptions['expiresIn'] = (() => {
          if (!rawExpiresIn) return 86400;

          const trimmed = rawExpiresIn.trim();
          if (trimmed.length === 0) return 86400;

          if (/^\d+$/.test(trimmed)) return Number(trimmed);

          const secondsMatch = /^(\d+)s$/.exec(trimmed);
          if (secondsMatch) return Number(secondsMatch[1]);

          // Allow jsonwebtoken/ms duration strings (e.g. "1d", "2h", "30m").
          return trimmed as jwt.SignOptions['expiresIn'];
        })();

        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  providers: [
    // Services
    AuthService,
    PasswordService,

    // Strategies
    JwtStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService, PasswordService],
})
export class AuthModule {}
