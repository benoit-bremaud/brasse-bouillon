import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../common/enums/role.enum';

/**
 * Roles Decorator
 *
 * Marks a route handler to require specific roles.
 * Must be used with RolesGuard.
 *
 * The decorator stores role requirements as metadata that RolesGuard will check.
 *
 * How it works:
 * 1. You decorate a route with @Roles(UserRole.ADMIN)
 * 2. The decorator stores 'roles' in route metadata
 * 3. RolesGuard reads this metadata
 * 4. RolesGuard compares user's role with required roles
 * 5. If match → access granted, if not → 403 Forbidden
 *
 * @decorator @Roles()
 *
 * @example
 * // Single role requirement
 * @Get('admin-only')
 * @Roles(UserRole.ADMIN)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * async getAdminData() {
 *   return { message: 'Only admins can see this' };
 * }
 *
 * @example
 * // Multiple roles allowed (any role in the list will work)
 * @Delete('users/:id')
 * @Roles(UserRole.ADMIN, UserRole.MODERATOR)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * async deleteUser(@Param('id') id: string) {
 *   return await this.userService.delete(id);
 * }
 *
 * @see RolesGuard for the guard that enforces these roles
 */
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
