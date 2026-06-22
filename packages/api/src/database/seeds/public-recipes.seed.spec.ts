import { Repository } from 'typeorm';

import { RecipeFermentableType } from '../../recipe/domain/enums/recipe-fermentable-type.enum';
import { RecipeHopAdditionStage } from '../../recipe/domain/enums/recipe-hop-addition-stage.enum';
import { RecipeHopType } from '../../recipe/domain/enums/recipe-hop-type.enum';
import { RecipeOrmEntity } from '../../recipe/entities/recipe.orm.entity';
import { RecipeVisibility } from '../../recipe/domain/enums/recipe-visibility.enum';
import { RecipeWorkflowService } from '../../recipe/domain/services/recipe-workflow.service';
import { RecipeYeastType } from '../../recipe/domain/enums/recipe-yeast-type.enum';
import {
  DEFAULT_WORKFLOW_STEPS,
  PUBLIC_RECIPES_SEED,
  PUBLIC_RECIPES_SYSTEM_OWNER_ID,
  PublicRecipeSubResourceRepos,
  seedPublicRecipes,
} from './public-recipes.seed';
import { buildRepoMock, RepoMock } from './seed-test-utils';

/** UUIDs of the four scan-reachable recipes garnished with full
 * content: the Punk IPA "official" row plus its three IPA-family
 * equivalents (Session IPA, NEIPA, White IPA), which the mobile
 * `PUNK_IPA_RECIPE_MATCHES` list all expose for a Punk IPA scan. */
const SESSION_IPA_ID = '00000000-0000-4000-8000-000000000001';
const NEIPA_ID = '00000000-0000-4000-8000-000000000002';
const WHITE_IPA_ID = '00000000-0000-4000-8000-000000000003';
const PUNK_IPA_ID = '00000000-0000-4000-8000-00000000000b';
const GARNISHED_IDS = [SESSION_IPA_ID, NEIPA_ID, WHITE_IPA_ID, PUNK_IPA_ID];
/** The first-real-brew beginner Blonde Ale — content-bearing like the
 * garnished recipes, but NOT scan-reachable (it has no demo-bottle
 * mapping); it is the recipe the app guides the founder's first brew. */
const BLONDE_ID = '00000000-0000-4000-8000-00000000000c';
/** Every recipe that ships full content (ingredients + steps): the
 * four scan-reachable rows plus the first-real-brew blonde. */
const CONTENT_BEARING_IDS = [...GARNISHED_IDS, BLONDE_ID];
/** A recipe that intentionally stays metadata-only (Belgian Tripel). */
const METADATA_ONLY_ID = '00000000-0000-4000-8000-000000000004';

function buildSubRepos(): {
  fermentableRepo: RepoMock;
  hopRepo: RepoMock;
  yeastRepo: RepoMock;
  stepRepo: RepoMock;
} {
  return {
    fermentableRepo: buildRepoMock(),
    hopRepo: buildRepoMock(),
    yeastRepo: buildRepoMock(),
    stepRepo: buildRepoMock(),
  };
}

describe('seedPublicRecipes (Issue #701)', () => {
  describe('happy path', () => {
    it('inserts all 12 curated recipes when the table is empty', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      const result = await seedPublicRecipes(
        repo as unknown as Repository<RecipeOrmEntity>,
      );

      expect(result).toEqual({ inserted: 12, updated: 0, total: 12 });
      expect(repo.create).toHaveBeenCalledTimes(12);
      expect(repo.save).toHaveBeenCalledTimes(12);
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
      expect(nonOfficials).toHaveLength(12);
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

      expect(result).toEqual({ inserted: 0, updated: 12, total: 12 });
      expect(repo.create).not.toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalledTimes(12);
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
      // First three IDs exist, last nine do not.
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

      expect(result).toEqual({ inserted: 9, updated: 3, total: 12 });
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

    it('exposes 12 curated recipes covering IPA / Belgian / Strong / Lager families plus the official DIY Dog and the first-real-brew blonde', () => {
      expect(PUBLIC_RECIPES_SEED).toHaveLength(12);
      const names = PUBLIC_RECIPES_SEED.map((r) => r.name);
      expect(names).toContain('Session IPA Citra');
      expect(names).toContain('Belgian Tripel');
      expect(names).toContain('Saison Farmhouse');
      expect(names).toContain('Imperial Stout');
      expect(names).toContain('Kölsch Tradition');
      expect(names).toContain('BrewDog DIY Dog Punk IPA');
      expect(names).toContain('Blonde Facile (premier brassin)');
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

describe('public recipe content (ingredients + steps, #1134)', () => {
  describe('seed data integrity', () => {
    it('gives full content to exactly the four scan-reachable recipes plus the first-real-brew blonde', () => {
      const withContent = PUBLIC_RECIPES_SEED.filter((r) => r.fermentables);
      expect(withContent.map((r) => r.id).sort()).toEqual(
        [...CONTENT_BEARING_IDS].sort(),
      );
    });

    it('gives every content-bearing recipe fermentables, hops, yeasts and the 5-step workflow', () => {
      for (const id of CONTENT_BEARING_IDS) {
        const recipe = PUBLIC_RECIPES_SEED.find((r) => r.id === id);
        expect(recipe).toBeDefined();
        expect(recipe?.fermentables?.length).toBeGreaterThan(0);
        expect(recipe?.hops?.length).toBeGreaterThan(0);
        expect(recipe?.yeasts?.length).toBeGreaterThan(0);
        // Every content-bearing recipe references the shared default workflow.
        expect(recipe?.steps).toBe(DEFAULT_WORKFLOW_STEPS);
        expect(recipe?.steps).toHaveLength(5);
      }
    });

    it('leaves the metadata-only recipes (e.g. Belgian Tripel) without content arrays', () => {
      const tripel = PUBLIC_RECIPES_SEED.find((r) => r.id === METADATA_ONLY_ID);
      expect(tripel?.fermentables).toBeUndefined();
      expect(tripel?.hops).toBeUndefined();
      expect(tripel?.yeasts).toBeUndefined();
      expect(tripel?.steps).toBeUndefined();
    });

    it('uses valid enum values and positive quantities across all content', () => {
      for (const recipe of PUBLIC_RECIPES_SEED) {
        for (const fermentable of recipe.fermentables ?? []) {
          expect(Object.values(RecipeFermentableType)).toContain(
            fermentable.type,
          );
          expect(fermentable.weight_g).toBeGreaterThan(0);
        }
        for (const hop of recipe.hops ?? []) {
          expect(Object.values(RecipeHopType)).toContain(hop.type);
          expect(Object.values(RecipeHopAdditionStage)).toContain(
            hop.addition_stage,
          );
          expect(hop.weight_g).toBeGreaterThan(0);
        }
        for (const yeast of recipe.yeasts ?? []) {
          expect(Object.values(RecipeYeastType)).toContain(yeast.type);
          expect(yeast.amount_g).toBeGreaterThan(0);
        }
      }
    });

    it('keeps DEFAULT_WORKFLOW_STEPS structurally identical to RecipeWorkflowService.getDefaultWorkflow()', () => {
      // Non-owner viewers of a public recipe never trigger the lazy
      // `ensureDefaultSteps` write (Issue #779) — so the seeded steps
      // must match the workflow an owner would get materialised, or
      // the two code paths would drift.
      const workflow = new RecipeWorkflowService().getDefaultWorkflow();
      expect(DEFAULT_WORKFLOW_STEPS).toHaveLength(workflow.length);
      workflow.forEach((step, index) => {
        expect(DEFAULT_WORKFLOW_STEPS[index].step_order).toBe(step.order);
        expect(DEFAULT_WORKFLOW_STEPS[index].type).toBe(step.type);
        expect(DEFAULT_WORKFLOW_STEPS[index].label).toBe(step.label);
        expect(DEFAULT_WORKFLOW_STEPS[index].description).toBe(
          step.description,
        );
      });
    });
  });

  describe('sub-resource seeding (happy path)', () => {
    it('wipes and refills every sub-table for a garnished recipe with recipe_id stamped', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);
      const sub = buildSubRepos();
      const punk = PUBLIC_RECIPES_SEED.find((r) => r.id === PUNK_IPA_ID);
      expect(punk).toBeDefined();

      await seedPublicRecipes(
        repo as unknown as Repository<RecipeOrmEntity>,
        [punk!],
        sub as unknown as PublicRecipeSubResourceRepos,
      );

      expect(sub.fermentableRepo.delete).toHaveBeenCalledWith({
        recipe_id: PUNK_IPA_ID,
      });
      expect(sub.hopRepo.delete).toHaveBeenCalledWith({
        recipe_id: PUNK_IPA_ID,
      });
      expect(sub.yeastRepo.delete).toHaveBeenCalledWith({
        recipe_id: PUNK_IPA_ID,
      });
      expect(sub.stepRepo.delete).toHaveBeenCalledWith({
        recipe_id: PUNK_IPA_ID,
      });

      expect(sub.fermentableRepo.create).toHaveBeenCalledTimes(
        punk!.fermentables!.length,
      );
      expect(sub.hopRepo.create).toHaveBeenCalledTimes(punk!.hops!.length);
      expect(sub.yeastRepo.create).toHaveBeenCalledTimes(punk!.yeasts!.length);
      expect(sub.stepRepo.create).toHaveBeenCalledTimes(5);

      const firstHop = (sub.hopRepo.create.mock.calls[0] as unknown[])[0] as {
        recipe_id: string;
      };
      expect(firstHop.recipe_id).toBe(PUNK_IPA_ID);
    });
  });

  describe('sub-resource seeding (sad / edge)', () => {
    it('leaves every sub-table untouched (no delete, no create) for a metadata-only recipe even when subRepos is supplied', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);
      const sub = buildSubRepos();
      const tripel = PUBLIC_RECIPES_SEED.find((r) => r.id === METADATA_ONLY_ID);

      await seedPublicRecipes(
        repo as unknown as Repository<RecipeOrmEntity>,
        [tripel!],
        sub as unknown as PublicRecipeSubResourceRepos,
      );

      // Assert neither delete nor create fires on ANY of the four
      // repos — a metadata-only recipe must not touch its content
      // sub-tables, so a regression that started wiping hops/yeasts/
      // steps for such rows would be caught here.
      for (const childRepo of [
        sub.fermentableRepo,
        sub.hopRepo,
        sub.yeastRepo,
        sub.stepRepo,
      ]) {
        expect(childRepo.delete).not.toHaveBeenCalled();
        expect(childRepo.create).not.toHaveBeenCalled();
      }
    });

    it('returns the same {inserted,updated,total} shape whether or not subRepos is passed', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);
      const sub = buildSubRepos();
      const total = PUBLIC_RECIPES_SEED.length;

      const result = await seedPublicRecipes(
        repo as unknown as Repository<RecipeOrmEntity>,
        PUBLIC_RECIPES_SEED,
        sub as unknown as PublicRecipeSubResourceRepos,
      );

      expect(result).toEqual({ inserted: total, updated: 0, total });
    });
  });
});

describe('first-real-brew blonde (A1)', () => {
  const blonde = PUBLIC_RECIPES_SEED.find((r) => r.id === BLONDE_ID);

  it('happy: ships the beginner Blonde Ale scaled to the 5 L demijohn', () => {
    expect(blonde).toBeDefined();
    expect(blonde?.name).toBe('Blonde Facile (premier brassin)');
    expect(blonde?.style).toBe('Blonde Ale');
    // batch_size_l is the ~4.3 L INTO the fermenter — the volume the
    // ~18 IBU Tinseth target is computed against (ADR-0020 / the doc).
    expect(blonde?.batch_size_l).toBe(4.3);
    expect(blonde?.og_target).toBe(1.044);
    expect(blonde?.ibu_target).toBe(18);
    expect(blonde?.abv_estimated).toBe(4.5);
  });

  it('happy: carries the ~1 kg BIAB grain bill, single-Cascade hops and US-05', () => {
    const grainG = (blonde?.fermentables ?? []).reduce(
      (sum, f) => sum + f.weight_g,
      0,
    );
    expect(grainG).toBe(1000);
    // Single hop variety across both additions.
    const varieties = new Set((blonde?.hops ?? []).map((h) => h.variety));
    expect([...varieties]).toEqual(['Cascade']);
    // 5 g bittering @ 60 min, 4 g flameout whirlpool — the ~18 IBU charge.
    const bittering = blonde?.hops?.find(
      (h) => h.addition_stage === RecipeHopAdditionStage.BOIL,
    );
    expect(bittering?.weight_g).toBe(5);
    expect(bittering?.addition_time_min).toBe(60);
    const flameout = blonde?.hops?.find(
      (h) => h.addition_stage === RecipeHopAdditionStage.WHIRLPOOL,
    );
    expect(flameout?.weight_g).toBe(4);
    const yeast = blonde?.yeasts?.[0];
    expect(yeast?.name).toBe('Fermentis SafAle US-05');
    expect(yeast?.type).toBe(RecipeYeastType.ALE);
  });

  it('sad: is never tagged official (no global-flag matching boost)', () => {
    // Like every backend seed row, the blonde must stay non-official —
    // is_official is a GLOBAL matching shortcut and tagging it would
    // distort rankForBeer for unrelated beers.
    expect(blonde?.is_official ?? false).toBe(false);
  });

  it('edge: is content-bearing yet NOT scan-reachable (no demo-bottle mapping)', () => {
    expect(blonde?.fermentables?.length).toBeGreaterThan(0);
    expect(GARNISHED_IDS).not.toContain(BLONDE_ID);
    expect(CONTENT_BEARING_IDS).toContain(BLONDE_ID);
  });

  it('edge: is the smallest batch in the catalogue (4.3 L vs the 20 L demo recipes)', () => {
    expect(blonde).toBeDefined();
    const blondeBatch = blonde?.batch_size_l ?? 0;
    const others = PUBLIC_RECIPES_SEED.filter((r) => r.id !== BLONDE_ID);
    for (const recipe of others) {
      expect(recipe.batch_size_l).toBeGreaterThan(blondeBatch);
    }
  });
});
