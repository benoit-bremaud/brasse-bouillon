import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RolesGuard } from './roles.guard';
import { UserRole } from '../../common/enums/role.enum';
import { User } from '../../user/entities/user.entity';

/**
 * RolesGuard authorizes by privilege RANK (ADR-0011), not by exact-string
 * match: a higher role automatically satisfies a lower @Roles requirement —
 * so a CREATOR passes an @Roles(ADMIN) route.
 */
describe('RolesGuard — hierarchical authorization (ADR-0011)', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
    jest.spyOn(reflector, 'get');
  });

  const contextFor = (
    requiredRoles: UserRole[] | undefined,
    user: Pick<User, 'role'> | undefined,
  ): ExecutionContext => {
    (reflector.get as jest.Mock).mockReturnValue(requiredRoles);
    return {
      getHandler: () => () => undefined,
      switchToHttp: () => ({
        getRequest: () => ({ user }),
        getResponse: () => ({}),
        getNext: () => ({}),
      }),
    } as unknown as ExecutionContext;
  };

  it('allows a route with no @Roles metadata', () => {
    const ctx = contextFor(undefined, { role: UserRole.USER });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows an exact-rank match (ADMIN on @Roles(ADMIN))', () => {
    const ctx = contextFor([UserRole.ADMIN], { role: UserRole.ADMIN });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('lets a higher role pass (CREATOR on @Roles(ADMIN))', () => {
    const ctx = contextFor([UserRole.ADMIN], { role: UserRole.CREATOR });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('rejects a lower role (USER on @Roles(ADMIN))', () => {
    const ctx = contextFor([UserRole.ADMIN], { role: UserRole.USER });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('uses the least-privileged required role (@Roles(ADMIN, MODERATOR) lets MODERATOR pass)', () => {
    const ctx = contextFor([UserRole.ADMIN, UserRole.MODERATOR], {
      role: UserRole.MODERATOR,
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('lets @Roles(USER) pass for every authenticated role', () => {
    for (const role of Object.values(UserRole)) {
      const ctx = contextFor([UserRole.USER], { role });
      expect(guard.canActivate(ctx)).toBe(true);
    }
  });

  it('throws when no authenticated user is present', () => {
    const ctx = contextFor([UserRole.ADMIN], undefined);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
