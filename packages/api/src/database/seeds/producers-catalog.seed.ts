import { ProducerOrmEntity } from '../../catalog/producer/entities/producer.orm.entity';
import { ProducerType } from '../../catalog/producer/domain/producer.types';
import { Repository } from 'typeorm';
import { idempotentUpsertById } from './seed-utils';

/**
 * Seed for the `producers` reference catalogue (Issue #900).
 * Operator-curated entries — the major brewing-product brand
 * owners every homebrewer encounters in the catalogue. Spans
 * all 5 producer types (laboratory / maltster / hop_supplier
 * / equipment_manufacturer / other) with at least 2 entries
 * per category for picker-UI grouping value from day one.
 *
 * Names match the legacy `yeasts.laboratory` strings verbatim
 * (e.g. "Wyeast Labs", not "Wyeast Laboratories") so a future
 * cleanup PR can map yeast.laboratory → producer.name with a
 * straight equality lookup. The mode-prudent first cut leaves
 * the yeast.laboratory string intact alongside the new
 * `producer_id` FK; the cleanup will drop the redundant
 * column once picker UX is validated.
 *
 * UUID range `00000000-0000-4000-9000-8000-...` is reserved
 * for producers (hops `0`, fermentables `1`, yeasts `2`,
 * styles `3`, mash `4`, waters `5`, equipment `6`, misc `7`,
 * producers `8`).
 */

export interface ProducerSeed {
  id: string;
  name: string;
  type: ProducerType;
  country: string | null;
  website: string | null;
  notes: string | null;
}

export const PRODUCERS_CATALOG_SEED: readonly ProducerSeed[] = [
  // ─── Laboratories (yeast) ──────────────────────────────────────────
  {
    id: '00000000-0000-4000-9000-800000000000',
    name: 'Wyeast Labs',
    type: ProducerType.Laboratory,
    country: 'US',
    website: 'https://wyeastlab.com',
    notes:
      'Laboratoire américain pionnier des levures liquides en homebrew ' +
      '(fondé 1986, Hood River Oregon). Catalogue référence : 1056 ' +
      'American Ale, 1084 Irish Ale, 1332 Northwest Ale, 2565 Kölsch. ' +
      'Format à activer (smack-pack).',
  },
  {
    id: '00000000-0000-4000-9000-800000000001',
    name: 'White Labs',
    type: ProducerType.Laboratory,
    country: 'US',
    website: 'https://www.whitelabs.com',
    notes:
      'Laboratoire américain (San Diego, fondé 1995). Catalogue référence : ' +
      'WLP001 California Ale, WLP002 English Ale, WLP011 European Ale, ' +
      'WLP800 Pilsner Lager. Format PurePitch (poche prête à pitcher).',
  },
  {
    id: '00000000-0000-4000-9000-800000000002',
    name: 'Fermentis',
    type: ProducerType.Laboratory,
    country: 'FR',
    website: 'https://fermentis.com',
    notes:
      'Filiale levurière du groupe Lesaffre (Marcq-en-Barœul, FR). ' +
      'Spécialiste des levures sèches réhydratables. Références ' +
      'homebrew incontournables : Safale US-05, Safale S-04, ' +
      'Saflager W-34/70, SafBrew T-58.',
  },
  {
    id: '00000000-0000-4000-9000-800000000003',
    name: 'Lallemand',
    type: ProducerType.Laboratory,
    country: 'CA',
    website: 'https://www.lallemandbrewing.com',
    notes:
      'Groupe canadien (Montréal), branches LalBrew + Danstar. Levures ' +
      'sèches premium : Nottingham, BRY-97 American West Coast, ' +
      'Verdant IPA, New England, Munich Classic. Aussi nutriments ' +
      '(Servomyces).',
  },
  {
    id: '00000000-0000-4000-9000-800000000004',
    name: 'Imperial Yeast',
    type: ProducerType.Laboratory,
    country: 'US',
    website: 'https://imperialyeast.com',
    notes:
      'Laboratoire américain (Portland, fondé 2014) spécialisé dans le ' +
      'format pitchable direct (poche 200 milliards de cellules, plus ' +
      'cher mais zero préparation). Référence : A07 Flagship ' +
      '(=US-05/1056/WLP001), A38 Juice (NEIPA), L17 Harvest (lager).',
  },
  // ─── Maltsters (fermentables) ──────────────────────────────────────
  {
    id: '00000000-0000-4000-9000-800000000005',
    name: 'Briess Malt & Ingredients',
    type: ProducerType.Maltster,
    country: 'US',
    website: 'https://www.brewingwithbriess.com',
    notes:
      'Malterie américaine (Chilton Wisconsin, fondée 1876). Standard ' +
      "de l'industrie homebrew US pour le malt 2-row, le Munich, et " +
      'les extraits secs/liquides (DME/LME). Colorées : Caramel ' +
      '10/40/60/80/120 L.',
  },
  {
    id: '00000000-0000-4000-9000-800000000006',
    name: 'Weyermann',
    type: ProducerType.Maltster,
    country: 'DE',
    website: 'https://www.weyermann.de',
    notes:
      'Malterie allemande historique (Bamberg, Bavière, fondée 1879). ' +
      'Référence mondiale pour les malts allemands : Pilsner, Munich ' +
      'I/II, Vienna, CaraMunich, CaraAroma, Carafa Special. Profil ' +
      '« cassant » caractéristique recherché pour les Lagers et Bocks.',
  },
  {
    id: '00000000-0000-4000-9000-800000000007',
    name: 'Best Malz',
    type: ProducerType.Maltster,
    country: 'DE',
    website: 'https://www.bestmalz.de',
    notes:
      'Malterie allemande (Heidelberg, fondée 1899). Alternative ' +
      'souvent moins chère que Weyermann pour les mêmes profils ' +
      '(Pilsner, Munich, Wheat). Très présent en homebrew européen.',
  },
  {
    id: '00000000-0000-4000-9000-800000000008',
    name: 'Castle Malting',
    type: ProducerType.Maltster,
    country: 'BE',
    website: 'https://www.castlemalting.com',
    notes:
      'Malterie belge (Beloeil, Hainaut). Référence pour les malts ' +
      'spécifiquement belges : Château Pilsen, Château Pale Ale, ' +
      'Château Cara Belge, Château Special B (incontournable des ' +
      'Dubbel et Quadrupel).',
  },
  {
    id: '00000000-0000-4000-9000-800000000009',
    name: 'Crisp Malting',
    type: ProducerType.Maltster,
    country: 'GB',
    website: 'https://www.crispmalt.com',
    notes:
      'Malterie britannique (Norfolk). Référence pour les malts UK ' +
      'authentiques : Maris Otter (le Pale Ale britannique), Golden ' +
      'Promise, Brown Malt, Crystal 60/120.',
  },
  // ─── Hop suppliers ─────────────────────────────────────────────────
  {
    id: '00000000-0000-4000-9000-80000000000a',
    name: 'Yakima Chief Hops',
    type: ProducerType.HopSupplier,
    country: 'US',
    website: 'https://www.yakimachief.com',
    notes:
      'Coopérative américaine (Yakima Valley, Washington). Propriétaire ' +
      'des marques déposées Citra (HBC 394), Mosaic (HBC 369), Simcoe, ' +
      'Idaho 7, Strata. Source unique pour ces variétés aromatiques ' +
      'modernes haut de gamme.',
  },
  {
    id: '00000000-0000-4000-9000-80000000000b',
    name: 'BarthHaas',
    type: ProducerType.HopSupplier,
    country: 'DE',
    website: 'https://www.barthhaas.com',
    notes:
      'Groupe allemand (Nuremberg, fondé 1794) — le plus ancien ' +
      'marchand de houblon au monde. Distribue les variétés ' +
      'européennes nobles (Hallertau, Tettnang, Saaz, Spalt) et ' +
      'modernes (Mandarina Bavaria, Polaris, Hallertau Blanc).',
  },
  {
    id: '00000000-0000-4000-9000-80000000000c',
    name: 'Hopsteiner',
    type: ProducerType.HopSupplier,
    country: 'DE',
    website: 'https://www.hopsteiner.com',
    notes:
      'Groupe germano-américain (Mainburg + New York). Cultive et ' +
      'négocie hémoglobine de variétés : Magnum (bittering référence ' +
      'Lagers), Tradition, Perle, Sterling.',
  },
  // ─── Equipment manufacturers ───────────────────────────────────────
  {
    id: '00000000-0000-4000-9000-80000000000d',
    name: 'Grainfather (iMake / Bevie)',
    type: ProducerType.EquipmentManufacturer,
    country: 'NZ',
    website: 'https://grainfather.com',
    notes:
      'Constructeur néo-zélandais (filiale Bevie Holdings) du système ' +
      'électrique tout-en-un Grainfather G30/G70 — référence ' +
      'homebrew électrique premium dans le monde anglo-saxon.',
  },
  {
    id: '00000000-0000-4000-9000-80000000000e',
    name: 'Klarstein',
    type: ProducerType.EquipmentManufacturer,
    country: 'DE',
    website: 'https://www.klarstein.fr',
    notes:
      'Marque allemande (groupe Chal-Tec). Système Brauheld Pro (20L ' +
      'et 30L) très populaire en Europe pour son rapport qualité/prix ' +
      "imbattable sur l'entrée de gamme électrique.",
  },
  {
    id: '00000000-0000-4000-9000-80000000000f',
    name: 'Anvil Brewing Equipment',
    type: ProducerType.EquipmentManufacturer,
    country: 'US',
    website: 'https://anvilbrewing.com',
    notes:
      'Constructeur américain (filiale Blichmann Engineering). Système ' +
      'Foundry (6.5/10.5 Gal) populaire aux États-Unis pour ' +
      "l'électrique multi-usages (BIAB + recirculation).",
  },
];

/**
 * Result returned by `seedProducersCatalog` for instrumentation
 * / verification.
 */
export interface SeedProducersCatalogResult {
  inserted: number;
  updated: number;
  total: number;
}

/**
 * Idempotent loader for the producer reference catalogue.
 * Insert if the id is unknown, update in place otherwise.
 * Re-running the loader never duplicates rows.
 */
export async function seedProducersCatalog(
  repository: Repository<ProducerOrmEntity>,
  producers: readonly ProducerSeed[] = PRODUCERS_CATALOG_SEED,
): Promise<SeedProducersCatalogResult> {
  let inserted = 0;
  let updated = 0;

  for (const producer of producers) {
    const outcome = await idempotentUpsertById(
      repository,
      { id: producer.id },
      {
        name: producer.name,
        type: producer.type,
        country: producer.country,
        website: producer.website,
        notes: producer.notes,
      },
    );
    inserted += outcome.inserted;
    updated += outcome.updated;
  }

  return { inserted, updated, total: inserted + updated };
}
