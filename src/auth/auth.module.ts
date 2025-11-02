import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PasswordService } from './services/password.service';
import { UserModule } from '../user/user.module';

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
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default_secret',
        signOptions: {
          expiresIn: configService.get<number>('JWT_EXPIRATION') || 86400,
        },
      }),
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
