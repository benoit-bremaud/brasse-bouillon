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
};

/**
 * Constructs a fresh repository mock with the conventional defaults:
 * `create` returns its argument unchanged, `save` resolves with the
 * argument it received. `findOne` is left unstubbed — each test
 * configures it explicitly to express the scenario under test.
 */
export function buildRepoMock(): RepoMock {
  return {
    findOne: jest.fn(),
    create: jest.fn((input: unknown) => input),
    save: jest.fn((input: unknown) => Promise.resolve(input)),
  };
}
