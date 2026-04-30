import { Repository } from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { UserRole } from '../../common/enums/role.enum';
import { buildRepoMock } from './seed-test-utils';
import {
  SYSTEM_USER_EMAIL,
  SYSTEM_USER_ID,
  SYSTEM_USER_USERNAME,
  seedSystemUser,
} from './system-user.seed';

describe('seedSystemUser (Issue #701 prerequisite)', () => {
  describe('happy path', () => {
    it('inserts the system user when missing', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      const result = await seedSystemUser(repo as unknown as Repository<User>);

      expect(result).toEqual({ inserted: true, user_id: SYSTEM_USER_ID });
      expect(repo.create).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it('creates the user with deterministic id, email, username and is_active=false', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      await seedSystemUser(repo as unknown as Repository<User>);

      const calls = repo.create.mock.calls as unknown[][];
      const created = calls[0][0] as Record<string, unknown>;
      expect(created.id).toBe(SYSTEM_USER_ID);
      expect(created.email).toBe(SYSTEM_USER_EMAIL);
      expect(created.username).toBe(SYSTEM_USER_USERNAME);
      expect(created.is_active).toBe(false);
      expect(created.role).toBe(UserRole.ADMIN);
      expect(created.first_name).toBe('System');
      expect(created.last_name).toBe('Brasse-Bouillon');
      // Random unguessable password — non-empty bcrypt hash starting
      // with $2 (bcrypt format), distinct on each call.
      expect(typeof created.password_hash).toBe('string');
      expect(created.password_hash as string).toMatch(/^\$2[aby]\$/);
    });
  });

  describe('idempotency (sad path)', () => {
    it('does NOT recreate the user if it already exists', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue({
        id: SYSTEM_USER_ID,
        email: SYSTEM_USER_EMAIL,
        username: SYSTEM_USER_USERNAME,
      });

      const result = await seedSystemUser(repo as unknown as Repository<User>);

      expect(result).toEqual({ inserted: false, user_id: SYSTEM_USER_ID });
      expect(repo.create).not.toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('treats the existing row as immutable (does not overwrite drift)', async () => {
      const repo = buildRepoMock();
      // Even if the existing row has been tampered with (e.g.
      // is_active=true), the seed leaves it alone. Better than
      // silently re-locking an account that may have been promoted.
      repo.findOne.mockResolvedValue({
        id: SYSTEM_USER_ID,
        is_active: true,
        role: UserRole.USER,
      });

      await seedSystemUser(repo as unknown as Repository<User>);

      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('collision guard (sad path)', () => {
    it('treats a row matching by email (different id) as the existing system user and skips', async () => {
      const repo = buildRepoMock();
      // Mimic TypeORM's OR-array `where` lookup — return a row that
      // matches the reserved email but lives under the system id.
      // The seed must skip without throwing or recreating.
      repo.findOne.mockResolvedValue({
        id: SYSTEM_USER_ID,
        email: SYSTEM_USER_EMAIL,
        username: SYSTEM_USER_USERNAME,
      });

      const result = await seedSystemUser(repo as unknown as Repository<User>);

      expect(result).toEqual({ inserted: false, user_id: SYSTEM_USER_ID });
      expect(repo.create).not.toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('throws a clear error if a non-system user squats the reserved email', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue({
        id: 'real-user-uuid-not-the-sentinel',
        email: SYSTEM_USER_EMAIL,
        username: 'someone-else',
      });

      await expect(
        seedSystemUser(repo as unknown as Repository<User>),
      ).rejects.toThrow(/reserved system credentials/i);
      expect(repo.create).not.toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('throws a clear error if a non-system user squats the reserved username', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue({
        id: 'real-user-uuid-not-the-sentinel',
        email: 'someone@example.com',
        username: SYSTEM_USER_USERNAME,
      });

      await expect(
        seedSystemUser(repo as unknown as Repository<User>),
      ).rejects.toThrow(/Manual reconciliation required/i);
    });

    it('looks up existence by id, email AND username (not just id)', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      await seedSystemUser(repo as unknown as Repository<User>);

      const calls = repo.findOne.mock.calls as unknown[][];
      const arg = calls[0][0] as { where: unknown };
      // OR-style lookup: an array of partial matchers covering all
      // three reserved keys. Without this, a colliding email/username
      // on a non-empty DB would crash the public-recipes orchestrator.
      expect(Array.isArray(arg.where)).toBe(true);
      expect(arg.where).toEqual(
        expect.arrayContaining([
          { id: SYSTEM_USER_ID },
          { email: SYSTEM_USER_EMAIL },
          { username: SYSTEM_USER_USERNAME },
        ]),
      );
    });
  });

  describe('edge cases', () => {
    it('uses a fresh random password on each new insert', async () => {
      const repo1 = buildRepoMock();
      repo1.findOne.mockResolvedValue(null);
      const repo2 = buildRepoMock();
      repo2.findOne.mockResolvedValue(null);

      await seedSystemUser(repo1 as unknown as Repository<User>);
      await seedSystemUser(repo2 as unknown as Repository<User>);

      const calls1 = repo1.create.mock.calls as unknown[][];
      const calls2 = repo2.create.mock.calls as unknown[][];
      const hash1 = (calls1[0][0] as Record<string, unknown>)
        .password_hash as string;
      const hash2 = (calls2[0][0] as Record<string, unknown>)
        .password_hash as string;

      // Two distinct invocations → two distinct hashes (bcrypt salt
      // randomized per call). Defense in depth: even if a hash
      // leaks in one env, others stay safe.
      expect(hash1).not.toBe(hash2);
    });
  });
});
