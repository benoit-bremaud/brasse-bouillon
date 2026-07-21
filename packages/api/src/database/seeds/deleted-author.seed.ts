import { randomBytes } from 'node:crypto';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../../user/entities/user.entity';
import { UserRole } from '../../common/enums/role.enum';

/**
 * Deleted-author tombstone seed.
 *
 * When an account is erased (ADR-0012), the user's *public* recipes are not
 * deleted — the shared content stays online, only its authorship is
 * anonymized by repointing `recipes.owner_id` at this tombstone account.
 * The recipes table has a FK `owner_id REFERENCES users(id)` (ON DELETE
 * CASCADE), so the anonymization target MUST be a real user row: without it
 * the UPDATE trips a foreign-key failure and the whole deletion transaction
 * aborts, leaving the account un-erasable.
 *
 * This account is deliberately distinct from the `system` curator account
 * (system-user.seed): a recipe orphaned by its author's deletion is NOT
 * official Brasse-Bouillon content, so it must not be conflated with the
 * curated catalogue the system user owns. It renders as "Auteur supprimé".
 *
 * The account:
 * - has a deterministic UUID so `AccountDeletionService` can reference it;
 * - reuses the historical all-zero anonymization id, so any recipe already
 *   anonymized against it becomes a valid FK once this row exists;
 * - has a random unguessable password hash and `is_active: false` — nobody
 *   can ever log in as the deleted-author placeholder.
 *
 * The loader is idempotent — an existing row is left untouched.
 */

/**
 * Sentinel UUID for the deleted-author tombstone. Referenced by
 * `AccountDeletionService` as the anonymization target. Kept at the legacy
 * all-zero value so pre-existing anonymized recipes resolve to this row.
 */
export const DELETED_AUTHOR_ID = '00000000-0000-0000-0000-000000000000';

export const DELETED_AUTHOR_EMAIL = 'deleted-author@brasse-bouillon.local';
export const DELETED_AUTHOR_USERNAME = 'deleted-author';

export interface SeedDeletedAuthorResult {
  inserted: boolean;
  user_id: string;
}

/**
 * Idempotent loader for the deleted-author tombstone. Returns whether the
 * row was actually inserted (false if it already existed).
 *
 * Existence is checked by id, email, *and* username — `users.email` and
 * `users.username` both carry UNIQUE indexes, so a row holding either
 * reserved value under a different id would otherwise abort the seed on a
 * non-empty database. Matching on any of the three keeps it idempotent
 * outside a fresh DB.
 */
export async function seedDeletedAuthor(
  repository: Repository<User>,
): Promise<SeedDeletedAuthorResult> {
  const existing = await repository.findOne({
    where: [
      { id: DELETED_AUTHOR_ID },
      { email: DELETED_AUTHOR_EMAIL },
      { username: DELETED_AUTHOR_USERNAME },
    ],
  });

  if (existing) {
    if (existing.id !== DELETED_AUTHOR_ID) {
      // A real account is squatting on the reserved tombstone credentials.
      // Refuse loudly rather than rewrite their row or let the anonymization
      // FK crash later — manual reconciliation is required.
      throw new Error(
        `seedDeletedAuthor: reserved tombstone credentials (email=${DELETED_AUTHOR_EMAIL}, username=${DELETED_AUTHOR_USERNAME}) ` +
          `are already taken by user ${existing.id}. Manual reconciliation required before seeding.`,
      );
    }
    return { inserted: false, user_id: DELETED_AUTHOR_ID };
  }

  // Random unguessable password — nobody ever logs in as the tombstone.
  const randomPassword = randomBytes(32).toString('hex');
  const passwordHash = await bcrypt.hash(randomPassword, 10);

  const created = repository.create({
    id: DELETED_AUTHOR_ID,
    email: DELETED_AUTHOR_EMAIL,
    username: DELETED_AUTHOR_USERNAME,
    password_hash: passwordHash,
    first_name: 'Auteur',
    last_name: 'supprimé',
    role: UserRole.USER,
    is_active: false,
  });

  await repository.save(created);

  return { inserted: true, user_id: DELETED_AUTHOR_ID };
}
