import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { User } from '../../user/entities/user.entity';
import { UserRole } from '../../common/enums/role.enum';

/**
 * Roles Guard
 *
 * Checks if the authenticated user has the required role(s)
 * to access a protected route.
 *
 * How it works:
 * 1. Extracts role requirements from route metadata (set by @Roles decorator)
 * 2. Gets the authenticated user from request (set by JwtAuthGuard)
 * 3. Compares user's role with required roles
 * 4. If match → allows access (returns true)
 * 5. If no match → throws 403 Forbidden
 * 6. If no @Roles decorator → allows access (not role-protected)
 *
 * Must be used AFTER JwtAuthGuard (which sets req.user)
 *
 * Order matters: @UseGuards(JwtAuthGuard, RolesGuard)
 * - JwtAuthGuard runs first (validates token + sets req.user)
 * - RolesGuard runs second (checks user role)
 *
 * @guard RolesGuard
 * @injectable
 *
 * @example
 * // Protect a route for ADMIN only
 * @Delete('users/:id')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(UserRole.ADMIN)
 * async deleteUser(@Param('id') id: string) {
 *   return await this.userService.delete(id);
 * }
 *
 * @example
 * // Allow multiple roles
 * @Get('reports')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(UserRole.ADMIN, UserRole.MODERATOR)
 * async getReports() {
 *   return await this.reportService.getAll();
 * }
 *
 * @example
 * // If no @Roles decorator, all authenticated users can access
 * @Get('profile')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * async getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 *
 * @see Roles decorator for marking routes
 */

// Extend Express Request type to include user
declare module 'express' {
  interface Request {
    user?: User;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Extract required roles from route metadata (set by @Roles decorator)
    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler(),
    );

    // If no roles specified, allow access (not role-protected)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get the authenticated user from request (set by JwtAuthGuard)
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    // Check if user exists
    if (!user) {
      throw new ForbiddenException('User not found in request context');
    }

    // Check if user's role matches any of the required roles
    if (requiredRoles.includes(user.role)) {
      return true; // User has required role → allow access
    }

    // User doesn't have required role → deny access
    throw new ForbiddenException(
      `You do not have permission to access this resource. Required roles: ${requiredRoles.join(', ')}`,
    );
  }
}
