import { DataSource, Repository } from 'typeorm';

import { RecipeFermentableOrmEntity } from '../../recipe/entities/recipe-fermentable.orm.entity';
import { RecipeFermentableType } from '../../recipe/domain/enums/recipe-fermentable-type.enum';
import { RecipeHopAdditionStage } from '../../recipe/domain/enums/recipe-hop-addition-stage.enum';
import { RecipeHopOrmEntity } from '../../recipe/entities/recipe-hop.orm.entity';
import { RecipeHopType } from '../../recipe/domain/enums/recipe-hop-type.enum';
import { RecipeOrmEntity } from '../../recipe/entities/recipe.orm.entity';
import { RecipeStepOrmEntity } from '../../recipe/entities/recipe-step.orm.entity';
import { RecipeStepType } from '../../recipe/domain/enums/recipe-step-type.enum';
import { RecipeVisibility } from '../../recipe/domain/enums/recipe-visibility.enum';
import { RecipeYeastOrmEntity } from '../../recipe/entities/recipe-yeast.orm.entity';
import { RecipeYeastType } from '../../recipe/domain/enums/recipe-yeast-type.enum';
import { SYSTEM_USER_ID } from './system-user.seed';

/**
 * Seed for `recipes` table — 10 PUBLIC curated recipes (Issue #701).
 *
 * Provides the canonical pool of community-style recipes that the
 * BeerInfoCardScreen `Recettes équivalentes` section can offer for
 * import. Each demo bottle (Punk IPA / La Chouffe / Rochefort 10 /
 * La Goudale) maps to 3 of these recipes via the mobile
 * `demoEquivalentRecipes` table; this seed makes the underlying
 * `POST /recipes/import-from-community/:id` happy path resolvable
 * in backend mode (without these rows, the import returns 404 and
 * the mobile UI shows the sad-path 'Import impossible' alert).
 *
 * Owner is a deterministic system UUID (no FK to a real user — the
 * recipes table doesn't enforce a FK at the ORM level). Visibility
 * is PUBLIC so the existing visibility check in
 * `RecipeService.importFromCommunity` accepts them.
 *
 * The loader is idempotent — running it twice does not duplicate
 * rows: existing IDs are detected and updated in place, new ones
 * are inserted.
 */

/**
 * Sentinel UUID used as `owner_id` for all seeded public recipes.
 * Marks them as system-curated, distinct from any real user account.
 *
 * Re-exported from `system-user.seed` so a single source of truth
 * exists for the curator UUID across all seed files.
 */
export const PUBLIC_RECIPES_SYSTEM_OWNER_ID = SYSTEM_USER_ID;

/**
 * Fermentable entry in the seed data. Mirrors the mutable columns of
 * `RecipeFermentableOrmEntity` (minus the autogen id / recipe_id /
 * timestamps). Same shape contract as the BrewDog DIY Dog seed.
 */
export interface PublicRecipeFermentableSeed {
  name: string;
  type: RecipeFermentableType;
  weight_g: number;
  potential_gravity?: number;
  color_ebc?: number;
}

/**
 * Hop addition in the seed data. `addition_time_min` is
 * minutes-from-knockout for BOIL additions, days-of-contact for
 * DRY_HOP additions, and may be omitted for WHIRLPOOL additions whose
 * timing the source recipe leaves unspecified.
 */
export interface PublicRecipeHopSeed {
  variety: string;
  type: RecipeHopType;
  weight_g: number;
  alpha_acid_percent?: number;
  addition_stage: RecipeHopAdditionStage;
  addition_time_min?: number;
}

/**
 * Yeast addition in the seed data. `amount_g` defaults to one
 * dry-yeast sachet (~11.5 g) when the source recipe documents no
 * pitch rate.
 */
export interface PublicRecipeYeastSeed {
  name: string;
  type: RecipeYeastType;
  amount_g: number;
  attenuation_percent?: number;
  temperature_min_c?: number;
  temperature_max_c?: number;
}

/**
 * Brewing step in the seed data. Mirrors `RecipeStepOrmEntity`'s
 * mutable columns (`step_order` is part of the composite PK).
 */
export interface PublicRecipeStepSeed {
  step_order: number;
  type: RecipeStepType;
  label: string;
  description?: string | null;
}

/**
 * Canonical five-stage brewing workflow shared by every seeded
 * recipe that carries steps. Kept structurally identical to
 * `RecipeWorkflowService.getDefaultWorkflow()` (asserted by a parity
 * test) so a non-owner reading a public recipe's `/steps` sees the
 * same default workflow an owner gets lazily materialised — the
 * `ensureDefaultSteps` write only fires for owners (Issue #779), so
 * public recipes must ship their steps explicitly.
 */
export const DEFAULT_WORKFLOW_STEPS: readonly PublicRecipeStepSeed[] = [
  {
    step_order: 0,
    type: RecipeStepType.MASH,
    label: 'Mash',
    description: 'Mash grains to extract fermentable sugars.',
  },
  {
    step_order: 1,
    type: RecipeStepType.BOIL,
    label: 'Boil',
    description: 'Boil wort and add hops according to schedule.',
  },
  {
    step_order: 2,
    type: RecipeStepType.WHIRLPOOL,
    label: 'Whirlpool',
    description: 'Whirlpool and cool the wort before fermentation.',
  },
  {
    step_order: 3,
    type: RecipeStepType.FERMENTATION,
    label: 'Fermentation',
    description: 'Ferment wort with yeast until final gravity is reached.',
  },
  {
    step_order: 4,
    type: RecipeStepType.PACKAGING,
    label: 'Packaging',
    description: 'Package beer (bottling/kegging) and carbonate.',
  },
];

/**
 * Shape of one seeded public recipe. Brewing metrics are
 * approximations from public datasheets and BJCP style guidelines,
 * adapted for a 20L homebrew batch.
 *
 * The optional `fermentables` / `hops` / `yeasts` / `steps` arrays
 * carry the full recipe content. They are populated only for the
 * scan-reachable recipes (the Punk IPA "official" row and its
 * equivalents) so the live mobile recipe-detail screen shows real
 * ingredients and a brewing workflow rather than an empty shell.
 * Metadata-only recipes leave them undefined.
 */
export interface PublicRecipeSeed {
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
  avg_rating: number;
  brew_count: number;
  /**
   * Optional per-recipe official flag. Defaults to `false`. The
   * matching algorithm grants `is_official = true` recipes a 100-point
   * similarity boost (see `RecipeMatchingService`), so they win
   * outright among style-matched candidates. Reserved for brewer-
   * endorsed clones tied to a specific demo bottle (e.g. BrewDog
   * DIY Dog → Punk IPA). Tagging more than ~one official per style
   * collapses `rankForBeer` to insertion order — the regression
   * Codex caught on PR #773.
   */
  is_official?: boolean;
  /**
   * Full grain bill for the recipe (recipe_fermentables rows). Only
   * set on scan-reachable recipes; metadata-only rows leave it
   * undefined and seed no fermentables.
   */
  fermentables?: readonly PublicRecipeFermentableSeed[];
  /** Full hop schedule (recipe_hops rows). Same optionality contract. */
  hops?: readonly PublicRecipeHopSeed[];
  /** Yeast strains (recipe_yeasts rows). Same optionality contract. */
  yeasts?: readonly PublicRecipeYeastSeed[];
  /** Brewing workflow (recipe_steps rows). Same optionality contract. */
  steps?: readonly PublicRecipeStepSeed[];
}

/**
 * The 10 demo public recipes — 3 stylistic neighbours per demo
 * bottle. UUIDs are deterministic (sequential + RFC4122 v4 variant
 * bits) so the mobile `demoEquivalentRecipes` table can reference
 * them statically without a database round-trip.
 */
export const PUBLIC_RECIPES_SEED: readonly PublicRecipeSeed[] = [
  // --- IPA family (matches Punk IPA) ---
  {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Session IPA Citra',
    description:
      "Session IPA tropicale et désaltérante autour d'un mono-houblon Citra. Houblonnée à cru pour un nez explosif d'agrumes et de fruit de la passion.",
    style: 'Session IPA',
    batch_size_l: 20,
    boil_time_min: 60,
    og_target: 1.045,
    fg_target: 1.01,
    abv_estimated: 4.6,
    ibu_target: 30,
    ebc_target: 12,
    efficiency_target: 72,
    avg_rating: 4.7,
    brew_count: 23,
    // Light, mono-Citra session IPA. Modest bittering charge, big
    // late + dry-hop load for the "nez explosif d'agrumes" without
    // pushing IBU past the session range.
    fermentables: [
      {
        name: 'Pale Ale Malt',
        type: RecipeFermentableType.GRAIN,
        weight_g: 3700,
        color_ebc: 7,
      },
      {
        name: 'CaraPils',
        type: RecipeFermentableType.GRAIN,
        weight_g: 250,
        color_ebc: 4,
      },
      {
        name: 'Wheat Malt',
        type: RecipeFermentableType.GRAIN,
        weight_g: 200,
        color_ebc: 4,
      },
    ],
    hops: [
      {
        variety: 'Citra',
        type: RecipeHopType.PELLET,
        weight_g: 10,
        alpha_acid_percent: 12,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 60,
      },
      {
        variety: 'Citra',
        type: RecipeHopType.PELLET,
        weight_g: 20,
        alpha_acid_percent: 12,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 10,
      },
      {
        variety: 'Citra',
        type: RecipeHopType.PELLET,
        weight_g: 25,
        alpha_acid_percent: 12,
        addition_stage: RecipeHopAdditionStage.WHIRLPOOL,
      },
      {
        variety: 'Citra',
        type: RecipeHopType.PELLET,
        weight_g: 40,
        alpha_acid_percent: 12,
        addition_stage: RecipeHopAdditionStage.DRY_HOP,
        addition_time_min: 4,
      },
    ],
    yeasts: [
      {
        name: 'Fermentis SafAle US-05',
        type: RecipeYeastType.ALE,
        amount_g: 11.5,
        attenuation_percent: 81,
        temperature_min_c: 15,
        temperature_max_c: 22,
      },
    ],
    steps: DEFAULT_WORKFLOW_STEPS,
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    name: 'NEIPA Tropical',
    description:
      'New England IPA voilée, ronde, peu amère, dominée par les esters fruités de la levure London Ale et un dry-hop massif Citra+Mosaic.',
    style: 'NEIPA',
    batch_size_l: 20,
    boil_time_min: 60,
    og_target: 1.06,
    fg_target: 1.012,
    abv_estimated: 6.4,
    ibu_target: 45,
    ebc_target: 8,
    efficiency_target: 70,
    avg_rating: 4.5,
    brew_count: 18,
    // Hazy NEIPA: oat/wheat base for body + haze, minimal bittering,
    // the bitterness budget spent late — big whirlpool + dry-hop of
    // Citra + Mosaic for the "dry-hop massif" tropical nose. London
    // Ale III yeast for the fruity esters and soft mouthfeel.
    fermentables: [
      {
        name: 'Pale Ale Malt',
        type: RecipeFermentableType.GRAIN,
        weight_g: 3400,
        color_ebc: 7,
      },
      {
        name: 'Wheat Malt',
        type: RecipeFermentableType.GRAIN,
        weight_g: 1000,
        color_ebc: 4,
      },
      {
        name: 'Flaked Oats',
        type: RecipeFermentableType.GRAIN,
        weight_g: 500,
        color_ebc: 2,
      },
    ],
    hops: [
      {
        variety: 'Magnum',
        type: RecipeHopType.PELLET,
        weight_g: 8,
        alpha_acid_percent: 12,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 60,
      },
      {
        variety: 'Citra',
        type: RecipeHopType.PELLET,
        weight_g: 15,
        alpha_acid_percent: 12,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 5,
      },
      {
        variety: 'Citra',
        type: RecipeHopType.PELLET,
        weight_g: 25,
        alpha_acid_percent: 12,
        addition_stage: RecipeHopAdditionStage.WHIRLPOOL,
      },
      {
        variety: 'Mosaic',
        type: RecipeHopType.PELLET,
        weight_g: 25,
        alpha_acid_percent: 12,
        addition_stage: RecipeHopAdditionStage.WHIRLPOOL,
      },
      {
        variety: 'Citra',
        type: RecipeHopType.PELLET,
        weight_g: 30,
        alpha_acid_percent: 12,
        addition_stage: RecipeHopAdditionStage.DRY_HOP,
        addition_time_min: 4,
      },
      {
        variety: 'Mosaic',
        type: RecipeHopType.PELLET,
        weight_g: 30,
        alpha_acid_percent: 12,
        addition_stage: RecipeHopAdditionStage.DRY_HOP,
        addition_time_min: 4,
      },
    ],
    yeasts: [
      {
        name: 'Wyeast 1318 London Ale III',
        type: RecipeYeastType.ALE,
        amount_g: 11.5,
        attenuation_percent: 75,
        temperature_min_c: 18,
        temperature_max_c: 22,
      },
    ],
    steps: DEFAULT_WORKFLOW_STEPS,
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    name: 'White IPA',
    description:
      "Hybride witbier + IPA — base wheat malt, levure belge, houblons américains. Coriandre + écorce d'orange légères pour le pont stylistique.",
    style: 'White IPA',
    batch_size_l: 20,
    boil_time_min: 60,
    og_target: 1.054,
    fg_target: 1.012,
    abv_estimated: 5.5,
    ibu_target: 40,
    ebc_target: 10,
    efficiency_target: 72,
    avg_rating: 4.3,
    brew_count: 12,
    // Witbier + IPA hybrid: ~45% wheat base, Belgian witbier yeast for
    // the phenolic/spicy bridge, American hops for the IPA backbone.
    // Coriander + orange peel (in the description) are spice additives,
    // out of scope for the ingredient sub-tables modelled here.
    fermentables: [
      {
        name: 'Pilsner Malt',
        type: RecipeFermentableType.GRAIN,
        weight_g: 2200,
        color_ebc: 3,
      },
      {
        name: 'Wheat Malt',
        type: RecipeFermentableType.GRAIN,
        weight_g: 2000,
        color_ebc: 4,
      },
      {
        name: 'CaraPils',
        type: RecipeFermentableType.GRAIN,
        weight_g: 200,
        color_ebc: 4,
      },
    ],
    hops: [
      {
        variety: 'Cascade',
        type: RecipeHopType.PELLET,
        weight_g: 18,
        alpha_acid_percent: 6,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 60,
      },
      {
        variety: 'Amarillo',
        type: RecipeHopType.PELLET,
        weight_g: 20,
        alpha_acid_percent: 9,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 10,
      },
      {
        variety: 'Citra',
        type: RecipeHopType.PELLET,
        weight_g: 20,
        alpha_acid_percent: 12,
        addition_stage: RecipeHopAdditionStage.WHIRLPOOL,
      },
      {
        variety: 'Cascade',
        type: RecipeHopType.PELLET,
        weight_g: 25,
        alpha_acid_percent: 6,
        addition_stage: RecipeHopAdditionStage.DRY_HOP,
        addition_time_min: 4,
      },
    ],
    yeasts: [
      {
        name: 'Wyeast 3944 Belgian Witbier',
        type: RecipeYeastType.ALE,
        amount_g: 11.5,
        attenuation_percent: 74,
        temperature_min_c: 18,
        temperature_max_c: 24,
      },
    ],
    steps: DEFAULT_WORKFLOW_STEPS,
  },
  // --- Belgian / Saison family (matches La Chouffe + La Goudale) ---
  {
    id: '00000000-0000-4000-8000-000000000004',
    name: 'Belgian Tripel',
    description:
      'Tripel classique sur base pilsner + sucre candi clair. Levure belge type Westmalle pour les esters fruités et phénols poivrés. Finale sèche.',
    style: 'Belgian Tripel',
    batch_size_l: 20,
    boil_time_min: 90,
    og_target: 1.075,
    fg_target: 1.01,
    abv_estimated: 8.5,
    ibu_target: 30,
    ebc_target: 18,
    efficiency_target: 75,
    avg_rating: 4.8,
    brew_count: 31,
  },
  {
    id: '00000000-0000-4000-8000-000000000005',
    name: 'Saison Farmhouse',
    description:
      'Saison rustique inspirée des fermes du Hainaut. Levure saison à haute fermentation (28-32°C), atténuation très élevée, finale poivrée et acidulée.',
    style: 'Saison',
    batch_size_l: 20,
    boil_time_min: 90,
    og_target: 1.055,
    fg_target: 1.005,
    abv_estimated: 6.5,
    ibu_target: 25,
    ebc_target: 10,
    efficiency_target: 72,
    avg_rating: 4.6,
    brew_count: 19,
  },
  {
    id: '00000000-0000-4000-8000-000000000006',
    name: 'Witbier Orange',
    description:
      "Witbier traditionnelle 50% wheat / 50% pilsner. Coriandre + zeste d'orange amère de Curaçao en fin d'ébullition. Trouble naturel, finale acidulée.",
    style: 'Witbier',
    batch_size_l: 20,
    boil_time_min: 60,
    og_target: 1.046,
    fg_target: 1.01,
    abv_estimated: 4.8,
    ibu_target: 18,
    ebc_target: 8,
    efficiency_target: 72,
    avg_rating: 4.2,
    brew_count: 9,
  },
  // --- Strong / Dark family (matches Rochefort 10) ---
  {
    id: '00000000-0000-4000-8000-000000000007',
    name: 'Scotch Ale Wee Heavy',
    description:
      'Scotch Ale forte type Wee Heavy. Maltée à fond, caramel cuit, légère touche tourbée optionnelle. Maturation 3 mois recommandée.',
    style: 'Wee Heavy',
    batch_size_l: 20,
    boil_time_min: 90,
    og_target: 1.08,
    fg_target: 1.02,
    abv_estimated: 8.2,
    ibu_target: 30,
    ebc_target: 50,
    efficiency_target: 70,
    avg_rating: 4.9,
    brew_count: 27,
  },
  {
    id: '00000000-0000-4000-8000-000000000008',
    name: 'Imperial Stout',
    description:
      'Russian Imperial Stout sur base pale ale + multiples malts torréfiés (chocolate, roasted barley, black malt). Café noir, chocolat amer, vanille en arrière-plan.',
    style: 'Imperial Stout',
    batch_size_l: 20,
    boil_time_min: 90,
    og_target: 1.09,
    fg_target: 1.025,
    abv_estimated: 9.5,
    ibu_target: 60,
    ebc_target: 80,
    efficiency_target: 68,
    avg_rating: 4.7,
    brew_count: 22,
  },
  {
    id: '00000000-0000-4000-8000-000000000009',
    name: 'Baltic Porter',
    description:
      'Porter de la Baltique fermenté à froid avec une levure lager. Plus propre que le Russian Imperial Stout, notes de pruneau, café et chocolat noir.',
    style: 'Baltic Porter',
    batch_size_l: 20,
    boil_time_min: 90,
    og_target: 1.075,
    fg_target: 1.018,
    abv_estimated: 7.5,
    ibu_target: 35,
    ebc_target: 70,
    efficiency_target: 70,
    avg_rating: 4.4,
    brew_count: 14,
  },
  // --- Light / Lager family (matches La Goudale) ---
  {
    id: '00000000-0000-4000-8000-00000000000a',
    name: 'Kölsch Tradition',
    description:
      'Kölsch de Cologne — bière hybride fermentée chaude par une levure ale puis lagering à froid. Pâle, sèche, finale légèrement noble (Tettnanger).',
    style: 'Kölsch',
    batch_size_l: 20,
    boil_time_min: 75,
    og_target: 1.046,
    fg_target: 1.01,
    abv_estimated: 4.8,
    ibu_target: 22,
    ebc_target: 8,
    efficiency_target: 75,
    avg_rating: 4.4,
    brew_count: 15,
  },
  // --- Brewer-endorsed clone (matches Punk IPA — Issue #911) ---
  // The 11th entry, kept stylistically aligned with the Punk IPA
  // demo bottle. Canonical DIY Dog values from BrewDog's published
  // datasheet at the canonical 23L batch size.
  //
  // Note on `is_official`: deliberately NOT set to true on this
  // backend seed row. The matching service treats `is_official` as
  // a GLOBAL per-recipe shortcut (100-pt similarity boost in
  // `RecipeMatchingService.computeFinalScore`), and `rankForBeer`
  // evaluates every PUBLIC recipe against every scanned beer — so
  // tagging this row would surface the DIY Dog as the "official"
  // recipe for La Chouffe, Rochefort, etc. (Codex P1 caught on PR
  // #912). The "🏆 Recette officielle" demo beat works through the
  // mobile `demoEquivalentRecipes` mock, which scopes `isOfficial`
  // per-barcode and only tags this entry under `5060277380019` /
  // `4260649360279`. Backend-mode per-beer official linking is
  // deferred to a follow-up issue.
  {
    id: '00000000-0000-4000-8000-00000000000b',
    name: 'BrewDog DIY Dog Punk IPA',
    description:
      'Recette officielle BrewDog publiée dans le programme DIY Dog. American IPA de référence — base Maris Otter + Caramalt, cinq houblons américains au whirlpool et en dry-hop (Ahtanum, Chinook, Nelson Sauvin, Cascade, Simcoe), levure US-05. Profil propre, amertume marquée, nez agrumes et fruits tropicaux.',
    style: 'American IPA',
    batch_size_l: 23,
    boil_time_min: 60,
    og_target: 1.056,
    fg_target: 1.013,
    abv_estimated: 5.6,
    ibu_target: 41,
    ebc_target: 14,
    efficiency_target: 75,
    avg_rating: 4.9,
    brew_count: 312,
    // Post-2010 canonical Punk IPA, 23L batch. Matches the row's own
    // description: Maris Otter + Caramalt base, five American hops
    // (Ahtanum, Chinook, Nelson Sauvin, Cascade, Simcoe) split across
    // boil / whirlpool / dry-hop, US-05 yeast. This is the scan-flow's
    // "official" recipe — it MUST carry content so the live detail
    // screen is not an empty shell when tapped.
    fermentables: [
      {
        name: 'Maris Otter Extra Pale',
        type: RecipeFermentableType.GRAIN,
        weight_g: 5300,
        color_ebc: 6,
      },
      {
        name: 'Caramalt',
        type: RecipeFermentableType.GRAIN,
        weight_g: 250,
        color_ebc: 50,
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
        variety: 'Ahtanum',
        type: RecipeHopType.PELLET,
        weight_g: 12.5,
        alpha_acid_percent: 5,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 15,
      },
      {
        variety: 'Chinook',
        type: RecipeHopType.PELLET,
        weight_g: 12.5,
        alpha_acid_percent: 13,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 15,
      },
      {
        variety: 'Nelson Sauvin',
        type: RecipeHopType.PELLET,
        weight_g: 12.5,
        alpha_acid_percent: 12,
        addition_stage: RecipeHopAdditionStage.WHIRLPOOL,
      },
      {
        variety: 'Cascade',
        type: RecipeHopType.PELLET,
        weight_g: 12.5,
        alpha_acid_percent: 6,
        addition_stage: RecipeHopAdditionStage.WHIRLPOOL,
      },
      {
        variety: 'Simcoe',
        type: RecipeHopType.PELLET,
        weight_g: 12.5,
        alpha_acid_percent: 13,
        addition_stage: RecipeHopAdditionStage.WHIRLPOOL,
      },
      {
        variety: 'Ahtanum',
        type: RecipeHopType.PELLET,
        weight_g: 18.8,
        alpha_acid_percent: 5,
        addition_stage: RecipeHopAdditionStage.DRY_HOP,
        addition_time_min: 4,
      },
      {
        variety: 'Chinook',
        type: RecipeHopType.PELLET,
        weight_g: 18.8,
        alpha_acid_percent: 13,
        addition_stage: RecipeHopAdditionStage.DRY_HOP,
        addition_time_min: 4,
      },
      {
        variety: 'Nelson Sauvin',
        type: RecipeHopType.PELLET,
        weight_g: 18.8,
        alpha_acid_percent: 12,
        addition_stage: RecipeHopAdditionStage.DRY_HOP,
        addition_time_min: 4,
      },
      {
        variety: 'Cascade',
        type: RecipeHopType.PELLET,
        weight_g: 18.8,
        alpha_acid_percent: 6,
        addition_stage: RecipeHopAdditionStage.DRY_HOP,
        addition_time_min: 4,
      },
      {
        variety: 'Simcoe',
        type: RecipeHopType.PELLET,
        weight_g: 18.8,
        alpha_acid_percent: 13,
        addition_stage: RecipeHopAdditionStage.DRY_HOP,
        addition_time_min: 4,
      },
    ],
    yeasts: [
      {
        name: 'Fermentis SafAle US-05',
        type: RecipeYeastType.ALE,
        amount_g: 11.5,
        attenuation_percent: 81,
        temperature_min_c: 15,
        temperature_max_c: 22,
      },
    ],
    steps: DEFAULT_WORKFLOW_STEPS,
  },
];

/**
 * Result returned by `seedPublicRecipes` for instrumentation /
 * verification. Lets callers (tests, CLI, npm scripts) report what
 * happened without re-querying the DB.
 */
export interface SeedPublicRecipesResult {
  inserted: number;
  updated: number;
  total: number;
}

/**
 * The four sub-resource repositories needed to persist a recipe's
 * full content (grain bill / hop schedule / yeast / steps). Optional
 * on `seedPublicRecipes` — when omitted the loader seeds recipe
 * metadata only (its historical behaviour). When provided, every seed
 * recipe that declares the matching array gets its sub-tables
 * wiped-and-refilled idempotently.
 */
export interface PublicRecipeSubResourceRepos {
  fermentableRepo: Repository<RecipeFermentableOrmEntity>;
  hopRepo: Repository<RecipeHopOrmEntity>;
  yeastRepo: Repository<RecipeYeastOrmEntity>;
  stepRepo: Repository<RecipeStepOrmEntity>;
}

/**
 * Resolves the four sub-resource repositories from a DataSource —
 * the single place every entrypoint (the `run-public-recipes-seed` /
 * `run-demo-batch-seed` scripts, prod `fly ssh` invocations) builds
 * them, so none can silently fall back to metadata-only seeding by
 * forgetting a repo (Codex review on PR #1170).
 */
export function buildPublicRecipeSubResourceRepos(
  dataSource: DataSource,
): PublicRecipeSubResourceRepos {
  return {
    fermentableRepo: dataSource.getRepository(RecipeFermentableOrmEntity),
    hopRepo: dataSource.getRepository(RecipeHopOrmEntity),
    yeastRepo: dataSource.getRepository(RecipeYeastOrmEntity),
    stepRepo: dataSource.getRepository(RecipeStepOrmEntity),
  };
}

/**
 * Wipe-and-refill the sub-tables for one recipe. Mirrors the BrewDog
 * DIY Dog seed: for each declared ingredient/step array, delete the
 * recipe's existing rows then insert the seed's one by one — so re-running
 * converges on exactly what the seed declares, regardless of drift.
 * An undeclared array is left untouched (no delete), so metadata-only
 * recipes never lose data they never owned.
 */
async function seedRecipeSubResources(
  repos: PublicRecipeSubResourceRepos,
  recipe: PublicRecipeSeed,
): Promise<void> {
  const { fermentableRepo, hopRepo, yeastRepo, stepRepo } = repos;

  if (recipe.fermentables) {
    await fermentableRepo.delete({ recipe_id: recipe.id });
    for (const fermentable of recipe.fermentables) {
      await fermentableRepo.save(
        fermentableRepo.create({ recipe_id: recipe.id, ...fermentable }),
      );
    }
  }

  if (recipe.hops) {
    await hopRepo.delete({ recipe_id: recipe.id });
    for (const hop of recipe.hops) {
      await hopRepo.save(hopRepo.create({ recipe_id: recipe.id, ...hop }));
    }
  }

  if (recipe.yeasts) {
    await yeastRepo.delete({ recipe_id: recipe.id });
    for (const yeast of recipe.yeasts) {
      await yeastRepo.save(
        yeastRepo.create({ recipe_id: recipe.id, ...yeast }),
      );
    }
  }

  if (recipe.steps) {
    await stepRepo.delete({ recipe_id: recipe.id });
    for (const step of recipe.steps) {
      await stepRepo.save(stepRepo.create({ recipe_id: recipe.id, ...step }));
    }
  }
}

/**
 * Idempotent loader for the curated public recipes above. Insert
 * if the id is unknown, update in place otherwise. Always sets
 * `visibility = PUBLIC` and `imported_from_recipe_id = null` (these
 * are originals, not imports). `is_official` is read from the seed
 * entry (defaults to `false`). Owner is the system sentinel UUID.
 *
 * Note on `is_official`: the matching algorithm (Issue #699) treats
 * `is_official = true` as a beer-specific shortcut that wins outright
 * (score 100). Tagging every seed recipe as official would make all
 * PUBLIC rows tie at 100 and collapse `rankForBeer` to insertion
 * order — the regression Codex caught on PR #773. The flag is
 * reserved for brewer-endorsed clones tied to a specific demo bottle
 * (currently only the BrewDog DIY Dog clone for Punk IPA — Issue
 * #911 unblocks the demo Beat 4 "🏆 Recette officielle" section).
 *
 * When `subRepos` is supplied, each recipe that declares
 * `fermentables` / `hops` / `yeasts` / `steps` also gets those
 * sub-tables wiped-and-refilled (see `seedRecipeSubResources`). This
 * is what makes the scan-reachable recipes show real content on the
 * live mobile detail screen. Omitting `subRepos` preserves the
 * original metadata-only behaviour for callers that don't need it.
 */
export async function seedPublicRecipes(
  repository: Repository<RecipeOrmEntity>,
  recipes: readonly PublicRecipeSeed[] = PUBLIC_RECIPES_SEED,
  subRepos?: PublicRecipeSubResourceRepos,
): Promise<SeedPublicRecipesResult> {
  let inserted = 0;
  let updated = 0;

  for (const recipe of recipes) {
    // Single payload shared by both insert and update branches —
    // any drift would silently desync the two paths and is precisely
    // what the duplication detector caught.
    const payload = {
      owner_id: PUBLIC_RECIPES_SYSTEM_OWNER_ID,
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
      is_official: recipe.is_official ?? false,
      imported_from_recipe_id: null,
      import_provenance: null,
    };

    const existing = await repository.findOne({ where: { id: recipe.id } });

    if (existing) {
      Object.assign(existing, payload);
      await repository.save(existing);
      updated += 1;
    } else {
      const created = repository.create({ id: recipe.id, ...payload });
      await repository.save(created);
      inserted += 1;
    }

    if (subRepos) {
      await seedRecipeSubResources(subRepos, recipe);
    }
  }

  return { inserted, updated, total: inserted + updated };
}
