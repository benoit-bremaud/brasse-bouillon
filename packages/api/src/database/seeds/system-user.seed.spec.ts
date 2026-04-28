import { Repository } from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { UserRole } from '../../common/enums/role.enum';
import {
  SYSTEM_USER_EMAIL,
  SYSTEM_USER_ID,
  SYSTEM_USER_USERNAME,
  seedSystemUser,
} from './system-user.seed';

type RepoMock = {
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
};

function buildRepoMock(): RepoMock {
  return {
    findOne: jest.fn(),
    create: jest.fn((input: unknown) => input),
    save: jest.fn((input: unknown) => Promise.resolve(input)),
  };
}

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
