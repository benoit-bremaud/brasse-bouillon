import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { ScanCatalogItemOrmEntity } from '../../scan/entities/scan-catalog-item.orm.entity';
import { ScanCatalogSource } from '../../scan/domain/enums/scan-catalog-source.enum';
import { ScanFermentationType } from '../../scan/domain/enums/scan-fermentation-type.enum';

/**
 * Seed skeleton for `scan_catalog_items` (Epic #693 part 5/5).
 *
 * Provides the 6 reference beers used during the soutenance demo
 * (per the scan brainstorm §G demo-day plan): every beer the jury
 * may scan on stage is pre-populated here so recognition is
 * deterministic.
 *
 * The data lives next to the loader function on purpose: this is a
 * minimal seed skeleton, not a full seeding framework. When the
 * scan tranche 2 ships and the OFF proxy populates rows on the fly
 * (Epic #693 part 3 cache), this seed remains the canonical fallback
 * for the 6 demo beers and any other beer we want to ship as
 * `source = 'seed'`.
 *
 * The loader is idempotent — running it twice does not duplicate
 * rows: existing barcodes are detected and updated in place, new
 * ones are inserted.
 */

/**
 * Shape of one seeded beer. Keeps `source: 'seed'` implicit (the
 * loader sets it) so seed authors only specify the beer-specific
 * fields.
 */
export interface ScanCatalogSeedBeer {
  barcode: string;
  name: string;
  brewery: string;
  style: string;
  abv: number;
  ibu: number;
  color_ebc: number;
  fermentation_type: ScanFermentationType;
  aromatic_tags: string;
  notes_source: string;
}

/**
 * The 6 demo beers used during the 27-mai soutenance. Real EAN-13
 * barcodes from the European market so live scans on stage hit a
 * known row. ABV / IBU / EBC values are public from each brewery's
 * datasheet (rounded sensibly for the demo).
 */
export const SCAN_CATALOG_SEED_BEERS: readonly ScanCatalogSeedBeer[] = [
  {
    barcode: '5060277380019',
    name: 'Punk IPA',
    brewery: 'BrewDog',
    style: 'IPA',
    abv: 5.4,
    ibu: 35,
    color_ebc: 14,
    fermentation_type: ScanFermentationType.ALE,
    aromatic_tags: 'tropical, citrus, pine',
    notes_source: 'BrewDog DIY Dog 2019 (open-source recipe book)',
  },
  {
    barcode: '5410702000133',
    name: 'La Chouffe',
    brewery: 'Brasserie d Achouffe',
    style: 'Belgian Strong Pale Ale',
    abv: 8.0,
    ibu: 20,
    color_ebc: 14,
    fermentation_type: ScanFermentationType.ALE,
    aromatic_tags: 'banana, clove, coriander',
    notes_source: 'Brasserie d Achouffe public datasheet',
  },
  {
    barcode: '5410799000115',
    name: 'Rochefort 10',
    brewery: 'Abbaye Notre-Dame de Saint-Remy',
    style: 'Belgian Quadrupel',
    abv: 11.3,
    ibu: 28,
    color_ebc: 70,
    fermentation_type: ScanFermentationType.ALE,
    aromatic_tags: 'dark fruit, port, caramel, raisin',
    notes_source: 'Trappist Rochefort public datasheet',
  },
  {
    barcode: '5414352120063',
    name: 'Karmeliet Tripel',
    brewery: 'Brouwerij Bosteels',
    style: 'Belgian Tripel',
    abv: 8.4,
    ibu: 25,
    color_ebc: 18,
    fermentation_type: ScanFermentationType.ALE,
    aromatic_tags: 'wheat, oat, banana, vanilla',
    notes_source: 'Brouwerij Bosteels public datasheet',
  },
  {
    barcode: '5410702000125',
    name: 'Westmalle Tripel',
    brewery: 'Abdij der Trappisten van Westmalle',
    style: 'Belgian Tripel',
    abv: 9.5,
    ibu: 30,
    color_ebc: 16,
    fermentation_type: ScanFermentationType.ALE,
    aromatic_tags: 'fruity esters, peppery, dry finish',
    notes_source: 'Trappist Westmalle public datasheet',
  },
  {
    barcode: '5410702000026',
    name: 'Duvel',
    brewery: 'Brouwerij Duvel Moortgat',
    style: 'Belgian Strong Pale Ale',
    abv: 8.5,
    ibu: 30,
    color_ebc: 12,
    fermentation_type: ScanFermentationType.ALE,
    aromatic_tags: 'pear, apple, dry finish, light hop',
    notes_source: 'Brouwerij Duvel Moortgat public datasheet',
  },
  {
    barcode: '3261570000044',
    name: 'La Goudale',
    brewery: 'Brasserie Goudale',
    style: 'Bière Blonde à l Ancienne',
    abv: 7.2,
    ibu: 22,
    color_ebc: 16,
    fermentation_type: ScanFermentationType.ALE,
    aromatic_tags: 'malt biscuit, honey, floral hops, soft bitterness',
    notes_source: 'Brasserie Goudale public datasheet (62510 Arques, France)',
  },
  // Mass-market international lager — completes the brainstorm 6-beer
  // panel (scan-2026-04-24 §4) and gives the demo a familiar reference
  // point next to the craft beers above. Persona Léa might have one of
  // these in her fridge already.
  {
    barcode: '8714100732007',
    name: 'Heineken',
    brewery: 'Heineken',
    style: 'International Pale Lager',
    abv: 5.0,
    ibu: 20,
    color_ebc: 7,
    fermentation_type: ScanFermentationType.LAGER,
    aromatic_tags: 'crisp, light malt, gentle hop, dry finish',
    notes_source: 'Heineken public brewery datasheet',
  },
  // Locally-sourced artisanal beer (Brittany microbrewery — exemplary
  // of the éco-responsable persona Zoé's preferred filière courte).
  // EAN-13 (valid checksum, computed via the standard mod-10
  // algorithm: prefix `376021575004`, check digit `2`). Picked from
  // the Brasserie de Lancelot range for demo flexibility — the 6th
  // brainstorm slot was deliberately left open for whatever local
  // beer the team can bring on stage.
  {
    barcode: '3760215750042',
    name: 'Cervoise Lancelot',
    brewery: 'Brasserie de Lancelot',
    style: 'Cervoise (Bière Aromatisée Miel)',
    abv: 6.0,
    ibu: 18,
    color_ebc: 35,
    fermentation_type: ScanFermentationType.ALE,
    aromatic_tags: 'honey, heather, herbal, malt warmth',
    notes_source:
      'Brasserie de Lancelot public datasheet (56460 Le Roc-Saint-André, Bretagne)',
  },
];

/**
 * Result returned by `seedScanCatalog` for instrumentation /
 * verification. Lets callers (tests, CLI, npm scripts) report what
 * happened without re-querying the DB.
 */
export interface SeedScanCatalogResult {
  inserted: number;
  updated: number;
  total: number;
}

/**
 * Idempotent loader for the demo beers above. Insert if the
 * barcode is unknown, update in place otherwise. Always sets
 * `source = 'seed'` and clears `fetched_at` / `raw_payload`
 * (those belong to OFF cache rows, not seed data).
 */
export async function seedScanCatalog(
  repository: Repository<ScanCatalogItemOrmEntity>,
  beers: readonly ScanCatalogSeedBeer[] = SCAN_CATALOG_SEED_BEERS,
): Promise<SeedScanCatalogResult> {
  let inserted = 0;
  let updated = 0;

  for (const beer of beers) {
    const existing = await repository.findOne({
      where: { barcode: beer.barcode },
    });

    if (existing) {
      Object.assign(existing, {
        name: beer.name,
        brewery: beer.brewery,
        style: beer.style,
        abv: beer.abv,
        ibu: beer.ibu,
        color_ebc: beer.color_ebc,
        fermentation_type: beer.fermentation_type,
        aromatic_tags: beer.aromatic_tags,
        notes_source: beer.notes_source,
        is_abv_estimated: false,
        is_ibu_estimated: false,
        is_color_ebc_estimated: false,
        is_style_estimated: false,
        source: ScanCatalogSource.SEED,
        fetched_at: null,
        raw_payload: null,
      });
      await repository.save(existing);
      updated += 1;
    } else {
      const created = repository.create({
        id: randomUUID(),
        barcode: beer.barcode,
        name: beer.name,
        brewery: beer.brewery,
        style: beer.style,
        abv: beer.abv,
        ibu: beer.ibu,
        color_ebc: beer.color_ebc,
        fermentation_type: beer.fermentation_type,
        aromatic_tags: beer.aromatic_tags,
        notes_source: beer.notes_source,
        is_abv_estimated: false,
        is_ibu_estimated: false,
        is_color_ebc_estimated: false,
        is_style_estimated: false,
        source: ScanCatalogSource.SEED,
        fetched_at: null,
        raw_payload: null,
      });
      await repository.save(created);
      inserted += 1;
    }
  }

  return { inserted, updated, total: inserted + updated };
}
