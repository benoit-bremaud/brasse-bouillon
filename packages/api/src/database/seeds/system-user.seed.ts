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
 */
export async function seedSystemUser(
  repository: Repository<User>,
): Promise<SeedSystemUserResult> {
  const existing = await repository.findOne({ where: { id: SYSTEM_USER_ID } });

  if (existing) {
    return { inserted: false, user_id: SYSTEM_USER_ID };
  }

  // Random unguessable password — nobody ever logs in as 'system'.
  // Generate inside the function so each environment's hash is
  // distinct (defense in depth in case a hash leaks in one env).
  const randomPassword = `system-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
