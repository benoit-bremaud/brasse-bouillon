import { Repository } from 'typeorm';

import { RecipeFermentableOrmEntity } from '../../recipe/entities/recipe-fermentable.orm.entity';
import { RecipeFermentableType } from '../../recipe/domain/enums/recipe-fermentable-type.enum';
import { RecipeHopAdditionStage } from '../../recipe/domain/enums/recipe-hop-addition-stage.enum';
import { RecipeHopOrmEntity } from '../../recipe/entities/recipe-hop.orm.entity';
import { RecipeHopType } from '../../recipe/domain/enums/recipe-hop-type.enum';
import { RecipeOrmEntity } from '../../recipe/entities/recipe.orm.entity';
import { RecipeVisibility } from '../../recipe/domain/enums/recipe-visibility.enum';
import { RecipeYeastOrmEntity } from '../../recipe/entities/recipe-yeast.orm.entity';
import { RecipeYeastType } from '../../recipe/domain/enums/recipe-yeast-type.enum';
import { SYSTEM_USER_ID } from './system-user.seed';

/**
 * Seed loader for the curated BrewDog DIY Dog public recipes
 * (Issue #780). Imports a hand-picked subset of the BrewDog DIY Dog
 * open-source recipe book into the PUBLIC catalogue, with full
 * grain bill / hop schedule / yeast strain data — unlike the
 * `public-recipes.seed.ts` rows which carry only the brewing-metric
 * metadata.
 *
 * UUID range `00000000-0000-4001-8000-XXXXXXXXXXXX` is reserved for
 * this seed (`-4001-` variant prefix) so the existing 11 PUBLIC seed
 * rows under `-4000-` keep their identity. The post-2010 "BrewDog
 * DIY Dog Punk IPA" already living in `public-recipes.seed.ts` at
 * `-4000-...0b` (the scan-flow's "🏆 Recette officielle" row, Issue
 * #911) coexists with the historical "BrewDog DIY Dog Punk IPA
 * (2007-2010)" shipped here at `-4001-...01`. Each version is a
 * coherent reference for a different audience: the post-2010 one is
 * what BrewDog brews today, the 2007-2010 one is the original DIY
 * Dog book entry — useful for users who want to clone the recipe
 * exactly as published.
 */

/**
 * Sentinel UUID used as `owner_id` for every BrewDog DIY Dog recipe
 * seeded by this loader. Re-exported from `system-user.seed` for a
 * single source of truth on the system-curator UUID.
 */
export const BREWDOG_DIY_DOG_SYSTEM_OWNER_ID = SYSTEM_USER_ID;

/**
 * Provenance string written to `Recipe.import_provenance` for every
 * row seeded by this loader. Surfaces in the mobile UI's "Importée
 * depuis…" badge so users can trace the recipe back to its source.
 */
export const BREWDOG_DIY_DOG_PROVENANCE =
  'BrewDog DIY Dog (open-source homebrew recipe book, attribution preserved)';

/**
 * Shape of a fermentable entry in the seed data. Mirrors
 * `RecipeFermentableOrmEntity`'s mutable columns minus the autogen
 * id, recipe_id, and timestamps.
 */
export interface BrewdogDiyDogFermentableSeed {
  name: string;
  type: RecipeFermentableType;
  weight_g: number;
  potential_gravity?: number;
  color_ebc?: number;
}

/**
 * Shape of a hop addition in the seed data. Mirrors
 * `RecipeHopOrmEntity`'s mutable columns. `addition_time_min` is
 * minutes-from-knockout for boil additions, days-of-contact for
 * dry-hop additions, and may be null for whirlpool additions whose
 * timing is not specified by the source recipe.
 */
export interface BrewdogDiyDogHopSeed {
  variety: string;
  type: RecipeHopType;
  weight_g: number;
  alpha_acid_percent?: number;
  addition_stage: RecipeHopAdditionStage;
  addition_time_min?: number;
}

/**
 * Shape of a yeast addition in the seed data. Mirrors
 * `RecipeYeastOrmEntity`'s mutable columns. `amount_g` defaults to
 * 11.5g (~1 dry-yeast sachet) when the source recipe does not
 * specify a pitch rate.
 */
export interface BrewdogDiyDogYeastSeed {
  name: string;
  type: RecipeYeastType;
  amount_g: number;
  attenuation_percent?: number;
  temperature_min_c?: number;
  temperature_max_c?: number;
}

/**
 * Shape of one BrewDog DIY Dog recipe entry. Combines the brewing
 * metrics (Recipe row) with the full ingredient breakdown
 * (recipe_fermentables / recipe_hops / recipe_yeasts sub-rows).
 */
export interface BrewdogDiyDogRecipeSeed {
  id: string;
  name: string;
  description: string;
  style: string;
  batch_size_l: number;
  boil_time_min: number;
  og_target: number;
  fg_target: number;
  abv_estimated: number;
  ibu_target: number;
  ebc_target: number;
  efficiency_target: number;
  /**
   * Average community rating for the published recipe. Optional —
   * undefined leaves the column unset (defaults to NULL in SQLite),
   * matching the `public-recipes.seed.ts` convention.
   */
  avg_rating?: number;
  /**
   * Number of times the recipe has been brewed by the community
   * (synthetic value derived from BrewDog's Wisdom of the Crowd
   * exposure). Same optionality contract as `avg_rating`.
   */
  brew_count?: number;
  source_url: string;
  fermentables: readonly BrewdogDiyDogFermentableSeed[];
  hops: readonly BrewdogDiyDogHopSeed[];
  yeasts: readonly BrewdogDiyDogYeastSeed[];
}

/**
 * BrewDog DIY Dog recipes shipped by this seed. UUIDs are
 * deterministic (`-4001-` variant) so the mobile demo data and the
 * matching service can hardcode references without a database
 * round-trip.
 *
 * Issue #780 targets ~25 recipes; recipes are added 1-N at a time as
 * each source page on `brewdogrecipes.com` is verified. The loader
 * is designed to handle any subset, so each top-up PR only adds
 * data without touching the loader machinery.
 */
export const BREWDOG_DIY_DOG_SEED: readonly BrewdogDiyDogRecipeSeed[] = [
  {
    // Historical Punk IPA recipe as published in the original DIY Dog
    // book (2007-2010 version). Source verified on
    // `brewdogrecipes.com` 2026-05-05. Coexists with the post-2010
    // canonical "BrewDog DIY Dog Punk IPA" already shipped at
    // `00000000-0000-4000-8000-00000000000b` by `public-recipes.seed`
    // (Issue #911 — the "🏆 Recette officielle" scan-flow row).
    id: '00000000-0000-4001-8000-000000000001',
    name: 'BrewDog DIY Dog Punk IPA (2007-2010)',
    description:
      "Recette historique de Punk IPA telle que publiée dans le DIY Dog original (millésimes 2007-2010). Mono-malt Extra Pale, ossature houblon Ahtanum / Chinook / Crystal renforcée par Motueka en fin d'ébullition. Profil pamplemousse, ananas et lychee, finale amère et sèche. Pas de dry-hop — l'aromatique tient sur l'ajout massif au flameout.",
    style: 'American IPA',
    batch_size_l: 20,
    boil_time_min: 60,
    og_target: 1.056,
    fg_target: 1.01,
    abv_estimated: 6,
    ibu_target: 60,
    ebc_target: 17,
    efficiency_target: 75,
    avg_rating: 4.8,
    brew_count: 248,
    source_url: 'https://brewdogrecipes.com/recipes/punk-ipa-2007-2010',
    fermentables: [
      {
        name: 'Extra Pale Malt',
        type: RecipeFermentableType.GRAIN,
        weight_g: 5300,
        color_ebc: 4,
      },
    ],
    hops: [
      {
        variety: 'Ahtanum',
        type: RecipeHopType.PELLET,
        weight_g: 17.5,
        alpha_acid_percent: 5,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 60,
      },
      {
        variety: 'Chinook',
        type: RecipeHopType.PELLET,
        weight_g: 15,
        alpha_acid_percent: 13,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 60,
      },
      {
        variety: 'Crystal',
        type: RecipeHopType.PELLET,
        weight_g: 17.5,
        alpha_acid_percent: 4.5,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 15,
      },
      {
        variety: 'Chinook',
        type: RecipeHopType.PELLET,
        weight_g: 17.5,
        alpha_acid_percent: 13,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 15,
      },
      {
        variety: 'Ahtanum',
        type: RecipeHopType.PELLET,
        weight_g: 17.5,
        alpha_acid_percent: 5,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 5,
      },
      {
        variety: 'Chinook',
        type: RecipeHopType.PELLET,
        weight_g: 27.5,
        alpha_acid_percent: 13,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 5,
      },
      {
        variety: 'Crystal',
        type: RecipeHopType.PELLET,
        weight_g: 17.5,
        alpha_acid_percent: 4.5,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 5,
      },
      {
        variety: 'Motueka',
        type: RecipeHopType.PELLET,
        weight_g: 17.5,
        alpha_acid_percent: 7,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 5,
      },
    ],
    yeasts: [
      {
        name: 'Wyeast 1056 American Ale',
        type: RecipeYeastType.ALE,
        amount_g: 11.5,
        attenuation_percent: 75,
        temperature_min_c: 16,
        temperature_max_c: 22,
      },
    ],
  },
];

/**
 * Result returned by `seedBrewdogDiyDogRecipes` for instrumentation.
 * Reports per-table counts so the runner / tests can verify the
 * sub-tables stayed in sync with the recipe rows.
 */
export interface SeedBrewdogDiyDogResult {
  recipesInserted: number;
  recipesUpdated: number;
  fermentablesInserted: number;
  hopsInserted: number;
  yeastsInserted: number;
  total: number;
}

/**
 * Idempotent loader for the BrewDog DIY Dog recipes above. For each
 * seed entry:
 *
 * 1. Upsert the Recipe row (insert if id unknown, update in place
 *    otherwise). Visibility is forced to PUBLIC, owner to the
 *    system sentinel, `import_provenance` to the canonical BrewDog
 *    DIY Dog attribution string, `imported_from_recipe_id` to null
 *    (these are originals, not user imports).
 * 2. Wipe the existing fermentables / hops / yeasts rows for that
 *    `recipe_id`, then bulk-insert the seed's ingredient lists. The
 *    "wipe and refill" pattern keeps idempotency simple — re-running
 *    the seed converges on the same final state regardless of
 *    drift between runs (renamed hops, deleted fermentables, etc.).
 *
 * `is_official` is deliberately left as `false` on every row — same
 * rationale as `public-recipes.seed.ts`: a global `is_official=true`
 * flag would 100-pt-boost every BrewDog recipe in the matching
 * service's `rankForBeer`, surfacing them as "official" for unrelated
 * scanned beers (Codex P1 lesson on PR #773 / #912). Per-beer
 * official linking is reserved for the mobile-side
 * `demoEquivalentRecipes` mock.
 */
export async function seedBrewdogDiyDogRecipes(
  recipeRepo: Repository<RecipeOrmEntity>,
  fermentableRepo: Repository<RecipeFermentableOrmEntity>,
  hopRepo: Repository<RecipeHopOrmEntity>,
  yeastRepo: Repository<RecipeYeastOrmEntity>,
  recipes: readonly BrewdogDiyDogRecipeSeed[] = BREWDOG_DIY_DOG_SEED,
): Promise<SeedBrewdogDiyDogResult> {
  let recipesInserted = 0;
  let recipesUpdated = 0;
  let fermentablesInserted = 0;
  let hopsInserted = 0;
  let yeastsInserted = 0;

  for (const recipe of recipes) {
    const recipePayload = {
      owner_id: BREWDOG_DIY_DOG_SYSTEM_OWNER_ID,
      name: recipe.name,
      description: recipe.description,
      style: recipe.style,
      visibility: RecipeVisibility.PUBLIC,
      version: 1,
      root_recipe_id: recipe.id,
      parent_recipe_id: null,
      batch_size_l: recipe.batch_size_l,
      boil_time_min: recipe.boil_time_min,
      og_target: recipe.og_target,
      fg_target: recipe.fg_target,
      abv_estimated: recipe.abv_estimated,
      ibu_target: recipe.ibu_target,
      ebc_target: recipe.ebc_target,
      efficiency_target: recipe.efficiency_target,
      avg_rating: recipe.avg_rating,
      brew_count: recipe.brew_count,
      last_brewed_at: null,
      is_official: false,
      imported_from_recipe_id: null,
      import_provenance: BREWDOG_DIY_DOG_PROVENANCE,
    };

    const existing = await recipeRepo.findOne({ where: { id: recipe.id } });
    if (existing) {
      Object.assign(existing, recipePayload);
      await recipeRepo.save(existing);
      recipesUpdated += 1;
    } else {
      const created = recipeRepo.create({ id: recipe.id, ...recipePayload });
      await recipeRepo.save(created);
      recipesInserted += 1;
    }

    // Wipe-and-refill the sub-tables. Cheaper than computing per-row
    // diffs and keeps the seed deterministic — the post-condition is
    // "this recipe's ingredients are exactly what the seed declares".
    await fermentableRepo.delete({ recipe_id: recipe.id });
    for (const fermentable of recipe.fermentables) {
      await fermentableRepo.save(
        fermentableRepo.create({ recipe_id: recipe.id, ...fermentable }),
      );
      fermentablesInserted += 1;
    }

    await hopRepo.delete({ recipe_id: recipe.id });
    for (const hop of recipe.hops) {
      await hopRepo.save(hopRepo.create({ recipe_id: recipe.id, ...hop }));
      hopsInserted += 1;
    }

    await yeastRepo.delete({ recipe_id: recipe.id });
    for (const yeast of recipe.yeasts) {
      await yeastRepo.save(
        yeastRepo.create({ recipe_id: recipe.id, ...yeast }),
      );
      yeastsInserted += 1;
    }
  }

  return {
    recipesInserted,
    recipesUpdated,
    fermentablesInserted,
    hopsInserted,
    yeastsInserted,
    total: recipesInserted + recipesUpdated,
  };
}
