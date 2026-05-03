import { Repository } from 'typeorm';

import { WaterOrmEntity } from '../../catalog/water/entities/water.orm.entity';
import { idempotentUpsertById } from './seed-utils';

/**
 * Seed for the `waters` reference catalogue (Issue #708 / #869,
 * Phase 3 PR #6). Operator-curated entries — drawn from the
 * BeerXML 1.0 reference fixture (`docs/architecture/specs/fixtures/
 * libraries/water.xml`, 5 entries) and from standard brewing
 * literature for the modern profiles (Palmer, "How to Brew",
 * appendix B), but deliberately not a verbatim copy. French notes
 * follow the convention of the previous catalogues.
 *
 * The 10 profiles are split:
 *   • 5 BeerXML canonical (Burton on Trent UK, Distilled Water,
 *     Edinburgh Scotland, Milwaukee WI, Pilsen Czech) — verbatim
 *     from libraries/water.xml.
 *   • 5 historically-significant brewing cities for the demo
 *     recipes: Munich, London, Dortmund, Vienna, Dublin.
 *
 * Each historical brewing city built its style around its native
 * water profile. Burton-on-Trent's high sulfate cradled the IPA;
 * Pilsen's softness gave birth to the Pilsner; Dublin's high
 * bicarbonate enabled the dark roasted Irish Stout (Guinness).
 *
 * UUID range `00000000-0000-4000-9000-5000-...` is reserved for
 * waters (hops `0`, fermentables `1`, yeasts `2`, styles `3`,
 * mash `4`, waters `5`).
 */

export interface WaterCatalogSeed {
  id: string;
  name: string;
  origin: string | null;
  calcium_ppm: number | null;
  bicarbonate_ppm: number | null;
  sulfate_ppm: number | null;
  chloride_ppm: number | null;
  sodium_ppm: number | null;
  magnesium_ppm: number | null;
  ph: number | null;
  notes: string | null;
}

export const WATERS_CATALOG_SEED: readonly WaterCatalogSeed[] = [
  // ─── 5 BeerXML canonical entries (libraries/water.xml) ─────────────────
  {
    id: '00000000-0000-4000-9000-500000000001',
    name: 'Burton on Trent, UK',
    origin: 'United Kingdom',
    calcium_ppm: 295,
    bicarbonate_ppm: 300,
    sulfate_ppm: 725,
    chloride_ppm: 25,
    sodium_ppm: 55,
    magnesium_ppm: 45,
    ph: 8,
    notes:
      "Eau historique de Burton-on-Trent, berceau de l'IPA anglaise. " +
      "Sulfate extrême (725 ppm) qui accentue brutalement l'amertume " +
      'des houblons et donne la finale sèche et tranchante des Bass ' +
      'Ale et autres pale ales anglaises. Référence absolue pour les ' +
      'IPA modernes.',
  },
  {
    id: '00000000-0000-4000-9000-500000000002',
    name: 'Distilled Water',
    origin: null,
    calcium_ppm: 0,
    bicarbonate_ppm: 0,
    sulfate_ppm: 0,
    chloride_ppm: 0,
    sodium_ppm: 0,
    magnesium_ppm: 0,
    ph: 7,
    notes:
      'Eau distillée, vierge de tout minéral. Utilisée comme base pour ' +
      'construire un profil minéral cible avec des sels brassicoles ' +
      '(gypse, chlorure de calcium, bicarbonate de soude). Approche ' +
      'préférée des brasseurs avancés qui ne font pas confiance à ' +
      'leur eau du robinet.',
  },
  {
    id: '00000000-0000-4000-9000-500000000003',
    name: 'Edinburgh, Scotland',
    origin: 'United Kingdom',
    calcium_ppm: 120,
    bicarbonate_ppm: 225,
    sulfate_ppm: 140,
    chloride_ppm: 20,
    sodium_ppm: 55,
    magnesium_ppm: 25,
    ph: 8,
    notes:
      'Eau écossaise modérément alcaline. Profil équilibré qui favorise ' +
      'les Brown Ales maltées et les Scottish Ales légèrement caramel. ' +
      'Faible amertume du houblon, mise en valeur du malt.',
  },
  {
    id: '00000000-0000-4000-9000-500000000004',
    name: 'Milwaukee, WI',
    origin: 'United States',
    calcium_ppm: 96,
    bicarbonate_ppm: 107,
    sulfate_ppm: 26,
    chloride_ppm: 16,
    sodium_ppm: 7,
    magnesium_ppm: 47,
    ph: 7.5,
    notes:
      'Eau historique de Milwaukee, berceau de la brasserie américaine ' +
      'XIXᵉ (Schlitz, Pabst, Miller). Faible sulfate, calcium modéré : ' +
      'profil parfait pour les Pilsners et lagers américaines pré-' +
      'prohibition.',
  },
  {
    id: '00000000-0000-4000-9000-500000000005',
    name: 'Pilsen, Czech Republic',
    origin: 'Czech Republic',
    calcium_ppm: 7,
    bicarbonate_ppm: 15,
    sulfate_ppm: 5,
    chloride_ppm: 5,
    sodium_ppm: 2,
    magnesium_ppm: 2,
    ph: 8,
    notes:
      'Eau extraordinairement douce de Plzeň, République tchèque. ' +
      'Quasiment minéral-vide (calcium 7 ppm, sulfate 5 ppm). ' +
      'Cette douceur a permis la naissance de la Pilsner Urquell en ' +
      '1842 — couleur pâle dorée et amertume Saaz nette sans astringence.',
  },
  // ─── 5 historical profiles for the demo recipes ────────────────────────
  {
    id: '00000000-0000-4000-9000-500000000006',
    name: 'Munich, Germany',
    origin: 'Germany',
    calcium_ppm: 75,
    bicarbonate_ppm: 152,
    sulfate_ppm: 10,
    chloride_ppm: 2,
    sodium_ppm: 2,
    magnesium_ppm: 18,
    ph: 7.5,
    notes:
      'Eau modérément alcaline de Munich. Le bicarbonate élevé est ' +
      'compensé naturellement par les malts Munich et Vienne ' +
      'légèrement acides. Référence pour Helles, Märzen, Dunkel et ' +
      'Bock — toutes les lagers maltées allemandes.',
  },
  {
    id: '00000000-0000-4000-9000-500000000007',
    name: 'London, UK',
    origin: 'United Kingdom',
    calcium_ppm: 100,
    bicarbonate_ppm: 156,
    sulfate_ppm: 80,
    chloride_ppm: 60,
    sodium_ppm: 12,
    magnesium_ppm: 11,
    ph: 7.5,
    notes:
      'Eau de Londres, équilibre sulfate/chlorure typique des Porters ' +
      'et Brown Ales anglaises historiques. Le bicarbonate élevé est ' +
      'absorbé par les malts torréfiés. Pour ESB, Best Bitter, ' +
      'London Porter, Sweet Stout.',
  },
  {
    id: '00000000-0000-4000-9000-500000000008',
    name: 'Dortmund, Germany',
    origin: 'Germany',
    calcium_ppm: 250,
    bicarbonate_ppm: 180,
    sulfate_ppm: 280,
    chloride_ppm: 100,
    sodium_ppm: 60,
    magnesium_ppm: 23,
    ph: 7.5,
    notes:
      'Eau dure de Dortmund, équilibre ions très élevés. Profil ' +
      'unique au monde qui a engendré le Dortmunder Export — lager ' +
      'pâle plus corsée que la Pilsner, plus sèche que la Helles. ' +
      'Sulfate (280) et chlorure (100) tous deux élevés.',
  },
  {
    id: '00000000-0000-4000-9000-500000000009',
    name: 'Vienna, Austria',
    origin: 'Austria',
    calcium_ppm: 75,
    bicarbonate_ppm: 165,
    sulfate_ppm: 60,
    chloride_ppm: 6,
    sodium_ppm: 8,
    magnesium_ppm: 26,
    ph: 7.4,
    notes:
      'Eau viennoise modérément alcaline. Profil similaire à Munich ' +
      'avec un peu plus de sulfate, qui a engendré la Vienna Lager ' +
      '(Anton Dreher 1841) et le style Märzen. Couleur ambrée, malt ' +
      'légèrement toasté.',
  },
  {
    id: '00000000-0000-4000-9000-50000000000a',
    name: 'Dublin, Ireland',
    origin: 'Ireland',
    calcium_ppm: 118,
    bicarbonate_ppm: 319,
    sulfate_ppm: 54,
    chloride_ppm: 19,
    sodium_ppm: 12,
    magnesium_ppm: 4,
    ph: 7.8,
    notes:
      'Eau dublinoise extrêmement alcaline (bicarbonate 319 ppm). ' +
      "Cette alcalinité explique l'origine de l'Irish Dry Stout : seule " +
      "l'utilisation massive de Roasted Barley et de malt black/" +
      'chocolat acidifie suffisamment le moût pour atteindre un pH de ' +
      'mash correct. Référence Guinness.',
  },
];

/**
 * Result returned by `seedWatersCatalog` for instrumentation /
 * verification. Lets callers (tests, CLI, npm scripts) report what
 * happened without re-querying the DB.
 */
export interface SeedWatersCatalogResult {
  inserted: number;
  updated: number;
  total: number;
}

/**
 * Idempotent loader for the brewing water reference catalogue.
 * Insert if the id is unknown, update in place otherwise.
 * Re-running the loader never duplicates rows.
 */
export async function seedWatersCatalog(
  repository: Repository<WaterOrmEntity>,
  waters: readonly WaterCatalogSeed[] = WATERS_CATALOG_SEED,
): Promise<SeedWatersCatalogResult> {
  let inserted = 0;
  let updated = 0;

  for (const water of waters) {
    const outcome = await idempotentUpsertById(
      repository,
      { id: water.id },
      {
        name: water.name,
        origin: water.origin,
        calcium_ppm: water.calcium_ppm,
        bicarbonate_ppm: water.bicarbonate_ppm,
        sulfate_ppm: water.sulfate_ppm,
        chloride_ppm: water.chloride_ppm,
        sodium_ppm: water.sodium_ppm,
        magnesium_ppm: water.magnesium_ppm,
        ph: water.ph,
        notes: water.notes,
      },
    );
    inserted += outcome.inserted;
    updated += outcome.updated;
  }

  return { inserted, updated, total: inserted + updated };
}
