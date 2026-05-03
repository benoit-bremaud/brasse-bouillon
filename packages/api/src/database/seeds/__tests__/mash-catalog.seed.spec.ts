import { MASH_CATALOG_SEED, seedMashCatalog } from '../mash-catalog.seed';
import { MashProfileOrmEntity } from '../../../catalog/mash/entities/mash-profile.orm.entity';
import { MashStepOrmEntity } from '../../../catalog/mash/entities/mash-step.orm.entity';
import { MashStepType } from '../../../catalog/mash/domain/enums/mash-step-type.enum';
import { Repository } from 'typeorm';
import { buildRepoMock } from '../seed-test-utils';

/**
 * Seed spec for the mash catalogue. Cannot delegate to the
 * `assertCommonCatalogueSeederBehaviours` helper because the mash
 * seeder takes TWO repositories (profile + step) and returns a
 * different result shape (profilesInserted / stepsInserted) — the
 * 1:N parent-child structure is unique to this catalogue.
 */
describe('seedMashCatalog (Issue #708 / #869 — Phase 2 PR #5)', () => {
  const expectedProfileCount = MASH_CATALOG_SEED.length;
  const expectedStepCount = MASH_CATALOG_SEED.reduce(
    (sum, p) => sum + p.steps.length,
    0,
  );

  describe('happy path', () => {
    it('inserts all profiles and all their steps when both tables are empty', async () => {
      const profileRepo = buildRepoMock();
      const stepRepo = buildRepoMock();
      profileRepo.findOne.mockResolvedValue(null);
      stepRepo.findOne.mockResolvedValue(null);

      const result = await seedMashCatalog(
        profileRepo as unknown as Repository<MashProfileOrmEntity>,
        stepRepo as unknown as Repository<MashStepOrmEntity>,
      );

      expect(result.profilesInserted).toBe(expectedProfileCount);
      expect(result.profilesUpdated).toBe(0);
      expect(result.profilesTotal).toBe(expectedProfileCount);
      expect(result.stepsInserted).toBe(expectedStepCount);
      expect(result.stepsUpdated).toBe(0);
      expect(result.stepsTotal).toBe(expectedStepCount);
    });

    it('writes the correct mash_profile_id FK on every step', async () => {
      const profileRepo = buildRepoMock();
      const stepRepo = buildRepoMock();
      profileRepo.findOne.mockResolvedValue(null);
      stepRepo.findOne.mockResolvedValue(null);

      await seedMashCatalog(
        profileRepo as unknown as Repository<MashProfileOrmEntity>,
        stepRepo as unknown as Repository<MashStepOrmEntity>,
      );

      // Walk the step create() calls and check each carries a
      // mash_profile_id matching one of the profile IDs in the seed.
      const profileIds = new Set(MASH_CATALOG_SEED.map((p) => p.id));
      for (const call of stepRepo.create.mock.calls as unknown[][]) {
        const arg = call[0] as Record<string, unknown>;
        expect(profileIds.has(arg.mash_profile_id as string)).toBe(true);
        expect(typeof arg.step_index).toBe('number');
        expect(Object.values(MashStepType)).toContain(arg.type);
      }
    });
  });

  describe('idempotency (sad path)', () => {
    it('updates existing rows in place rather than duplicating', async () => {
      const profileRepo = buildRepoMock();
      const stepRepo = buildRepoMock();
      profileRepo.findOne.mockImplementation(() =>
        Promise.resolve({ id: 'existing-profile' }),
      );
      stepRepo.findOne.mockImplementation(() =>
        Promise.resolve({ id: 'existing-step' }),
      );

      const result = await seedMashCatalog(
        profileRepo as unknown as Repository<MashProfileOrmEntity>,
        stepRepo as unknown as Repository<MashStepOrmEntity>,
      );

      expect(result.profilesInserted).toBe(0);
      expect(result.profilesUpdated).toBe(expectedProfileCount);
      expect(result.stepsInserted).toBe(0);
      expect(result.stepsUpdated).toBe(expectedStepCount);
      expect(profileRepo.create).not.toHaveBeenCalled();
      expect(stepRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('respects an explicit override list', async () => {
      const profileRepo = buildRepoMock();
      const stepRepo = buildRepoMock();
      profileRepo.findOne.mockResolvedValue(null);
      stepRepo.findOne.mockResolvedValue(null);

      const overrides = MASH_CATALOG_SEED.slice(0, 2);
      const expectedOverrideSteps = overrides.reduce(
        (sum, p) => sum + p.steps.length,
        0,
      );

      const result = await seedMashCatalog(
        profileRepo as unknown as Repository<MashProfileOrmEntity>,
        stepRepo as unknown as Repository<MashStepOrmEntity>,
        overrides,
      );

      expect(result.profilesInserted).toBe(2);
      expect(result.profilesTotal).toBe(2);
      expect(result.stepsInserted).toBe(expectedOverrideSteps);
      expect(result.stepsTotal).toBe(expectedOverrideSteps);
    });

    it('exposes 10 curated profiles with 5 BeerXML + 5 modern entries', () => {
      expect(MASH_CATALOG_SEED).toHaveLength(10);

      const names = MASH_CATALOG_SEED.map((p) => p.name);
      // 5 BeerXML canonical (libraries/mash.xml)
      expect(names).toContain('Temperature Mash, 1 Step, Light Body');
      expect(names).toContain('Single Infusion, Light Body, No Mash Out');
      expect(names).toContain('Single Infusion, Full Body');
      expect(names).toContain('Double Infusion, Medium Body');
      expect(names).toContain('Decoction Mash, Triple');
      // Modern profiles for the demo recipes
      expect(names).toContain(
        'Single Infusion 65°C 60min (American Pale / IPA)',
      );
      expect(names).toContain('Step Mash 50→65→78°C (Witbier / Hefeweizen)');
      expect(names).toContain('Hochkurz Lager (Pilsner / Helles classique)');
    });

    it('uses deterministic UUIDs in the profile range (...-9000-4000-...)', () => {
      const ids = MASH_CATALOG_SEED.map((p) => p.id);
      for (const id of ids) {
        expect(id).toMatch(/^00000000-0000-4000-9000-4[0-9a-f]{11}$/);
      }
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('keeps step_index dense (1, 2, 3...) within every profile', () => {
      // Mash steps must form a dense sequence so the UI can iterate
      // them as `1..steps.length` without gaps.
      for (const profile of MASH_CATALOG_SEED) {
        const indexes = profile.steps.map((s) => s.step_index).sort();
        for (let i = 0; i < indexes.length; i += 1) {
          expect(indexes[i]).toBe(i + 1);
        }
      }
    });

    it('every step references a valid mash step type (infusion/temperature/decoction)', () => {
      for (const profile of MASH_CATALOG_SEED) {
        for (const step of profile.steps) {
          expect(Object.values(MashStepType)).toContain(step.type);
        }
      }
    });

    it('keeps every profile note value in French (UI-facing convention)', () => {
      for (const profile of MASH_CATALOG_SEED) {
        if (profile.notes !== null) {
          expect(profile.notes).toMatch(/[àâäéèêëïîôöùûüÿç]/i);
        }
      }
    });
  });
});
