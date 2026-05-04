import { DistributorOrmEntity } from '../../catalog/distributor/entities/distributor.orm.entity';
import { Repository } from 'typeorm';
import { idempotentUpsertById } from './seed-utils';

/**
 * Seed for the `distributors` reference catalogue (Issue #901).
 * Operator-curated entries — the major homebrew shops every
 * brewer in the EU + US encounters when looking for a
 * boutique link to buy a specific product.
 *
 * **Distributor ≠ Producer**: producers (PR #902) make the
 * product (1:1). Distributors sell it (1:N). The 12 entries
 * below are the boutique-side counterpart to the 17
 * producers shipped on PR #902.
 *
 * Coverage by country (12 entries spanning 5 countries) :
 *   - FR : Saveur Bière, Hopt, Brewferm.fr (3)
 *   - BE : Brouwland, Brewferm.be (2)
 *   - GB : MaltMiller, The Home Brew Shop (2)
 *   - US : Northern Brewer, Brewunited, Williams Brewing (3)
 *   - DE : Brauen.de, Hopfenhof (2)
 *
 * UUID range `00000000-0000-4000-9000-9000-...` reserved for
 * distributors (hops `0`, fermentables `1`, yeasts `2`,
 * styles `3`, mash `4`, waters `5`, equipment `6`, misc `7`,
 * producers `8`, distributors `9`).
 *
 * No junction rows are seeded here — those (e.g. Citra →
 * Brewferm + Hopt + MaltMiller) defer to a follow-up tiny
 * PR or to the BrewDog DIY Dog seed (#780). This PR ships
 * only the reference table itself.
 */

export interface DistributorSeed {
  id: string;
  name: string;
  country: string;
  website: string;
  ships_to: string[];
  currency_default: string;
  notes: string | null;
}

export const DISTRIBUTORS_CATALOG_SEED: readonly DistributorSeed[] = [
  // ─── France ────────────────────────────────────────────────────────
  {
    id: '00000000-0000-4000-9000-900000000000',
    name: 'Saveur Bière',
    country: 'FR',
    website: 'https://www.saveur-biere.com',
    ships_to: ['FR', 'BE', 'LU', 'CH'],
    currency_default: 'EUR',
    notes:
      'Distributeur français généraliste (Wattignies, Nord). Catalogue ' +
      'large : ingrédients, équipement, kits prêts-à-brasser. Souvent ' +
      'le premier réflexe des homebrewers francophones débutants.',
  },
  {
    id: '00000000-0000-4000-9000-900000000001',
    name: 'Hopt',
    country: 'FR',
    website: 'https://www.hopt.fr',
    ships_to: ['FR', 'BE', 'LU', 'CH', 'DE'],
    currency_default: 'EUR',
    notes:
      'Boutique française spécialisée houblons (Lyon). Stocke les ' +
      'variétés trademarkées difficiles à trouver ailleurs en Europe ' +
      '(Citra, Mosaic, Galaxy) et fait la veille sur les nouvelles ' +
      'variétés Yakima Chief.',
  },
  {
    id: '00000000-0000-4000-9000-900000000002',
    name: 'Brewferm France',
    country: 'FR',
    website: 'https://www.brewferm.fr',
    ships_to: ['FR'],
    currency_default: 'EUR',
    notes:
      'Antenne française du belge Brewferm (Brouwland Group). ' +
      'Catalogue identique à la maison-mère mais expédition FR ' +
      'rapide et sans douane.',
  },
  // ─── Belgique ──────────────────────────────────────────────────────
  {
    id: '00000000-0000-4000-9000-900000000003',
    name: 'Brouwland',
    country: 'BE',
    website: 'https://www.brouwland.com',
    ships_to: ['BE', 'NL', 'LU', 'FR', 'DE', 'GB', 'CH'],
    currency_default: 'EUR',
    notes:
      'Distributeur belge historique (Beverlo, fondé 1976). ' +
      "L'un des plus gros catalogues homebrew d'Europe — ingrédients " +
      '+ équipement + kits + propre marque. Référence pour les ' +
      'malts Castle Malting et Best Malz.',
  },
  {
    id: '00000000-0000-4000-9000-900000000004',
    name: 'Brewferm Belgique',
    country: 'BE',
    website: 'https://www.brewferm.be',
    ships_to: ['BE', 'NL', 'LU'],
    currency_default: 'EUR',
    notes:
      'Maison-mère du Brewferm Group. Partage le catalogue Brouwland ' +
      'via accord de groupe ; distinction marketing pour cibler les ' +
      'néerlandophones de Belgique et des Pays-Bas.',
  },
  // ─── Royaume-Uni ───────────────────────────────────────────────────
  {
    id: '00000000-0000-4000-9000-900000000005',
    name: 'The Malt Miller',
    country: 'GB',
    website: 'https://www.themaltmiller.co.uk',
    ships_to: ['GB', 'IE', 'FR', 'BE', 'NL', 'DE'],
    currency_default: 'GBP',
    notes:
      'Boutique britannique de référence (Newbury, Berkshire). ' +
      'Catalogue très large + service de mouture personnalisée ' +
      "(d'où le nom). Apprécié pour ses kits BrewDog officiels et " +
      'ses houblons UK frais (Maris Otter, Golden Promise).',
  },
  {
    id: '00000000-0000-4000-9000-900000000006',
    name: 'The Home Brew Shop',
    country: 'GB',
    website: 'https://www.the-home-brew-shop.co.uk',
    ships_to: ['GB', 'IE'],
    currency_default: 'GBP',
    notes:
      'Boutique britannique généraliste (Farnborough). ' +
      "Grande variété d'extraits liquides et secs (DME/LME) en " +
      "petits formats — pratique pour les recettes d'initiation.",
  },
  // ─── États-Unis ────────────────────────────────────────────────────
  {
    id: '00000000-0000-4000-9000-900000000007',
    name: 'Northern Brewer',
    country: 'US',
    website: 'https://www.northernbrewer.com',
    ships_to: ['US', 'CA'],
    currency_default: 'USD',
    notes:
      'Distributeur américain de référence (Roseville, Minnesota, ' +
      'fondé 1993). Catalogue extrêmement large + kits BrewDog ' +
      'officiels + matériel Anvil + propre ligne de levures ' +
      '(BrewMaster Select).',
  },
  {
    id: '00000000-0000-4000-9000-900000000008',
    name: 'BrewUnited',
    country: 'US',
    website: 'https://brewunited.com',
    ships_to: ['US'],
    currency_default: 'USD',
    notes:
      'Plateforme américaine moderne (web-first) avec un catalogue ' +
      "ingredient-only (pas d'équipement) et un focus sur les " +
      'variétés rares de houblons. Orienté brasseurs avancés.',
  },
  {
    id: '00000000-0000-4000-9000-900000000009',
    name: 'Williams Brewing',
    country: 'US',
    website: 'https://www.williamsbrewing.com',
    ships_to: ['US', 'CA'],
    currency_default: 'USD',
    notes:
      'Distributeur américain historique (San Leandro, Californie, ' +
      "fondé 1979). Spécialiste des kits William's Brewing maison + " +
      'extraits maltés. Sympa pour les premiers brassins extract.',
  },
  // ─── Allemagne ─────────────────────────────────────────────────────
  {
    id: '00000000-0000-4000-9000-90000000000a',
    name: 'Brauen.de',
    country: 'DE',
    website: 'https://www.brauen.de',
    ships_to: ['DE', 'AT', 'CH', 'NL', 'BE'],
    currency_default: 'EUR',
    notes:
      'Boutique allemande de référence (Munich). Catalogue centré ' +
      'sur les malts allemands (Weyermann, Best Malz, Bestmalz) et ' +
      'les levures lager Wyeast/White Labs. Référence pour brasser ' +
      'des Pilsners et Märzens authentiques.',
  },
  {
    id: '00000000-0000-4000-9000-90000000000b',
    name: 'Hopfenhof',
    country: 'DE',
    website: 'https://www.hopfenhof.de',
    ships_to: ['DE', 'AT', 'CH'],
    currency_default: 'EUR',
    notes:
      'Boutique allemande spécialisée houblons (Bavière). Catalogue ' +
      'axé Hallertau et variétés européennes nobles (Tettnang, Saaz, ' +
      'Spalt). Production locale → fraîcheur garantie sur les ' +
      'houblons germano-tchèques.',
  },
];

/**
 * Result returned by `seedDistributorsCatalog` for
 * instrumentation / verification.
 */
export interface SeedDistributorsCatalogResult {
  inserted: number;
  updated: number;
  total: number;
}

/**
 * Idempotent loader for the distributor reference catalogue.
 * Insert if the id is unknown, update in place otherwise.
 * Re-running the loader never duplicates rows.
 *
 * `ships_to` is JSON-encoded application-side before insert
 * (SQLite has no native JSON column).
 */
export async function seedDistributorsCatalog(
  repository: Repository<DistributorOrmEntity>,
  distributors: readonly DistributorSeed[] = DISTRIBUTORS_CATALOG_SEED,
): Promise<SeedDistributorsCatalogResult> {
  let inserted = 0;
  let updated = 0;

  for (const distributor of distributors) {
    const outcome = await idempotentUpsertById(
      repository,
      { id: distributor.id },
      {
        name: distributor.name,
        country: distributor.country,
        website: distributor.website,
        ships_to: JSON.stringify(distributor.ships_to),
        currency_default: distributor.currency_default,
        notes: distributor.notes,
      },
    );
    inserted += outcome.inserted;
    updated += outcome.updated;
  }

  return { inserted, updated, total: inserted + updated };
}
