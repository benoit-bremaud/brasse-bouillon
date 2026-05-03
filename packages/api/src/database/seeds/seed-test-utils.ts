/**
 * Shared test helpers for seed loaders.
 *
 * Each seed (system-user, scan-catalog, public-recipes, demo-batch)
 * follows the same idempotent contract: receives a TypeORM
 * `Repository`, looks up by id, creates or updates in place, returns
 * a stats object. The unit tests for those seeds therefore share the
 * same mock harness — keeping it in one place avoids verbatim copies
 * across the spec files (which SonarCloud flags as duplication on
 * new code).
 *
 * The runtime upsert helper (`idempotentUpsertById`) lives in
 * `seed-utils.ts` next to it — keeping the test harness separate so
 * the production bundle doesn't pull in jest types.
 */

/**
 * Minimal repository mock surface used across seed unit tests.
 * `findOne` is stubbed per-test to drive the insert vs update branch.
 * `create` echoes its input so assertions can introspect the payload.
 * `save` resolves with whatever it received so the loader sees a
 * persisted entity it can chain off of.
 */
export type RepoMock = {
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  /** Raw SQL escape hatch — used by seeds that bootstrap dependencies
   * (e.g. yeast seed self-seeds the 5 laboratory producers via
   * INSERT OR IGNORE before writing producer_id FKs). Other seeds
   * may leave it untouched. */
  query: jest.Mock;
};

/**
 * Constructs a fresh repository mock with the conventional defaults:
 * `create` returns its argument unchanged, `save` resolves with the
 * argument it received. `findOne` is left unstubbed — each test
 * configures it explicitly to express the scenario under test.
 * `query` resolves to undefined by default (sufficient for seeds
 * using it only for fire-and-forget INSERT OR IGNORE).
 */
export function buildRepoMock(): RepoMock {
  return {
    findOne: jest.fn(),
    create: jest.fn((input: unknown) => input),
    save: jest.fn((input: unknown) => Promise.resolve(input)),
    query: jest.fn(() => Promise.resolve(undefined)),
  };
}

/**
 * Shape every catalogue seeder follows: an idempotent loader that
 * accepts an override list and returns insert/update/total counters.
 * Generic over the seed entry shape so each catalogue can call this
 * helper with its own seed type while sharing the standard test
 * scenarios (happy / sad / mixed / override-list).
 */
export interface CatalogSeederUnderTest<S> {
  fn: (
    repository: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock },
    seeds?: readonly S[],
  ) => Promise<{ inserted: number; updated: number; total: number }>;
  /** Static const exposed by the seed module (e.g. HOPS_CATALOG_SEED). */
  data: readonly S[];
}

/**
 * Runs the four standard catalogue-seeder behaviours every catalogue
 * test file would otherwise duplicate verbatim:
 *
 *   - happy: inserts the full data set when the table is empty
 *   - sad/idempotency: updates existing rows in place, never duplicates
 *   - edge: mixes inserts and updates when only some IDs already exist
 *   - edge: respects an explicit override list
 *
 * The total entry count is asserted off `data.length`, so each
 * catalogue stays free to grow without touching the helper. The
 * mixed-insert/update split is tested with a 5-existing / rest-new
 * scenario regardless of total size, which exercises the same code
 * branch as a real partial-existing-state.
 *
 * Each catalogue's spec file then keeps only the catalogue-specific
 * assertions (name lookups, type coverage, French notes invariant,
 * etc.) — the shared boilerplate lives here, satisfying SonarCloud's
 * duplication gate without losing test rigor.
 */
export function assertCommonCatalogueSeederBehaviours<S>(
  label: string,
  seeder: CatalogSeederUnderTest<S>,
): void {
  const expectedCount = seeder.data.length;

  describe(`${label} — common catalogue-seeder behaviours`, () => {
    it(`happy: inserts all ${expectedCount} catalogue entries when the table is empty`, async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      const result = await seeder.fn(repo);

      expect(result).toEqual({
        inserted: expectedCount,
        updated: 0,
        total: expectedCount,
      });
      expect(repo.create).toHaveBeenCalledTimes(expectedCount);
      expect(repo.save).toHaveBeenCalledTimes(expectedCount);
    });

    it(`sad: idempotency — updates existing rows in place rather than duplicating`, async () => {
      const repo = buildRepoMock();
      repo.findOne.mockImplementation(() =>
        Promise.resolve({ id: 'will-be-overwritten' }),
      );

      const result = await seeder.fn(repo);

      expect(result).toEqual({
        inserted: 0,
        updated: expectedCount,
        total: expectedCount,
      });
      expect(repo.create).not.toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalledTimes(expectedCount);
    });

    it('edge: mixes inserts and updates when only some IDs already exist', async () => {
      const repo = buildRepoMock();
      let counter = 0;
      // First 5 already exist, the rest are new — exercises the
      // insert+update split branch.
      repo.findOne.mockImplementation(() => {
        counter += 1;
        return Promise.resolve(
          counter <= 5 ? { id: `existing-${counter}` } : null,
        );
      });

      const result = await seeder.fn(repo);

      expect(result).toEqual({
        inserted: expectedCount - 5,
        updated: 5,
        total: expectedCount,
      });
    });

    it('edge: respects an explicit override list', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      const overrides = seeder.data.slice(0, 3);
      const result = await seeder.fn(repo, overrides);

      expect(result).toEqual({ inserted: 3, updated: 0, total: 3 });
    });
  });
}
