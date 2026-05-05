import { Repository } from 'typeorm';

import {
  BREWDOG_DIY_DOG_BASE_PROVENANCE,
  BREWDOG_DIY_DOG_SEED,
  BREWDOG_DIY_DOG_SYSTEM_OWNER_ID,
  buildBrewdogDiyDogProvenance,
  seedBrewdogDiyDogRecipes,
} from './brewdog-diy-dog-recipes.seed';
import { RecipeFermentableOrmEntity } from '../../recipe/entities/recipe-fermentable.orm.entity';
import { RecipeHopOrmEntity } from '../../recipe/entities/recipe-hop.orm.entity';
import { RecipeOrmEntity } from '../../recipe/entities/recipe.orm.entity';
import { RecipeVisibility } from '../../recipe/domain/enums/recipe-visibility.enum';
import { RecipeYeastOrmEntity } from '../../recipe/entities/recipe-yeast.orm.entity';
import { RepoMock, buildRepoMock } from './seed-test-utils';

interface SeedRepoMocks {
  recipeRepo: RepoMock;
  fermentableRepo: RepoMock;
  hopRepo: RepoMock;
  yeastRepo: RepoMock;
}

function buildSeedRepos(): SeedRepoMocks {
  return {
    recipeRepo: buildRepoMock(),
    fermentableRepo: buildRepoMock(),
    hopRepo: buildRepoMock(),
    yeastRepo: buildRepoMock(),
  };
}

function castRepo<T>(repo: RepoMock): Repository<T> {
  return repo as unknown as Repository<T>;
}

async function runSeed(repos: SeedRepoMocks, recipes = BREWDOG_DIY_DOG_SEED) {
  return seedBrewdogDiyDogRecipes(
    castRepo<RecipeOrmEntity>(repos.recipeRepo),
    castRepo<RecipeFermentableOrmEntity>(repos.fermentableRepo),
    castRepo<RecipeHopOrmEntity>(repos.hopRepo),
    castRepo<RecipeYeastOrmEntity>(repos.yeastRepo),
    recipes,
  );
}

describe('seedBrewdogDiyDogRecipes (Issue #780)', () => {
  describe('happy path', () => {
    it('inserts every seeded recipe + its full ingredient breakdown when the table is empty', async () => {
      const repos = buildSeedRepos();
      repos.recipeRepo.findOne.mockResolvedValue(null);

      const result = await runSeed(repos);

      expect(result.recipesInserted).toBe(BREWDOG_DIY_DOG_SEED.length);
      expect(result.recipesUpdated).toBe(0);
      expect(result.total).toBe(BREWDOG_DIY_DOG_SEED.length);

      const expectedFermentables = BREWDOG_DIY_DOG_SEED.reduce(
        (sum, recipe) => sum + recipe.fermentables.length,
        0,
      );
      const expectedHops = BREWDOG_DIY_DOG_SEED.reduce(
        (sum, recipe) => sum + recipe.hops.length,
        0,
      );
      const expectedYeasts = BREWDOG_DIY_DOG_SEED.reduce(
        (sum, recipe) => sum + recipe.yeasts.length,
        0,
      );

      expect(result.fermentablesInserted).toBe(expectedFermentables);
      expect(result.hopsInserted).toBe(expectedHops);
      expect(result.yeastsInserted).toBe(expectedYeasts);
    });

    it('tags every recipe row as PUBLIC + system owner + DIY Dog provenance (with per-recipe source URL) + non-official', async () => {
      const repos = buildSeedRepos();
      repos.recipeRepo.findOne.mockResolvedValue(null);

      await runSeed(repos);

      const createCalls = repos.recipeRepo.create.mock.calls as unknown[][];
      expect(createCalls).toHaveLength(BREWDOG_DIY_DOG_SEED.length);

      createCalls.forEach((call, index) => {
        const arg = call[0] as Record<string, unknown>;
        const seedRecipe = BREWDOG_DIY_DOG_SEED[index];
        expect(arg.visibility).toBe(RecipeVisibility.PUBLIC);
        expect(arg.owner_id).toBe(BREWDOG_DIY_DOG_SYSTEM_OWNER_ID);
        // Provenance is per-recipe so the database row carries a
        // traceable pointer back to the source page (Copilot review on
        // PR #921 — the previous global constant dropped `source_url`
        // silently).
        expect(arg.import_provenance).toContain(
          BREWDOG_DIY_DOG_BASE_PROVENANCE,
        );
        expect(arg.import_provenance).toContain(seedRecipe.source_url);
        expect(arg.import_provenance).toBe(
          buildBrewdogDiyDogProvenance(seedRecipe.source_url),
        );
        expect(arg.imported_from_recipe_id).toBeNull();
        expect(arg.parent_recipe_id).toBeNull();
        // is_official is deliberately false on every backend row to
        // avoid the global-flag regression caught on PR #773 / #912 —
        // same lesson as `public-recipes.seed.ts`.
        expect(arg.is_official).toBe(false);
        // brew_count must be a number (entity column is non-nullable
        // with default 0) — the seed coalesces undefined to 0 rather
        // than passing it through to a NULL violation (Copilot review
        // on PR #921).
        expect(typeof arg.brew_count).toBe('number');
      });
    });
  });

  describe('idempotency (sad path)', () => {
    it('updates existing recipe rows in place and wipes-then-refills the sub-tables', async () => {
      const repos = buildSeedRepos();
      repos.recipeRepo.findOne.mockImplementation(() =>
        Promise.resolve({
          id: 'will-be-overwritten',
          name: 'old-name',
          visibility: RecipeVisibility.PRIVATE,
        }),
      );

      const result = await runSeed(repos);

      expect(result.recipesInserted).toBe(0);
      expect(result.recipesUpdated).toBe(BREWDOG_DIY_DOG_SEED.length);
      expect(repos.recipeRepo.create).not.toHaveBeenCalled();
      // Each recipe triggers exactly one delete + N saves on each
      // sub-table; verify the deletes ran (idempotency hinges on it).
      expect(repos.fermentableRepo.delete).toHaveBeenCalledTimes(
        BREWDOG_DIY_DOG_SEED.length,
      );
      expect(repos.hopRepo.delete).toHaveBeenCalledTimes(
        BREWDOG_DIY_DOG_SEED.length,
      );
      expect(repos.yeastRepo.delete).toHaveBeenCalledTimes(
        BREWDOG_DIY_DOG_SEED.length,
      );
    });

    it('forces drifted recipe rows back to PUBLIC + non-official + canonical provenance on overwrite', async () => {
      const repos = buildSeedRepos();
      repos.recipeRepo.findOne.mockImplementation(() =>
        Promise.resolve({
          id: 'drifted',
          visibility: RecipeVisibility.PRIVATE,
          // Drifted to true — the seed must reset it so a manually
          // flipped row does not silently degrade matching ranking.
          is_official: true,
          import_provenance: 'manually edited',
        }),
      );

      await runSeed(repos);

      const firstSavedCall = repos.recipeRepo.save.mock.calls[0] as unknown[];
      const savedCall = firstSavedCall[0] as Record<string, unknown>;
      expect(savedCall.visibility).toBe(RecipeVisibility.PUBLIC);
      expect(savedCall.is_official).toBe(false);
      expect(savedCall.import_provenance).toBe(
        buildBrewdogDiyDogProvenance(BREWDOG_DIY_DOG_SEED[0].source_url),
      );
    });

    it('coalesces an omitted brew_count seed value to 0 rather than passing undefined to the non-nullable column', async () => {
      const repos = buildSeedRepos();
      repos.recipeRepo.findOne.mockResolvedValue(null);

      const recipeWithoutBrewCount = {
        ...BREWDOG_DIY_DOG_SEED[0],
        brew_count: undefined,
      };

      await runSeed(repos, [recipeWithoutBrewCount]);

      const createdArg = (
        repos.recipeRepo.create.mock.calls[0] as unknown[]
      )[0] as Record<string, unknown>;
      expect(createdArg.brew_count).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('respects an explicit override list (e.g. tests, alternate demo data)', async () => {
      const repos = buildSeedRepos();
      repos.recipeRepo.findOne.mockResolvedValue(null);

      const customRecipes = BREWDOG_DIY_DOG_SEED.slice(0, 1);

      const result = await runSeed(repos, customRecipes);

      expect(result.recipesInserted).toBe(1);
      expect(result.total).toBe(1);
    });

    it('exposes deterministic UUIDs in the `-4001-` variant range so the mobile mocks can hardcode references', () => {
      const ids = BREWDOG_DIY_DOG_SEED.map((r) => r.id);
      for (const id of ids) {
        expect(id).toMatch(/^00000000-0000-4001-8000-[0-9a-f]{12}$/);
      }
      // No duplicates.
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('ships a non-empty grain bill / hop schedule / yeast strain on every recipe', () => {
      // Issue #780 acceptance criterion: every recipe carries the
      // full ingredient breakdown. A row missing any of the three
      // sub-tables would render the recipe unbrewable in the mobile
      // UI's `BrewingTab` ingredient grouping.
      for (const recipe of BREWDOG_DIY_DOG_SEED) {
        expect(recipe.fermentables.length).toBeGreaterThan(0);
        expect(recipe.hops.length).toBeGreaterThan(0);
        expect(recipe.yeasts.length).toBeGreaterThan(0);
      }
    });

    it('points every recipe back to its source URL on `brewdogrecipes.com` for traceable provenance', () => {
      // Each recipe must carry the verification source so future
      // audits can re-fetch the original page (analogous to the EAN
      // audits on the scan catalogue — issue #807 fix on PR #920).
      for (const recipe of BREWDOG_DIY_DOG_SEED) {
        expect(recipe.source_url).toMatch(/^https:\/\/brewdogrecipes\.com\//);
      }
    });
  });
});
