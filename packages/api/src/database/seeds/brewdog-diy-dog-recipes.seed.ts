import { Repository } from 'typeorm';

import { idempotentUpsertById } from './seed-utils';
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
 * Base attribution label written to `Recipe.import_provenance` for
 * every row seeded by this loader. The per-recipe `source_url` is
 * appended at seed time by `buildBrewdogDiyDogProvenance` so the
 * audit trail is traceable directly from the database (see Copilot
 * review on PR #921 — without this, `source_url` would only live on
 * the seed file and not survive into the persisted row).
 */
export const BREWDOG_DIY_DOG_BASE_PROVENANCE =
  'BrewDog DIY Dog (open-source homebrew recipe book, attribution preserved)';

/**
 * Builds the canonical `import_provenance` value for one DIY Dog
 * recipe by appending the per-recipe source URL to the base
 * attribution. Surfaces in the mobile UI's "Importée depuis…" badge.
 */
export function buildBrewdogDiyDogProvenance(sourceUrl: string): string {
  return `${BREWDOG_DIY_DOG_BASE_PROVENANCE} — source: ${sourceUrl}`;
}

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
  {
    // Hop Rocker — International Pale Lager. April 2007 BrewDog DIY
    // Dog entry. Lager fermented at 10°C with Saflager S189; only
    // lager so far in the seed (style coverage diversification —
    // Issue #780).
    id: '00000000-0000-4001-8000-000000000002',
    name: 'BrewDog DIY Dog Hop Rocker',
    description:
      "Lager américaine houblonnée — la signature houblon BrewDog adaptée à une fermentation lager froide (Saflager S189 à 10 °C). Base Maris Otter Extra Pale + 5% Caramalt + 5% Munich pour la rondeur. Cascade et Saaz à l'amertume, finale Cascade / Motueka / Chinook au flameout pour le nez agrumes-pin.",
    style: 'International Pale Lager',
    batch_size_l: 20,
    boil_time_min: 75,
    og_target: 1.052,
    fg_target: 1.01,
    abv_estimated: 5.5,
    ibu_target: 40,
    ebc_target: 25,
    efficiency_target: 75,
    avg_rating: 4.4,
    brew_count: 95,
    source_url: 'https://brewdogrecipes.com/recipes/hop-rocker',
    fermentables: [
      {
        name: 'Extra Pale Maris Otter',
        type: RecipeFermentableType.GRAIN,
        weight_g: 3780,
        color_ebc: 3,
      },
      {
        name: 'Caramalt',
        type: RecipeFermentableType.GRAIN,
        weight_g: 310,
        color_ebc: 50,
      },
      {
        name: 'Munich',
        type: RecipeFermentableType.GRAIN,
        weight_g: 310,
        color_ebc: 18,
      },
    ],
    hops: [
      {
        variety: 'Cascade',
        type: RecipeHopType.PELLET,
        weight_g: 12.5,
        alpha_acid_percent: 5.5,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 75,
      },
      {
        variety: 'Saaz',
        type: RecipeHopType.PELLET,
        weight_g: 12.5,
        alpha_acid_percent: 3.5,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 75,
      },
      {
        variety: 'Cascade',
        type: RecipeHopType.PELLET,
        weight_g: 25,
        alpha_acid_percent: 5.5,
        addition_stage: RecipeHopAdditionStage.WHIRLPOOL,
        addition_time_min: 0,
      },
      {
        variety: 'Motueka',
        type: RecipeHopType.PELLET,
        weight_g: 12.5,
        alpha_acid_percent: 7,
        addition_stage: RecipeHopAdditionStage.WHIRLPOOL,
        addition_time_min: 0,
      },
      {
        variety: 'Chinook',
        type: RecipeHopType.PELLET,
        weight_g: 25,
        alpha_acid_percent: 13,
        addition_stage: RecipeHopAdditionStage.WHIRLPOOL,
        addition_time_min: 0,
      },
    ],
    yeasts: [
      {
        name: 'Saflager S189',
        type: RecipeYeastType.LAGER,
        amount_g: 11.5,
        attenuation_percent: 81,
        temperature_min_c: 9,
        temperature_max_c: 14,
      },
    ],
  },
  {
    // Trashy Blonde — Pale Ale. April 2008 BrewDog DIY Dog entry.
    // Sessionnable houblonnée Amarillo / Simcoe / Motueka.
    id: '00000000-0000-4001-8000-000000000003',
    name: 'BrewDog DIY Dog Trashy Blonde',
    description:
      "Pale Ale légère et houblonnée, conçue pour rester sessionnable malgré l'avalanche aromatique. Base Maris Otter Extra Pale + 5% Caramalt + 10% Munich. Amarillo et Simcoe à l'amertume, gros flameout Amarillo / Motueka pour les notes agrumes et pêche.",
    style: 'American Pale Ale',
    batch_size_l: 20,
    boil_time_min: 75,
    og_target: 1.042,
    fg_target: 1.01,
    abv_estimated: 4.1,
    ibu_target: 41.5,
    ebc_target: 15,
    efficiency_target: 75,
    avg_rating: 4.6,
    brew_count: 142,
    source_url: 'https://brewdogrecipes.com/recipes/trashy-blonde',
    fermentables: [
      {
        name: 'Extra Pale Maris Otter',
        type: RecipeFermentableType.GRAIN,
        weight_g: 3250,
        color_ebc: 3,
      },
      {
        name: 'Caramalt',
        type: RecipeFermentableType.GRAIN,
        weight_g: 200,
        color_ebc: 50,
      },
      {
        name: 'Munich',
        type: RecipeFermentableType.GRAIN,
        weight_g: 400,
        color_ebc: 18,
      },
    ],
    hops: [
      {
        variety: 'Amarillo',
        type: RecipeHopType.PELLET,
        weight_g: 13.8,
        alpha_acid_percent: 9,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 75,
      },
      {
        variety: 'Simcoe',
        type: RecipeHopType.PELLET,
        weight_g: 13.8,
        alpha_acid_percent: 13,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 75,
      },
      {
        variety: 'Amarillo',
        type: RecipeHopType.PELLET,
        weight_g: 26.3,
        alpha_acid_percent: 9,
        addition_stage: RecipeHopAdditionStage.WHIRLPOOL,
        addition_time_min: 0,
      },
      {
        variety: 'Motueka',
        type: RecipeHopType.PELLET,
        weight_g: 18.8,
        alpha_acid_percent: 7,
        addition_stage: RecipeHopAdditionStage.WHIRLPOOL,
        addition_time_min: 0,
      },
    ],
    yeasts: [
      {
        name: 'Wyeast 1056 American Ale',
        type: RecipeYeastType.ALE,
        amount_g: 11.5,
        attenuation_percent: 76,
        temperature_min_c: 16,
        temperature_max_c: 22,
      },
    ],
  },
  {
    // Storm — Islay Whisky-aged IPA. December 2007 BrewDog DIY Dog
    // entry. Variation oak chips trempés au whisky d'Islay (50g) en
    // fermentation secondaire — non modélisée dans les sous-tables
    // (additif/aging hors scope de l'entité Recipe), mais documentée
    // dans la description.
    id: '00000000-0000-4001-8000-000000000004',
    name: 'BrewDog DIY Dog Storm',
    description:
      "IPA forte (8% ABV) finie en barrique virtuelle : 50g de chips de chêne trempés au whisky d'Islay sont ajoutés en fermentation secondaire pour les notes tourbées et iodées. Squelette houblon proche de Punk IPA (Ahtanum / Chinook / Crystal / Motueka) sur 5,8 kg d'Extra Pale.",
    style: 'American IPA',
    batch_size_l: 20,
    boil_time_min: 60,
    og_target: 1.082,
    fg_target: 1.01,
    abv_estimated: 8,
    ibu_target: 60,
    ebc_target: 12,
    efficiency_target: 75,
    avg_rating: 4.5,
    brew_count: 67,
    source_url: 'https://brewdogrecipes.com/recipes/storm',
    fermentables: [
      {
        name: 'Extra Pale Malt',
        type: RecipeFermentableType.GRAIN,
        weight_g: 5800,
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
        addition_time_min: 30,
      },
      {
        variety: 'Chinook',
        type: RecipeHopType.PELLET,
        weight_g: 17.5,
        alpha_acid_percent: 13,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 30,
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
        attenuation_percent: 88,
        temperature_min_c: 18,
        temperature_max_c: 22,
      },
    ],
  },
  {
    // Edge — Cask Ale (English Brown / Mild). November 2007 BrewDog
    // DIY Dog entry. Faible ABV (2.7%), céréales rôties pour la
    // robe brun foncé. Couvre le style brune sessionnable du
    // catalogue.
    id: '00000000-0000-4001-8000-000000000005',
    name: 'BrewDog DIY Dog Edge',
    description:
      "Cask ale brune sessionnable (2,7% ABV) à la robe foncée. Maris Otter en base soutenu par 18% de blé, 9% de Crystal, 5,5% de Roasted Barley et 3,8% de Cara Aroma pour les notes torréfiées et caramel. Amertume mesurée Pacific Hallertau / Motueka / Amarillo — un clin d'œil moderne à la mild anglaise traditionnelle.",
    style: 'English Brown Ale',
    batch_size_l: 20,
    boil_time_min: 60,
    og_target: 1.033,
    fg_target: 1.01,
    abv_estimated: 2.7,
    ibu_target: 36,
    ebc_target: 57,
    efficiency_target: 75,
    avg_rating: 4.2,
    brew_count: 38,
    source_url: 'https://brewdogrecipes.com/recipes/edge',
    fermentables: [
      {
        name: 'Extra Pale Malt',
        type: RecipeFermentableType.GRAIN,
        weight_g: 2160,
        color_ebc: 4,
      },
      {
        name: 'Wheat Malt',
        type: RecipeFermentableType.GRAIN,
        weight_g: 630,
        color_ebc: 4,
      },
      {
        name: 'Crystal',
        type: RecipeFermentableType.GRAIN,
        weight_g: 310,
        color_ebc: 100,
      },
      {
        name: 'Roasted Barley',
        type: RecipeFermentableType.GRAIN,
        weight_g: 190,
        color_ebc: 1100,
      },
      {
        name: 'Cara Aroma',
        type: RecipeFermentableType.GRAIN,
        weight_g: 130,
        color_ebc: 350,
      },
    ],
    hops: [
      {
        variety: 'Pacific Hallertau',
        type: RecipeHopType.PELLET,
        weight_g: 15.5,
        alpha_acid_percent: 6,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 60,
      },
      {
        variety: 'Pacific Hallertau',
        type: RecipeHopType.PELLET,
        weight_g: 10.2,
        alpha_acid_percent: 6,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 60,
      },
      {
        variety: 'Motueka',
        type: RecipeHopType.PELLET,
        weight_g: 6.1,
        alpha_acid_percent: 7,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 15,
      },
      {
        variety: 'Pacific Hallertau',
        type: RecipeHopType.PELLET,
        weight_g: 12.5,
        alpha_acid_percent: 6,
        addition_stage: RecipeHopAdditionStage.WHIRLPOOL,
        addition_time_min: 0,
      },
      {
        variety: 'Motueka',
        type: RecipeHopType.PELLET,
        weight_g: 25,
        alpha_acid_percent: 7,
        addition_stage: RecipeHopAdditionStage.WHIRLPOOL,
        addition_time_min: 0,
      },
      {
        variety: 'Amarillo',
        type: RecipeHopType.PELLET,
        weight_g: 12.5,
        alpha_acid_percent: 9,
        addition_stage: RecipeHopAdditionStage.WHIRLPOOL,
        addition_time_min: 0,
      },
    ],
    yeasts: [
      {
        name: 'Wyeast 1056 American Ale',
        type: RecipeYeastType.ALE,
        amount_g: 11.5,
        attenuation_percent: 70,
        temperature_min_c: 18,
        temperature_max_c: 22,
      },
    ],
  },
  {
    // The Physics — American Amber Ale. April 2007 BrewDog DIY Dog
    // entry. Mono-houblon Amarillo + Bramling Cross en touche
    // anglaise. Couvre le style amber/red du catalogue.
    id: '00000000-0000-4001-8000-000000000006',
    name: 'BrewDog DIY Dog The Physics',
    description:
      'Amber Ale équilibrée — base Extra Pale soutenue par 17% de Dark Crystal 350 et 4% de Crystal 120 pour les notes caramel et fruits secs. Houblonnage mono-Amarillo en amertume et flavour, finition Bramling Cross pour la touche anglaise (cassis, prune). Robe cuivrée profonde (EBC 65).',
    style: 'American Amber Ale',
    batch_size_l: 20,
    boil_time_min: 75,
    og_target: 1.048,
    fg_target: 1.01,
    abv_estimated: 5,
    ibu_target: 47,
    ebc_target: 65,
    efficiency_target: 75,
    avg_rating: 4.5,
    brew_count: 124,
    source_url: 'https://brewdogrecipes.com/recipes/the-physics',
    fermentables: [
      {
        name: 'Extra Pale Malt',
        type: RecipeFermentableType.GRAIN,
        weight_g: 4060,
        color_ebc: 4,
      },
      {
        name: 'Dark Crystal 350',
        type: RecipeFermentableType.GRAIN,
        weight_g: 940,
        color_ebc: 350,
      },
      {
        name: 'Caramalt',
        type: RecipeFermentableType.GRAIN,
        weight_g: 300,
        color_ebc: 50,
      },
      {
        name: 'Crystal 120',
        type: RecipeFermentableType.GRAIN,
        weight_g: 230,
        color_ebc: 240,
      },
    ],
    hops: [
      {
        variety: 'Amarillo',
        type: RecipeHopType.PELLET,
        weight_g: 25,
        alpha_acid_percent: 9,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 75,
      },
      {
        variety: 'Amarillo',
        type: RecipeHopType.PELLET,
        weight_g: 12.5,
        alpha_acid_percent: 9,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 38,
      },
      {
        variety: 'Bramling Cross',
        type: RecipeHopType.PELLET,
        weight_g: 12.5,
        alpha_acid_percent: 6,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 15,
      },
      {
        variety: 'Amarillo',
        type: RecipeHopType.PELLET,
        weight_g: 50,
        alpha_acid_percent: 9,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 15,
      },
    ],
    yeasts: [
      {
        name: 'Wyeast 1056 American Ale',
        type: RecipeYeastType.ALE,
        amount_g: 11.5,
        attenuation_percent: 79,
        temperature_min_c: 18,
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
      // RecipeOrmEntity.brew_count is non-nullable with default 0 —
      // coalesce here so an omitted seed value lands as 0 rather
      // than NULL (caught on PR #921 review).
      brew_count: recipe.brew_count ?? 0,
      last_brewed_at: null,
      is_official: false,
      imported_from_recipe_id: null,
      import_provenance: buildBrewdogDiyDogProvenance(recipe.source_url),
    };

    const outcome = await idempotentUpsertById(
      recipeRepo,
      { id: recipe.id },
      recipePayload,
    );
    recipesInserted += outcome.inserted;
    recipesUpdated += outcome.updated;

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
