import { Repository } from 'typeorm';

import { RecipeOrmEntity } from '../../recipe/entities/recipe.orm.entity';
import { RecipeVisibility } from '../../recipe/domain/enums/recipe-visibility.enum';
import {
  PUBLIC_RECIPES_SEED,
  PUBLIC_RECIPES_SYSTEM_OWNER_ID,
  seedPublicRecipes,
} from './public-recipes.seed';
import { buildRepoMock } from './seed-test-utils';

describe('seedPublicRecipes (Issue #701)', () => {
  describe('happy path', () => {
    it('inserts all 11 curated recipes when the table is empty', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      const result = await seedPublicRecipes(
        repo as unknown as Repository<RecipeOrmEntity>,
      );

      expect(result).toEqual({ inserted: 11, updated: 0, total: 11 });
      expect(repo.create).toHaveBeenCalledTimes(11);
      expect(repo.save).toHaveBeenCalledTimes(11);
    });

    it('tags every inserted row as PUBLIC + system owner with the seed-declared is_official flag', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      await seedPublicRecipes(repo as unknown as Repository<RecipeOrmEntity>);

      for (const call of repo.create.mock.calls as unknown[][]) {
        const arg = call[0] as Record<string, unknown>;
        expect(arg.visibility).toBe(RecipeVisibility.PUBLIC);
        expect(arg.owner_id).toBe(PUBLIC_RECIPES_SYSTEM_OWNER_ID);
        expect(arg.imported_from_recipe_id).toBeNull();
        expect(arg.import_provenance).toBeNull();
        expect(arg.parent_recipe_id).toBeNull();
        // Each recipe is its own root (no fork lineage on seed).
        expect(arg.root_recipe_id).toBe(arg.id);
        expect(arg.version).toBe(1);
      }
    });

    it('keeps every backend-seeded recipe non-official to avoid the global-flag regression (Issue #911 / Codex P1 on PR #912)', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      await seedPublicRecipes(repo as unknown as Repository<RecipeOrmEntity>);

      const createdRows = (repo.create.mock.calls as unknown[][]).map(
        (call) => call[0] as Record<string, unknown>,
      );
      // The matching algorithm (Issue #699) treats `is_official=true`
      // as a GLOBAL per-recipe 100-point shortcut — `rankForBeer`
      // evaluates every PUBLIC recipe against every scanned beer.
      // Tagging the DIY Dog entry would surface it as the "official"
      // recipe for unrelated beers (La Chouffe, Rochefort, etc.) —
      // the regression Codex caught on PR #773 and re-flagged as P1
      // on PR #912. The "🏆 Recette officielle" demo beat is wired
      // via the mobile-side `demoEquivalentRecipes` mock, scoped
      // per-barcode. Backend-mode per-beer linking is deferred.
      const officials = createdRows.filter((row) => row.is_official === true);
      expect(officials).toHaveLength(0);
      const nonOfficials = createdRows.filter(
        (row) => row.is_official === false,
      );
      expect(nonOfficials).toHaveLength(11);
    });
  });

  describe('idempotency (sad path)', () => {
    it('updates existing rows in place rather than duplicating them', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockImplementation(() =>
        Promise.resolve({
          id: 'will-be-overwritten',
          name: 'old-name',
          visibility: RecipeVisibility.PRIVATE,
        }),
      );

      const result = await seedPublicRecipes(
        repo as unknown as Repository<RecipeOrmEntity>,
      );

      expect(result).toEqual({ inserted: 0, updated: 11, total: 11 });
      expect(repo.create).not.toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalledTimes(11);
    });

    it('forces visibility back to PUBLIC and is_official back to false when overwriting a drifted row', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockImplementation(() =>
        Promise.resolve({
          id: 'drifted',
          visibility: RecipeVisibility.PRIVATE,
          // Drifted to true — the seed must reset this back to false
          // so a manually-flipped row does not silently degenerate
          // the matching ranking next time the seed runs.
          is_official: true,
        }),
      );

      await seedPublicRecipes(repo as unknown as Repository<RecipeOrmEntity>);

      const firstSavedCall = repo.save.mock.calls[0] as unknown[];
      const savedCall = firstSavedCall[0] as Record<string, unknown>;
      expect(savedCall.visibility).toBe(RecipeVisibility.PUBLIC);
      expect(savedCall.is_official).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('mixes inserts and updates when only some IDs already exist', async () => {
      const repo = buildRepoMock();
      // First three IDs exist, last seven do not.
      let counter = 0;
      repo.findOne.mockImplementation(() => {
        counter += 1;
        return Promise.resolve(
          counter <= 3 ? { id: `existing-${counter}` } : null,
        );
      });

      const result = await seedPublicRecipes(
        repo as unknown as Repository<RecipeOrmEntity>,
      );

      expect(result).toEqual({ inserted: 8, updated: 3, total: 11 });
    });

    it('respects an explicit override list (e.g. tests, alternate demo data)', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      const customRecipes = PUBLIC_RECIPES_SEED.slice(0, 2);

      const result = await seedPublicRecipes(
        repo as unknown as Repository<RecipeOrmEntity>,
        customRecipes,
      );

      expect(result).toEqual({ inserted: 2, updated: 0, total: 2 });
    });

    it('exposes 11 curated recipes covering IPA / Belgian / Strong / Lager families plus the official DIY Dog', () => {
      expect(PUBLIC_RECIPES_SEED).toHaveLength(11);
      const names = PUBLIC_RECIPES_SEED.map((r) => r.name);
      expect(names).toContain('Session IPA Citra');
      expect(names).toContain('Belgian Tripel');
      expect(names).toContain('Saison Farmhouse');
      expect(names).toContain('Imperial Stout');
      expect(names).toContain('Kölsch Tradition');
      expect(names).toContain('BrewDog DIY Dog Punk IPA');
    });

    it('tags every seeded recipe with a non-empty style for the matching algorithm', () => {
      // The matching service (Issue #699) leans on `style` as the
      // 50%-weighted similarity signal — a missing or empty style
      // would silently drop a recipe to ABV-only ranking and
      // demote it under any IPA in the editorial top-3.
      for (const recipe of PUBLIC_RECIPES_SEED) {
        expect(typeof recipe.style).toBe('string');
        expect(recipe.style.length).toBeGreaterThan(0);
      }
    });

    it('uses deterministic UUIDs (sequential v4-shaped) so mobile mocks can hardcode references', () => {
      const ids = PUBLIC_RECIPES_SEED.map((r) => r.id);
      // All IDs share the system prefix; only the last segment differs.
      for (const id of ids) {
        expect(id).toMatch(/^00000000-0000-4000-8000-00000000000[0-9a-f]$/);
      }
      // No duplicates.
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
