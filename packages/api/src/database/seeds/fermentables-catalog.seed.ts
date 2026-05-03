import { FermentableOrmEntity } from '../../catalog/fermentable/entities/fermentable.orm.entity';
import { FermentableType } from '../../catalog/fermentable/domain/enums/fermentable-type.enum';
import { Repository } from 'typeorm';
import { idempotentUpsertById } from './seed-utils';

/**
 * Seed for the `fermentables` reference catalogue (Issue #708 /
 * #869, Phase 1 PR #2). Operator-curated entries — drawn from the
 * BeerXML 1.0 reference fixture (`docs/architecture/specs/fixtures/
 * libraries/grain.xml`, 4 entries) and from the standard homebrew
 * grain bills published by major maltsters (Briess, Castle Malting,
 * Crisp, Bairds), but deliberately not a verbatim copy of either
 * source. Each row is authored to be picker-friendly with French
 * notes matching the convention of `PUBLIC_RECIPES_SEED.description`
 * and `HOPS_CATALOG_SEED`.
 *
 * The 20 entries are split:
 *   • 4 BeerXML canonical (Acid Malt, Brown Malt, Munich Malt,
 *     Pale Malt 2 Row UK) — the ones in `libraries/grain.xml`.
 *   • 16 popular grains, sugars and extracts needed by the demo
 *     recipes (Punk IPA, NEIPA, Saison, Belgian Tripel, Witbier,
 *     Imperial Stout, Dry Stout, Wee Heavy, Pilsner) and the
 *     broader homebrew vocabulary.
 *
 * UUID range `00000000-0000-4000-9000-…` is shared with the hop
 * catalogue. Fermentables use a distinct second-segment range
 * (`…-9000-1000-…`) to avoid collision.
 *
 * Supplier relations are intentionally absent — they land via the
 * follow-up "normalize-producers" PR that introduces `producers` +
 * `fermentable_suppliers` (alongside `hop_producers` and
 * `yeast_labs`) as one coherent normalised model after Phase 1.
 *
 * Colour values are stored in EBC (project convention — see
 * `feedback_normalized_colors`). Original BeerXML / BeerSmith
 * datasheets quote SRM; the conversion used is EBC ≈ SRM × 1.97.
 */

export interface FermentableCatalogSeed {
  id: string;
  name: string;
  type: FermentableType;
  origin: string | null;
  color_ebc_typical: number | null;
  potential_gravity_typical: number | null;
  yield_percent_typical: number | null;
  diastatic_power_lintner: number | null;
  max_in_batch_percent: number | null;
  recommend_mash: boolean;
  notes: string | null;
}

export const FERMENTABLES_CATALOG_SEED: readonly FermentableCatalogSeed[] = [
  // ─── 4 BeerXML canonical entries (libraries/grain.xml) ──────────────────
  {
    id: '00000000-0000-4000-9000-100000000001',
    name: 'Acid Malt',
    type: FermentableType.GRAIN,
    origin: 'Germany',
    color_ebc_typical: 5.9,
    potential_gravity_typical: 1.027,
    yield_percent_typical: 58.7,
    diastatic_power_lintner: 0,
    max_in_batch_percent: 10,
    recommend_mash: true,
    notes:
      'Malt acide allemand utilisé pour ajuster le pH du moût sans ' +
      'additifs chimiques (conforme à la Reinheitsgebot). Améliore ' +
      'aussi la rétention de mousse. À doser avec parcimonie.',
  },
  {
    id: '00000000-0000-4000-9000-100000000002',
    name: 'Brown Malt',
    type: FermentableType.GRAIN,
    origin: 'United Kingdom',
    color_ebc_typical: 128,
    potential_gravity_typical: 1.032,
    yield_percent_typical: 70,
    diastatic_power_lintner: 0,
    max_in_batch_percent: 10,
    recommend_mash: true,
    notes:
      'Malt brun anglais. Apporte des saveurs de biscuit sec, noisette ' +
      'et chocolat léger. Caractéristique des Brown Ales, Porters et ' +
      'certaines bières belges.',
  },
  {
    id: '00000000-0000-4000-9000-100000000003',
    name: 'Munich Malt',
    type: FermentableType.GRAIN,
    origin: 'Germany',
    color_ebc_typical: 17.7,
    potential_gravity_typical: 1.037,
    yield_percent_typical: 80,
    diastatic_power_lintner: 72,
    max_in_batch_percent: 80,
    recommend_mash: true,
    notes:
      'Malt allemand de couleur ambrée. Profil malté-doux, ajoute une ' +
      'couleur ambrée rougeâtre. Référence pour Bock, Märzen, ' +
      'Oktoberfest. Peut servir de base ou de spécialité.',
  },
  {
    id: '00000000-0000-4000-9000-100000000004',
    name: 'Pale Malt (2 Row) UK',
    type: FermentableType.GRAIN,
    origin: 'United Kingdom',
    color_ebc_typical: 5.9,
    potential_gravity_typical: 1.036,
    yield_percent_typical: 78,
    diastatic_power_lintner: 45,
    max_in_batch_percent: 100,
    recommend_mash: true,
    notes:
      'Malt de base anglais générique. Pouvoir diastasique modéré, ' +
      'saveur biscuitée discrète. Convient pour toutes les ales ' +
      'anglaises classiques.',
  },
  // ─── 16 popular grains / sugars / extracts for the demo recipes ──────────
  {
    id: '00000000-0000-4000-9000-100000000005',
    name: 'Pale Ale Malt (US 2-Row)',
    type: FermentableType.GRAIN,
    origin: 'United States',
    color_ebc_typical: 5.9,
    potential_gravity_typical: 1.037,
    yield_percent_typical: 80,
    diastatic_power_lintner: 100,
    max_in_batch_percent: 100,
    recommend_mash: true,
    notes:
      'Malt de base américain à 2 rangs. Pouvoir diastasique élevé, ' +
      'très neutre. Standard des American Pale Ales, IPAs, NEIPAs et ' +
      'Imperial Stouts. Choix par défaut pour la Punk IPA.',
  },
  {
    id: '00000000-0000-4000-9000-100000000006',
    name: 'Pilsner Malt',
    type: FermentableType.GRAIN,
    origin: 'Germany',
    color_ebc_typical: 3.5,
    potential_gravity_typical: 1.037,
    yield_percent_typical: 81,
    diastatic_power_lintner: 110,
    max_in_batch_percent: 100,
    recommend_mash: true,
    notes:
      'Malt de base très clair, le plus pâle. Saveur douce, miellée. ' +
      'Référence pour les pilsners, lagers continentales, saisons et ' +
      'tripels belges. Pouvoir diastasique très élevé.',
  },
  {
    id: '00000000-0000-4000-9000-100000000007',
    name: 'Maris Otter',
    type: FermentableType.GRAIN,
    origin: 'United Kingdom',
    color_ebc_typical: 6.3,
    potential_gravity_typical: 1.038,
    yield_percent_typical: 81,
    diastatic_power_lintner: 50,
    max_in_batch_percent: 100,
    recommend_mash: true,
    notes:
      'Malt de base anglais premium. Saveur biscuitée prononcée, ' +
      'complexité maltée supérieure aux pales standard. Indispensable ' +
      'pour les ESB, Best Bitter, Wee Heavy authentiques.',
  },
  {
    id: '00000000-0000-4000-9000-100000000008',
    name: 'Vienna Malt',
    type: FermentableType.GRAIN,
    origin: 'Germany',
    color_ebc_typical: 7.9,
    potential_gravity_typical: 1.037,
    yield_percent_typical: 80,
    diastatic_power_lintner: 50,
    max_in_batch_percent: 100,
    recommend_mash: true,
    notes:
      'Malt légèrement toasté entre Pilsner et Munich. Apporte une ' +
      'couleur dorée et des notes maltées rondes. Pour Vienna Lagers, ' +
      "Märzens, et en complément d'un base malt pour amber ales.",
  },
  {
    id: '00000000-0000-4000-9000-100000000009',
    name: 'Wheat Malt',
    type: FermentableType.GRAIN,
    origin: 'Germany',
    color_ebc_typical: 3.5,
    potential_gravity_typical: 1.038,
    yield_percent_typical: 84,
    diastatic_power_lintner: 70,
    max_in_batch_percent: 60,
    recommend_mash: true,
    notes:
      'Malt de blé. Excellente rétention de mousse, voile naturel, ' +
      'trouble. Indispensable pour Witbier (50%+), Weizen (50-70%), ' +
      'et utilisé en NEIPA pour la sensation crémeuse.',
  },
  {
    id: '00000000-0000-4000-9000-10000000000a',
    name: 'Flaked Oats',
    type: FermentableType.ADJUNCT,
    origin: 'United States',
    color_ebc_typical: 2,
    potential_gravity_typical: 1.033,
    yield_percent_typical: 70,
    diastatic_power_lintner: 0,
    max_in_batch_percent: 30,
    recommend_mash: true,
    notes:
      "Flocons d'avoine. Apporte onctuosité, corps et sensation " +
      'crémeuse. Indispensable pour les NEIPA modernes (15-20%) et ' +
      'les Oatmeal Stouts (5-15%).',
  },
  {
    id: '00000000-0000-4000-9000-10000000000b',
    name: 'Flaked Barley',
    type: FermentableType.ADJUNCT,
    origin: 'United Kingdom',
    color_ebc_typical: 3.3,
    potential_gravity_typical: 1.032,
    yield_percent_typical: 70,
    diastatic_power_lintner: 0,
    max_in_batch_percent: 30,
    recommend_mash: true,
    notes:
      "Flocons d'orge non maltés. Apporte le corps caractéristique " +
      'des Irish Dry Stouts (Guinness style, 10-30%). Excellente ' +
      'rétention de mousse.',
  },
  {
    id: '00000000-0000-4000-9000-10000000000c',
    name: 'Crystal Malt 60L',
    type: FermentableType.GRAIN,
    origin: 'United Kingdom',
    color_ebc_typical: 118,
    potential_gravity_typical: 1.034,
    yield_percent_typical: 74,
    diastatic_power_lintner: 0,
    max_in_batch_percent: 20,
    recommend_mash: true,
    notes:
      'Malt caramel moyen (60 lovibond). Apporte sucre résiduel non ' +
      'fermentescible, couleur ambrée et notes de caramel/toffee. ' +
      'Ingrédient signature des Pale Ales, IPAs et Brown Ales.',
  },
  {
    id: '00000000-0000-4000-9000-10000000000d',
    name: 'Crystal Malt 120L',
    type: FermentableType.GRAIN,
    origin: 'United Kingdom',
    color_ebc_typical: 236,
    potential_gravity_typical: 1.033,
    yield_percent_typical: 72,
    diastatic_power_lintner: 0,
    max_in_batch_percent: 15,
    recommend_mash: true,
    notes:
      'Malt caramel foncé (120 lovibond). Notes de raisin sec, ' +
      'fruits secs cuits, caramel brûlé. Pour Strong Ales, Wee Heavy, ' +
      "Old Ales. À doser avec parcimonie sous peine d'écœurement.",
  },
  {
    id: '00000000-0000-4000-9000-10000000000e',
    name: 'Chocolate Malt',
    type: FermentableType.GRAIN,
    origin: 'United Kingdom',
    color_ebc_typical: 689,
    potential_gravity_typical: 1.034,
    yield_percent_typical: 70,
    diastatic_power_lintner: 0,
    max_in_batch_percent: 10,
    recommend_mash: true,
    notes:
      'Malt torréfié couleur chocolat. Notes de café léger, chocolat ' +
      'noir, sans amertume excessive. Indispensable pour Porters, ' +
      'Stouts, Brown Ales. Plus doux que le Roasted Barley.',
  },
  {
    id: '00000000-0000-4000-9000-10000000000f',
    name: 'Roasted Barley',
    type: FermentableType.GRAIN,
    origin: 'Ireland',
    color_ebc_typical: 985,
    potential_gravity_typical: 1.032,
    yield_percent_typical: 70,
    diastatic_power_lintner: 0,
    max_in_batch_percent: 10,
    recommend_mash: true,
    notes:
      'Orge non maltée torréfiée. Apporte la couleur noire opaque et ' +
      "l'amertume café typique des Irish Dry Stouts (Guinness). Plus " +
      'âpre et sec que le Chocolate Malt.',
  },
  {
    id: '00000000-0000-4000-9000-100000000010',
    name: 'Black Patent Malt',
    type: FermentableType.GRAIN,
    origin: 'United Kingdom',
    color_ebc_typical: 1377,
    potential_gravity_typical: 1.026,
    yield_percent_typical: 55,
    diastatic_power_lintner: 0,
    max_in_batch_percent: 5,
    recommend_mash: true,
    notes:
      'Malt torréfié à très haute température. Notes brûlées, ' +
      'âcres, café très fort. Apporte la couleur noire dense des ' +
      'Imperial Stouts, Schwarzbiers, Black IPAs. À doser au gramme.',
  },
  {
    id: '00000000-0000-4000-9000-100000000011',
    name: 'Sucrose (sucre de table)',
    type: FermentableType.SUGAR,
    origin: null,
    color_ebc_typical: 0,
    potential_gravity_typical: 1.046,
    yield_percent_typical: 100,
    diastatic_power_lintner: 0,
    max_in_batch_percent: 20,
    recommend_mash: false,
    notes:
      'Sucre de canne ou de betterave raffiné. Fermente à 100%, ' +
      'donne une bière sèche. Utilisé dans les bières belges ' +
      "(Tripels, Strong Goldens) pour booster l'alcool sans alourdir.",
  },
  {
    id: '00000000-0000-4000-9000-100000000012',
    name: 'Belgian Candi Sugar Clear',
    type: FermentableType.SUGAR,
    origin: 'Belgium',
    color_ebc_typical: 1,
    potential_gravity_typical: 1.036,
    yield_percent_typical: 100,
    diastatic_power_lintner: 0,
    max_in_batch_percent: 20,
    recommend_mash: false,
    notes:
      'Sucre candi clair belge. Fermente à 100% sans laisser de ' +
      'résidu. Indispensable pour les Belgian Tripels et Strong ' +
      'Golden Ales (10-20% du fermentescible total).',
  },
  {
    id: '00000000-0000-4000-9000-100000000013',
    name: 'Honey',
    type: FermentableType.SUGAR,
    origin: null,
    color_ebc_typical: 4,
    potential_gravity_typical: 1.035,
    yield_percent_typical: 75,
    diastatic_power_lintner: 0,
    max_in_batch_percent: 20,
    recommend_mash: false,
    notes:
      'Miel naturel. Fermente presque entièrement, laisse une ' +
      'subtile note florale en arrière-plan. Pour Honey Ales, ' +
      'Wee Heavy, ou en finition de Belgian Strong Ales.',
  },
  {
    id: '00000000-0000-4000-9000-100000000014',
    name: 'Light DME (Dry Malt Extract)',
    type: FermentableType.EXTRACT,
    origin: null,
    color_ebc_typical: 7.9,
    potential_gravity_typical: 1.044,
    yield_percent_typical: 78,
    diastatic_power_lintner: 0,
    max_in_batch_percent: 100,
    recommend_mash: false,
    notes:
      'Extrait de malt sec léger. Pratique pour brassage extract ' +
      '(sans empâtage) ou pour booster un starter de levure. ' +
      "Reproduit le profil d'un base malt sans le mash.",
  },
];

/**
 * Result returned by `seedFermentablesCatalog` for instrumentation /
 * verification. Lets callers (tests, CLI, npm scripts) report what
 * happened without re-querying the DB.
 */
export interface SeedFermentablesCatalogResult {
  inserted: number;
  updated: number;
  total: number;
}

/**
 * Idempotent loader for the fermentable reference catalogue. Insert
 * if the id is unknown, update in place otherwise. Re-running the
 * loader never duplicates rows — see `idempotentUpsertById` for the
 * shared upsert pattern.
 */
export async function seedFermentablesCatalog(
  repository: Repository<FermentableOrmEntity>,
  fermentables: readonly FermentableCatalogSeed[] = FERMENTABLES_CATALOG_SEED,
): Promise<SeedFermentablesCatalogResult> {
  let inserted = 0;
  let updated = 0;

  for (const fermentable of fermentables) {
    const outcome = await idempotentUpsertById(
      repository,
      { id: fermentable.id },
      {
        name: fermentable.name,
        type: fermentable.type,
        origin: fermentable.origin,
        color_ebc_typical: fermentable.color_ebc_typical,
        potential_gravity_typical: fermentable.potential_gravity_typical,
        yield_percent_typical: fermentable.yield_percent_typical,
        diastatic_power_lintner: fermentable.diastatic_power_lintner,
        max_in_batch_percent: fermentable.max_in_batch_percent,
        recommend_mash: fermentable.recommend_mash,
        notes: fermentable.notes,
      },
    );
    inserted += outcome.inserted;
    updated += outcome.updated;
  }

  return { inserted, updated, total: inserted + updated };
}
