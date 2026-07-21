import { Repository } from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { UserRole } from '../../common/enums/role.enum';
import { buildRepoMock } from './seed-test-utils';
import {
  DELETED_AUTHOR_EMAIL,
  DELETED_AUTHOR_ID,
  DELETED_AUTHOR_USERNAME,
  seedDeletedAuthor,
} from './deleted-author.seed';

describe('seedDeletedAuthor (account-deletion anonymization target)', () => {
  describe('happy path', () => {
    it('inserts the tombstone user when missing', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      const result = await seedDeletedAuthor(
        repo as unknown as Repository<User>,
      );

      expect(result).toEqual({ inserted: true, user_id: DELETED_AUTHOR_ID });
      expect(repo.create).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it('creates a non-loginable "Auteur supprimé" row at the anonymization id', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      await seedDeletedAuthor(repo as unknown as Repository<User>);

      const calls = repo.create.mock.calls as unknown[][];
      const created = calls[0][0] as Record<string, unknown>;
      expect(created.id).toBe(DELETED_AUTHOR_ID);
      expect(created.email).toBe(DELETED_AUTHOR_EMAIL);
      expect(created.username).toBe(DELETED_AUTHOR_USERNAME);
      expect(created.is_active).toBe(false);
      // A placeholder for orphaned content, not a privileged account.
      expect(created.role).toBe(UserRole.USER);
      expect(created.first_name).toBe('Auteur');
      expect(created.last_name).toBe('supprimé');
      // Random unguessable bcrypt hash so the tombstone can never be logged in.
      expect(typeof created.password_hash).toBe('string');
      expect(created.password_hash as string).toMatch(/^\$2[aby]\$/);
    });

    it('keeps the historical all-zero id so pre-anonymized recipes resolve', () => {
      expect(DELETED_AUTHOR_ID).toBe('00000000-0000-0000-0000-000000000000');
    });
  });

  describe('idempotency (sad path)', () => {
    it('does NOT recreate the tombstone if it already exists', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue({
        id: DELETED_AUTHOR_ID,
        email: DELETED_AUTHOR_EMAIL,
        username: DELETED_AUTHOR_USERNAME,
      });

      const result = await seedDeletedAuthor(
        repo as unknown as Repository<User>,
      );

      expect(result).toEqual({ inserted: false, user_id: DELETED_AUTHOR_ID });
      expect(repo.create).not.toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('collision guard (sad path)', () => {
    it('throws a clear error if a real account squats the reserved email', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue({
        id: 'real-user-uuid-not-the-sentinel',
        email: DELETED_AUTHOR_EMAIL,
        username: 'someone-else',
      });

      await expect(
        seedDeletedAuthor(repo as unknown as Repository<User>),
      ).rejects.toThrow(/reserved tombstone credentials/i);
      expect(repo.create).not.toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('throws a clear error if a real account squats the reserved username', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue({
        id: 'real-user-uuid-not-the-sentinel',
        email: 'someone@example.com',
        username: DELETED_AUTHOR_USERNAME,
      });

      await expect(
        seedDeletedAuthor(repo as unknown as Repository<User>),
      ).rejects.toThrow(/Manual reconciliation required/i);
    });

    it('looks up existence by id, email AND username (not just id)', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      await seedDeletedAuthor(repo as unknown as Repository<User>);

      const calls = repo.findOne.mock.calls as unknown[][];
      const arg = calls[0][0] as { where: unknown };
      expect(Array.isArray(arg.where)).toBe(true);
      expect(arg.where).toEqual(
        expect.arrayContaining([
          { id: DELETED_AUTHOR_ID },
          { email: DELETED_AUTHOR_EMAIL },
          { username: DELETED_AUTHOR_USERNAME },
        ]),
      );
    });
  });
});
