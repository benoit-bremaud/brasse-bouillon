import { randomBytes } from 'node:crypto';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../../user/entities/user.entity';
import { UserRole } from '../../common/enums/role.enum';

/**
 * System user seed (Issue #701 prerequisite).
 *
 * Creates a non-loginable system account that owns all curated
 * public content (public recipes, future seeded community ratings,
 * etc.). The recipes table has a FK constraint
 * `owner_id REFERENCES users(id)` so any seeded public recipe
 * needs a real user row to point at.
 *
 * The account:
 * - has a deterministic UUID so other seeds can reference it
 * - has a random unguessable password hash (no one can ever log in
 *   as 'system' even if the account leaks)
 * - is `is_active: false` to belt-and-braces block login attempts
 * - has role `admin` (only valid CHECK constraint values are
 *   'admin' / 'user' / 'moderator' — admin is the closest fit for
 *   a content-curator system account)
 *
 * The loader is idempotent — if the row exists, it's left
 * untouched. We never overwrite the system user in case anything
 * downstream came to rely on its current state.
 */

/**
 * Sentinel UUID — referenced by other seeds (e.g. PUBLIC_RECIPES_SEED).
 * Must remain stable across all environments and never collide with
 * a real user-issued UUID (uses the all-zero variant).
 */
export const SYSTEM_USER_ID = '00000000-0000-4000-8000-000000000000';

export const SYSTEM_USER_EMAIL = 'system@brasse-bouillon.local';
export const SYSTEM_USER_USERNAME = 'system';

export interface SeedSystemUserResult {
  inserted: boolean;
  user_id: string;
}

/**
 * Idempotent loader for the system user. Returns whether the row
 * was actually inserted (false if it already existed).
 *
 * Existence is checked by id, email, *and* username — `users.email`
 * and `users.username` both have UNIQUE indexes, so a row carrying
 * either reserved value (even under a different id) would otherwise
 * trip a unique-constraint failure mid-seed and abort the whole
 * orchestration on a non-empty database. Matching on any of the
 * three keeps the seed truly idempotent outside a fresh DB.
 */
export async function seedSystemUser(
  repository: Repository<User>,
): Promise<SeedSystemUserResult> {
  const existing = await repository.findOne({
    where: [
      { id: SYSTEM_USER_ID },
      { email: SYSTEM_USER_EMAIL },
      { username: SYSTEM_USER_USERNAME },
    ],
  });

  if (existing) {
    if (existing.id !== SYSTEM_USER_ID) {
      // A real user account is squatting on the reserved system
      // credentials. Refuse loudly rather than silently rewriting
      // their row or letting the seed crash deeper down on the FK
      // from public recipes — manual cleanup is required.
      throw new Error(
        `seedSystemUser: reserved system credentials (email=${SYSTEM_USER_EMAIL}, username=${SYSTEM_USER_USERNAME}) ` +
          `are already taken by user ${existing.id}. Manual reconciliation required before seeding.`,
      );
    }
    return { inserted: false, user_id: SYSTEM_USER_ID };
  }

  // Random unguessable password — nobody ever logs in as 'system'.
  // Use crypto.randomBytes for cryptographic randomness (not
  // Math.random which is predictable). 32 bytes → 64 hex chars,
  // way beyond what bcrypt can meaningfully hash.
  const randomPassword = randomBytes(32).toString('hex');
  const passwordHash = await bcrypt.hash(randomPassword, 10);

  const created = repository.create({
    id: SYSTEM_USER_ID,
    email: SYSTEM_USER_EMAIL,
    username: SYSTEM_USER_USERNAME,
    password_hash: passwordHash,
    first_name: 'System',
    last_name: 'Brasse-Bouillon',
    role: UserRole.ADMIN,
    is_active: false,
  });

  await repository.save(created);

  return { inserted: true, user_id: SYSTEM_USER_ID };
}
