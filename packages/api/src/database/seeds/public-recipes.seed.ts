import { Repository } from 'typeorm';

import { RecipeOrmEntity } from '../../recipe/entities/recipe.orm.entity';
import { RecipeVisibility } from '../../recipe/domain/enums/recipe-visibility.enum';
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
 * Shape of one seeded public recipe. Brewing metrics are
 * approximations from public datasheets and BJCP style guidelines,
 * adapted for a 20L homebrew batch.
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
 * Idempotent loader for the curated public recipes above. Insert
 * if the id is unknown, update in place otherwise. Always sets
 * `visibility = PUBLIC`, `is_official = true`, and
 * `imported_from_recipe_id = null` (these are originals, not
 * imports). Owner is the system sentinel UUID.
 */
export async function seedPublicRecipes(
  repository: Repository<RecipeOrmEntity>,
  recipes: readonly PublicRecipeSeed[] = PUBLIC_RECIPES_SEED,
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
      is_official: true,
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
  }

  return { inserted, updated, total: inserted + updated };
}
