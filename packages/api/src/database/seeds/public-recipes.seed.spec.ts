import { Repository } from 'typeorm';

import { RecipeOrmEntity } from '../../recipe/entities/recipe.orm.entity';
import { RecipeVisibility } from '../../recipe/domain/enums/recipe-visibility.enum';
import {
  PUBLIC_RECIPES_SEED,
  PUBLIC_RECIPES_SYSTEM_OWNER_ID,
  seedPublicRecipes,
} from './public-recipes.seed';

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

describe('seedPublicRecipes (Issue #701)', () => {
  describe('happy path', () => {
    it('inserts all 10 curated recipes when the table is empty', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      const result = await seedPublicRecipes(
        repo as unknown as Repository<RecipeOrmEntity>,
      );

      expect(result).toEqual({ inserted: 10, updated: 0, total: 10 });
      expect(repo.create).toHaveBeenCalledTimes(10);
      expect(repo.save).toHaveBeenCalledTimes(10);
    });

    it('tags every inserted row as PUBLIC + is_official + system owner', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      await seedPublicRecipes(repo as unknown as Repository<RecipeOrmEntity>);

      for (const call of repo.create.mock.calls as unknown[][]) {
        const arg = call[0] as Record<string, unknown>;
        expect(arg.visibility).toBe(RecipeVisibility.PUBLIC);
        expect(arg.is_official).toBe(true);
        expect(arg.owner_id).toBe(PUBLIC_RECIPES_SYSTEM_OWNER_ID);
        expect(arg.imported_from_recipe_id).toBeNull();
        expect(arg.import_provenance).toBeNull();
        expect(arg.parent_recipe_id).toBeNull();
        // Each recipe is its own root (no fork lineage on seed).
        expect(arg.root_recipe_id).toBe(arg.id);
        expect(arg.version).toBe(1);
      }
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

      expect(result).toEqual({ inserted: 0, updated: 10, total: 10 });
      expect(repo.create).not.toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalledTimes(10);
    });

    it('forces visibility back to PUBLIC when overwriting a row that drifted', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockImplementation(() =>
        Promise.resolve({
          id: 'drifted',
          visibility: RecipeVisibility.PRIVATE,
          is_official: false,
        }),
      );

      await seedPublicRecipes(repo as unknown as Repository<RecipeOrmEntity>);

      const firstSavedCall = repo.save.mock.calls[0] as unknown[];
      const savedCall = firstSavedCall[0] as Record<string, unknown>;
      expect(savedCall.visibility).toBe(RecipeVisibility.PUBLIC);
      expect(savedCall.is_official).toBe(true);
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

      expect(result).toEqual({ inserted: 7, updated: 3, total: 10 });
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

    it('exposes 10 curated recipes covering IPA / Belgian / Strong / Lager families', () => {
      expect(PUBLIC_RECIPES_SEED).toHaveLength(10);
      const names = PUBLIC_RECIPES_SEED.map((r) => r.name);
      expect(names).toContain('Session IPA Citra');
      expect(names).toContain('Belgian Tripel');
      expect(names).toContain('Saison Farmhouse');
      expect(names).toContain('Imperial Stout');
      expect(names).toContain('Kölsch Tradition');
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
