import {
  DeepPartial,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';

/**
 * Outcome of one idempotent upsert. Lets seed loaders accumulate
 * insert vs update counters without re-querying the table.
 */
export type UpsertOutcome = {
  inserted: 0 | 1;
  updated: 0 | 1;
};

/**
 * Generic idempotent upsert helper used across seed loaders.
 *
 * The seed-time contract every loader follows: look up the row by
 * deterministic identifier, update it in place when present, insert
 * it otherwise. The pattern is repeated verbatim across multiple
 * seeds (system-user, scan-catalog, public-recipes, demo-batch) —
 * extracting it here avoids the verbatim duplication that
 * SonarCloud flags as new-code duplication, and keeps the loaders
 * focused on their per-row payload.
 *
 * Generic over the entity type so the helper preserves the strict
 * typing of each repository's `create` and `save` methods.
 *
 * @param repository — TypeORM repository targeting the entity table.
 * @param where — predicate uniquely identifying the row by its
 *                deterministic seed identifier (typically `{ id }`).
 * @param payload — full data to write, both for insert and update.
 *                  On update, fields are spread onto the existing
 *                  entity via Object.assign so any column not in
 *                  payload retains its previous value.
 */
export async function idempotentUpsertById<T extends ObjectLiteral>(
  repository: Repository<T>,
  where: FindOptionsWhere<T>,
  payload: DeepPartial<T>,
): Promise<UpsertOutcome> {
  const existing = await repository.findOne({ where });
  if (existing) {
    Object.assign(existing, payload);
    await repository.save(existing);
    return { inserted: 0, updated: 1 };
  }
  const created = repository.create({
    ...where,
    ...payload,
  } as DeepPartial<T>);
  await repository.save(created);
  return { inserted: 1, updated: 0 };
}
