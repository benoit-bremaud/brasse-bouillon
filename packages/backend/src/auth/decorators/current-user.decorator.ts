import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { Request } from 'express';

/**
 * Current User Decorator
 *
 * Extracts the authenticated user from the request object.
 * Can only be used in routes protected with @UseGuards(JwtAuthGuard).
 *
 * How it works:
 * 1. JwtAuthGuard validates token and sets req.user
 * 2. @CurrentUser() decorator extracts req.user
 * 3. Injected as parameter to route handler
 *
 * What it does:
 * - Gets user from request context (set by JwtAuthGuard)
 * - Returns typed User object (with autocomplete)
 * - Throws error if used without JwtAuthGuard
 *
 * @param data - Optional property to extract from user (e.g., 'email', 'id')
 * @param ctx - NestJS ExecutionContext
 *
 * @returns User object or specified property
 *
 * @example
 * // Get entire user object
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * async getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 *
 * @example
 * // Get specific property
 * @Get('email')
 * @UseGuards(JwtAuthGuard)
 * async getEmail(@CurrentUser('email') email: string) {
 *   return { email };
 * }
 *
 * @example
 * // Get user ID
 * @Get('me')
 * @UseGuards(JwtAuthGuard)
 * async getMe(@CurrentUser('id') userId: string) {
 *   return { userId };
 * }
 */

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): unknown => {
    const request = ctx.switchToHttp().getRequest<Request>();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user: unknown = (request as any).user;

    // If no specific property requested, return entire user
    if (!data) {
      return user;
    }

    // Return specific property from user (e.g., 'email', 'id')

    return (user as Record<string, unknown>)[data];
  },
);
