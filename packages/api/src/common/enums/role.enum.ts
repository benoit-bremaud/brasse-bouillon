/**
 * User Role enum + privilege ranking (ADR-0011).
 *
 * Roles form a strict hierarchy. Privilege is expressed by an explicit rank
 * map — never by comparing the enum strings or `role === 'admin'`. `CREATOR`
 * is the single-holder supreme owner above `ADMIN` (seeded once, not grantable
 * through the normal role-assignment path).
 *
 * @enum {string}
 */
export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  CREATOR = 'creator',
}

/**
 * Privilege rank per role (higher number = more privilege). Drives
 * {@link hasAtLeast}; every authorization decision must use the rank, never a
 * raw string comparison (ADR-0011).
 */
export const ROLE_RANK: Record<UserRole, number> = {
  [UserRole.USER]: 0,
  [UserRole.MODERATOR]: 1,
  [UserRole.ADMIN]: 2,
  [UserRole.CREATOR]: 3,
};

/**
 * True when `role` has at least the privilege of `minimum` (same rank or
 * higher). Use this for every authorization check so a higher role
 * automatically satisfies a lower requirement — e.g. a `CREATOR` passes an
 * `@Roles(ADMIN)` check (ADR-0011).
 */
export const hasAtLeast = (role: UserRole, minimum: UserRole): boolean =>
  ROLE_RANK[role] >= ROLE_RANK[minimum];
