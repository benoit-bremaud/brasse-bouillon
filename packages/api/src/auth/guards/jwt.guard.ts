import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

/**
 * JWT Authentication Guard
 *
 * Protects routes by requiring a valid JWT token in Authorization header.
 * Uses the JWT strategy for validation.
 *
 * How to use:
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * async getProfile(@Request() req) {
 *   return req.user; // Authenticated user from JWT
 * }
 *
 * What happens:
 * 1. Client sends: Authorization: Bearer <token>
 * 2. Guard extracts and validates token with JwtStrategy
 * 3. If valid → passes to route handler with req.user set
 * 4. If invalid → returns 401 Unauthorized
 *
 * @class JwtAuthGuard
 * @extends AuthGuard('jwt')
 *
 * @example
 * // Protect a single route
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * async getProfile(@Req() req: Request) {
 *   return req.user;
 * }
 *
 * @example
 * // Protect entire controller
 * @Controller('protected')
 * @UseGuards(JwtAuthGuard)
 * export class ProtectedController {
 *   @Get()
 *   async getProtected(@Req() req: Request) {
 *     return req.user;
 *   }
 * }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
