import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { User } from '../../user/entities/user.entity';
import { UserRole, hasAtLeast } from '../../common/enums/role.enum';

/**
 * Roles Guard
 *
 * Authorizes by privilege RANK (ADR-0011), not by exact-string match: the user
 * passes when their rank is at least the least-privileged required role, so a
 * higher role automatically satisfies a lower requirement (a CREATOR passes an
 * @Roles(ADMIN) route).
 *
 * How it works:
 * 1. Extracts role requirements from route metadata (set by @Roles decorator)
 * 2. Gets the authenticated user from request (set by JwtAuthGuard)
 * 3. Computes the least-privileged required role (its minimum rank)
 * 4. If the user's rank is at least that minimum (hasAtLeast) → allows access
 * 5. Otherwise → throws 403 Forbidden
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
 * // Allow MODERATOR or higher (the least-privileged listed role is the floor)
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

    // Hierarchy (ADR-0011): the user passes when they hold at least one of the
    // required roles OR a higher one — a higher rank satisfies a lower @Roles
    // requirement (a CREATOR passes an @Roles(ADMIN) check). Never an exact
    // string match.
    const authorized = requiredRoles.some((role) =>
      hasAtLeast(user.role, role),
    );
    if (authorized) {
      return true;
    }

    // User's rank is below every required role → deny access
    throw new ForbiddenException(
      `You do not have permission to access this resource. Required roles: ${requiredRoles.join(
        ', ',
      )} (or higher).`,
    );
  }
}
