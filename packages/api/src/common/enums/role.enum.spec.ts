import { UserRole, ROLE_RANK, hasAtLeast } from './role.enum';

describe('role.enum — privilege ranking (ADR-0011)', () => {
  describe('ROLE_RANK', () => {
    it('orders the roles user < moderator < admin < creator', () => {
      expect(ROLE_RANK[UserRole.USER]).toBeLessThan(
        ROLE_RANK[UserRole.MODERATOR],
      );
      expect(ROLE_RANK[UserRole.MODERATOR]).toBeLessThan(
        ROLE_RANK[UserRole.ADMIN],
      );
      expect(ROLE_RANK[UserRole.ADMIN]).toBeLessThan(
        ROLE_RANK[UserRole.CREATOR],
      );
    });
  });

  describe('hasAtLeast', () => {
    it('is true for the same rank', () => {
      expect(hasAtLeast(UserRole.ADMIN, UserRole.ADMIN)).toBe(true);
    });

    it('is true for a higher rank (CREATOR satisfies ADMIN)', () => {
      expect(hasAtLeast(UserRole.CREATOR, UserRole.ADMIN)).toBe(true);
    });

    it('is false for a lower rank (USER does not satisfy MODERATOR)', () => {
      expect(hasAtLeast(UserRole.USER, UserRole.MODERATOR)).toBe(false);
    });

    it('lets CREATOR satisfy every role', () => {
      for (const role of Object.values(UserRole)) {
        expect(hasAtLeast(UserRole.CREATOR, role)).toBe(true);
      }
    });

    it('lets USER satisfy only USER', () => {
      expect(hasAtLeast(UserRole.USER, UserRole.USER)).toBe(true);
      expect(hasAtLeast(UserRole.USER, UserRole.MODERATOR)).toBe(false);
      expect(hasAtLeast(UserRole.USER, UserRole.ADMIN)).toBe(false);
      expect(hasAtLeast(UserRole.USER, UserRole.CREATOR)).toBe(false);
    });
  });
});
