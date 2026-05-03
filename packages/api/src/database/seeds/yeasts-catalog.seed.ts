import { Repository } from 'typeorm';

import { YeastFlocculation } from '../../catalog/yeast/domain/enums/yeast-flocculation.enum';
import { YeastForm } from '../../catalog/yeast/domain/enums/yeast-form.enum';
import { YeastOrmEntity } from '../../catalog/yeast/entities/yeast.orm.entity';
import { YeastType } from '../../catalog/yeast/domain/enums/yeast-type.enum';
import { idempotentUpsertById } from './seed-utils';

/**
 * Seed for the `yeasts` reference catalogue (Issue #708 / #869,
 * Phase 1 PR #3, completing the trio Hop / Fermentable / Yeast).
 * Operator-curated entries — drawn from the BeerXML 1.0 reference
 * fixture (`docs/architecture/specs/fixtures/libraries/yeast.xml`,
 * 5 entries) and from major manufacturer datasheets (White Labs,
 * Wyeast Labs, Fermentis, Imperial Yeast, Lallemand), but
 * deliberately not a verbatim copy of either source. Each row is
 * authored to be picker-friendly with French notes matching the
 * convention of `PUBLIC_RECIPES_SEED.description`,
 * `HOPS_CATALOG_SEED` and `FERMENTABLES_CATALOG_SEED`.
 *
 * The 20 entries are split:
 *   • 5 BeerXML canonical (English Ale WLP002, European Ale
 *     WLP011, Irish Ale Wyeast 1084, Kölsch Wyeast 2565,
 *     Northwest Ale Wyeast 1332) — the ones in
 *     `libraries/yeast.xml`.
 *   • 15 popular industry products needed by the demo recipes
 *     (Punk IPA, NEIPA, Saison, Belgian Tripel, Witbier,
 *     Hefeweizen, Pilsner, ESB, Irish Stout) and the broader
 *     homebrew vocabulary.
 *
 * UUID range `00000000-0000-4000-9000-…` is shared with the hop
 * and fermentable catalogues. Yeasts use a distinct second-segment
 * range (`…-9000-2000-…`) to avoid collision (hops use `0`,
 * fermentables use `1`, yeasts use `2`).
 */

export interface YeastCatalogSeed {
  id: string;
  name: string;
  type: YeastType;
  form: YeastForm;
  producer_id: string | null;
  product_code: string | null;
  min_temperature_c: number | null;
  max_temperature_c: number | null;
  flocculation: YeastFlocculation | null;
  attenuation_percent_typical: number | null;
  notes: string | null;
}

export const YEASTS_CATALOG_SEED: readonly YeastCatalogSeed[] = [
  // ─── 5 BeerXML canonical entries (libraries/yeast.xml) ──────────────────
  {
    id: '00000000-0000-4000-9000-200000000001',
    name: 'English Ale (WLP002)',
    type: YeastType.ALE,
    form: YeastForm.LIQUID,
    producer_id: '00000000-0000-4000-9000-800000000001',
    product_code: 'WLP002',
    min_temperature_c: 18.3,
    max_temperature_c: 20,
    flocculation: YeastFlocculation.VERY_HIGH,
    attenuation_percent_typical: 66.5,
    notes:
      'Souche ESB classique, idéale pour les milds, bitters, ' +
      'porters et stouts anglais. Floculation très élevée laissant ' +
      'une bière claire avec une douceur résiduelle. Atténuation ' +
      'modérée caractéristique du style.',
  },
  {
    id: '00000000-0000-4000-9000-200000000002',
    name: 'European Ale (WLP011)',
    type: YeastType.ALE,
    form: YeastForm.LIQUID,
    producer_id: '00000000-0000-4000-9000-800000000001',
    product_code: 'WLP011',
    min_temperature_c: 18.3,
    max_temperature_c: 21.1,
    flocculation: YeastFlocculation.MEDIUM,
    attenuation_percent_typical: 67.5,
    notes:
      "Levure ale du nord de l'Europe, profil malté. Faible " +
      "production d'esters et de soufre, finition propre. " +
      'Atténuation basse contribuant à un goût malté prononcé. ' +
      'Pour Alt, Kölsch, English Ales maltés et fruit beers.',
  },
  {
    id: '00000000-0000-4000-9000-200000000003',
    name: 'Irish Ale (Wyeast 1084)',
    type: YeastType.ALE,
    form: YeastForm.LIQUID,
    producer_id: '00000000-0000-4000-9000-800000000000',
    product_code: '1084',
    min_temperature_c: 16.7,
    max_temperature_c: 22.2,
    flocculation: YeastFlocculation.MEDIUM,
    attenuation_percent_typical: 73,
    notes:
      'Levure Irish Stout par excellence. Profil sec et fruité ' +
      'caractéristique des stouts. Corps plein, finition sèche et ' +
      'propre. Pour Irish Dry Stout, Porter, Scottish Ale, Brown ' +
      'Ale, Imperial Stout, Barley Wine.',
  },
  {
    id: '00000000-0000-4000-9000-200000000004',
    name: 'Kölsch (Wyeast 2565)',
    type: YeastType.ALE,
    form: YeastForm.LIQUID,
    producer_id: '00000000-0000-4000-9000-800000000000',
    product_code: '2565',
    min_temperature_c: 13.3,
    max_temperature_c: 17.8,
    flocculation: YeastFlocculation.LOW,
    attenuation_percent_typical: 75,
    notes:
      'Levure hybride du style Kölsch (Cologne). Caractère malté ' +
      "avec un mélange d'esters de levure ale et de propreté de " +
      'lager. Finition croustillante et nette. Pour Kölsch et ' +
      'European Ales légères.',
  },
  {
    id: '00000000-0000-4000-9000-200000000005',
    name: 'Northwest Ale (Wyeast 1332)',
    type: YeastType.ALE,
    form: YeastForm.LIQUID,
    producer_id: '00000000-0000-4000-9000-800000000000',
    product_code: '1332',
    min_temperature_c: 18.3,
    max_temperature_c: 23.9,
    flocculation: YeastFlocculation.HIGH,
    attenuation_percent_typical: 69,
    notes:
      'Levure ale classique du nord-ouest US. Léger profil ' +
      'fruité, bière maltée avec un bon corps et un bel équilibre. ' +
      'Référence pour les Oregon Ales et les styles American Ale.',
  },
  // ─── 15 popular industry products for the demo recipes ───────────────────
  {
    id: '00000000-0000-4000-9000-200000000006',
    name: 'Safale US-05',
    type: YeastType.ALE,
    form: YeastForm.DRY,
    producer_id: '00000000-0000-4000-9000-800000000002',
    product_code: 'US-05',
    min_temperature_c: 15,
    max_temperature_c: 22,
    flocculation: YeastFlocculation.MEDIUM,
    attenuation_percent_typical: 81,
    notes:
      'Levure sèche neutre par excellence. Profil propre, ' +
      "légèrement fruité, laissant le houblon s'exprimer. " +
      'Standard absolu pour American Pale Ale, IPA, NEIPA, et ' +
      'la Punk IPA. Réhydratation recommandée.',
  },
  {
    id: '00000000-0000-4000-9000-200000000007',
    name: 'Safale S-04',
    type: YeastType.ALE,
    form: YeastForm.DRY,
    producer_id: '00000000-0000-4000-9000-800000000002',
    product_code: 'S-04',
    min_temperature_c: 15,
    max_temperature_c: 20,
    flocculation: YeastFlocculation.HIGH,
    attenuation_percent_typical: 75,
    notes:
      'Levure sèche anglaise polyvalente. Floculation rapide ' +
      'donnant une bière claire en quelques jours. Profil malté ' +
      'discret, légères notes fruitées. Pour ESB, Bitter, Brown ' +
      'Ale, Porter britanniques.',
  },
  {
    id: '00000000-0000-4000-9000-200000000008',
    name: 'Saflager W-34/70',
    type: YeastType.LAGER,
    form: YeastForm.DRY,
    producer_id: '00000000-0000-4000-9000-800000000002',
    product_code: 'W-34/70',
    min_temperature_c: 9,
    max_temperature_c: 15,
    flocculation: YeastFlocculation.HIGH,
    attenuation_percent_typical: 83,
    notes:
      'Souche lager universelle de Weihenstephan, en version ' +
      'sèche. Profil neutre et propre, fermentation à froid (12°C ' +
      'idéal). Pour Pilsner, Helles, Märzen, lagers continentales.',
  },
  {
    id: '00000000-0000-4000-9000-200000000009',
    name: 'California Ale (WLP001)',
    type: YeastType.ALE,
    form: YeastForm.LIQUID,
    producer_id: '00000000-0000-4000-9000-800000000001',
    product_code: 'WLP001',
    min_temperature_c: 20,
    max_temperature_c: 22.8,
    flocculation: YeastFlocculation.MEDIUM,
    attenuation_percent_typical: 76.5,
    notes:
      'Souche American Pale Ale classique (équivalent Chico de ' +
      'Sierra Nevada). Profil propre, légèrement fruité, accentue ' +
      'le houblon. Pour American Pale, IPA, Imperial IPA et ' +
      'recettes orientées houblon.',
  },
  {
    id: '00000000-0000-4000-9000-20000000000a',
    name: 'American Ale (Wyeast 1056)',
    type: YeastType.ALE,
    form: YeastForm.LIQUID,
    producer_id: '00000000-0000-4000-9000-800000000000',
    product_code: '1056',
    min_temperature_c: 15.6,
    max_temperature_c: 22.2,
    flocculation: YeastFlocculation.MEDIUM,
    attenuation_percent_typical: 75,
    notes:
      'Souche American Pale Ale équivalente WLP001 (toutes deux ' +
      'descendant de la Chico). Très neutre, fruitée discrète. ' +
      'Pour APA, IPA, Imperial Stout, recettes house.',
  },
  {
    id: '00000000-0000-4000-9000-20000000000b',
    name: 'Trappist High Gravity (Wyeast 3787)',
    type: YeastType.ALE,
    form: YeastForm.LIQUID,
    producer_id: '00000000-0000-4000-9000-800000000000',
    product_code: '3787',
    min_temperature_c: 18.3,
    max_temperature_c: 25,
    flocculation: YeastFlocculation.MEDIUM,
    attenuation_percent_typical: 77.5,
    notes:
      'Souche Trappiste tolérante aux hautes densités. Profil ' +
      'phénolique-fruité (poire, pomme, clou de girofle). ' +
      'Indispensable pour Belgian Tripel, Belgian Dark Strong ' +
      'Ale, Quadrupel.',
  },
  {
    id: '00000000-0000-4000-9000-20000000000c',
    name: 'Trappist Ale (WLP500)',
    type: YeastType.ALE,
    form: YeastForm.LIQUID,
    producer_id: '00000000-0000-4000-9000-800000000001',
    product_code: 'WLP500',
    min_temperature_c: 18.3,
    max_temperature_c: 23.9,
    flocculation: YeastFlocculation.MEDIUM,
    attenuation_percent_typical: 76,
    notes:
      "Souche Trappiste de l'abbaye de Chimay. Profil " +
      'phénolique discret, fruité (banane, poire), épicé. Pour ' +
      'Belgian Strong Golden Ale, Dubbel, Tripel.',
  },
  {
    id: '00000000-0000-4000-9000-20000000000d',
    name: 'French Saison (Wyeast 3711)',
    type: YeastType.ALE,
    form: YeastForm.LIQUID,
    producer_id: '00000000-0000-4000-9000-800000000000',
    product_code: '3711',
    min_temperature_c: 18.3,
    max_temperature_c: 26.7,
    flocculation: YeastFlocculation.LOW,
    attenuation_percent_typical: 81,
    notes:
      'Souche Saison française. Atténuation très élevée donnant ' +
      'une bière sèche et croustillante. Profil épicé, poivré, ' +
      'agrumes. Tolère la haute température sans phénols off. ' +
      'Pour Saison, Farmhouse Ale.',
  },
  {
    id: '00000000-0000-4000-9000-20000000000e',
    name: 'Belgian Wit II (WLP410)',
    // Tagged WHEAT (not ALE) per the catalogue rationale: the
    // WHEAT category exists specifically to cover Witbier and
    // Hefeweizen strains, so a `?type=wheat` query must surface
    // both Wyeast 3068 (Hefeweizen) and WLP410 (Witbier).
    type: YeastType.WHEAT,
    form: YeastForm.LIQUID,
    producer_id: '00000000-0000-4000-9000-800000000001',
    product_code: 'WLP410',
    min_temperature_c: 19.4,
    max_temperature_c: 22.8,
    flocculation: YeastFlocculation.LOW,
    attenuation_percent_typical: 75,
    notes:
      'Souche belge Witbier moins phénolique que la WLP400. ' +
      'Notes plus fruitées, légèrement épicées. Profil trouble ' +
      'caractéristique. Pour Witbier, White Ale, fruit-infused ' +
      'Belgian Pale.',
  },
  {
    id: '00000000-0000-4000-9000-20000000000f',
    name: 'Weihenstephan Weizen (Wyeast 3068)',
    type: YeastType.WHEAT,
    form: YeastForm.LIQUID,
    producer_id: '00000000-0000-4000-9000-800000000000',
    product_code: '3068',
    min_temperature_c: 17.8,
    max_temperature_c: 22.8,
    flocculation: YeastFlocculation.LOW,
    attenuation_percent_typical: 75.5,
    notes:
      'Souche Hefeweizen mythique de Weihenstephan (la plus ' +
      'ancienne brasserie au monde). Profil banane (acétate ' +
      "d'isoamyle) + clou de girofle (4-vinyl guaïacol) " +
      'classique. Bière trouble par défaut. Pour Hefeweizen, ' +
      'Dunkelweizen, Weizenbock.',
  },
  {
    id: '00000000-0000-4000-9000-200000000010',
    name: 'Pilsner Lager (WLP800)',
    type: YeastType.LAGER,
    form: YeastForm.LIQUID,
    producer_id: '00000000-0000-4000-9000-800000000001',
    product_code: 'WLP800',
    min_temperature_c: 10,
    max_temperature_c: 12.8,
    flocculation: YeastFlocculation.MEDIUM,
    attenuation_percent_typical: 75,
    notes:
      "Souche Pilsner d'origine tchèque. Profil légèrement " +
      'fruité au début de la fermentation, propre après lagering. ' +
      'Idéale pour Bohemian Pilsner (Pilsner Urquell-style), ' +
      'Czech Premium Pale Lager.',
  },
  {
    id: '00000000-0000-4000-9000-200000000011',
    name: 'London Ale III (Wyeast 1318)',
    type: YeastType.ALE,
    form: YeastForm.LIQUID,
    producer_id: '00000000-0000-4000-9000-800000000000',
    product_code: '1318',
    min_temperature_c: 18.3,
    max_temperature_c: 22.8,
    flocculation: YeastFlocculation.LOW,
    attenuation_percent_typical: 73,
    notes:
      'Souche NEIPA par excellence (originellement London Ale). ' +
      'Profil très fruité (esters tropicaux, agrumes), faible ' +
      'floculation laissant la bière trouble (haze). Pour NEIPA, ' +
      'Hazy IPA, English Mild moderne.',
  },
  {
    id: '00000000-0000-4000-9000-200000000012',
    name: 'Irish Ale (WLP004)',
    type: YeastType.ALE,
    form: YeastForm.LIQUID,
    producer_id: '00000000-0000-4000-9000-800000000001',
    product_code: 'WLP004',
    min_temperature_c: 18.3,
    max_temperature_c: 20,
    flocculation: YeastFlocculation.MEDIUM,
    attenuation_percent_typical: 71,
    notes:
      'Souche Irish Stout (équivalent Wyeast 1084 chez White ' +
      'Labs). Profil propre, légèrement aigre-fruité. Pour Irish ' +
      'Dry Stout, Irish Red Ale, Sweet Stout.',
  },
  {
    id: '00000000-0000-4000-9000-200000000013',
    name: 'BRY-97 American West Coast',
    type: YeastType.ALE,
    form: YeastForm.DRY,
    producer_id: '00000000-0000-4000-9000-800000000003',
    product_code: 'BRY-97',
    min_temperature_c: 15,
    max_temperature_c: 22,
    flocculation: YeastFlocculation.HIGH,
    attenuation_percent_typical: 81,
    notes:
      'Alternative sèche à US-05 développée par Lallemand. ' +
      'Profil propre type West Coast, floculation plus rapide ' +
      'que US-05. Pour American Pale Ale, West Coast IPA. ' +
      'Démarrage plus lent — patience au jour 1.',
  },
  {
    id: '00000000-0000-4000-9000-200000000014',
    name: 'Pub (Imperial A09)',
    type: YeastType.ALE,
    form: YeastForm.LIQUID,
    producer_id: '00000000-0000-4000-9000-800000000004',
    product_code: 'A09',
    min_temperature_c: 18.3,
    max_temperature_c: 22.2,
    flocculation: YeastFlocculation.MEDIUM,
    attenuation_percent_typical: 76,
    notes:
      'Souche Imperial Yeast équivalente à WLP001 / Wyeast 1056 ' +
      '(la Chico moderne). Profil propre, accentue le houblon. ' +
      'Densité cellulaire Imperial typiquement supérieure : ' +
      "pas de starter nécessaire jusqu'à 1.060.",
  },
];

/**
 * Result returned by `seedYeastsCatalog` for instrumentation /
 * verification. Lets callers (tests, CLI, npm scripts) report what
 * happened without re-querying the DB.
 */
export interface SeedYeastsCatalogResult {
  inserted: number;
  updated: number;
  total: number;
}

/**
 * Idempotent loader for the yeast reference catalogue. Insert if
 * the id is unknown, update in place otherwise. Re-running the
 * loader never duplicates rows — see `idempotentUpsertById` for
 * the shared upsert pattern.
 */
export async function seedYeastsCatalog(
  repository: Repository<YeastOrmEntity>,
  yeasts: readonly YeastCatalogSeed[] = YEASTS_CATALOG_SEED,
): Promise<SeedYeastsCatalogResult> {
  let inserted = 0;
  let updated = 0;

  for (const yeast of yeasts) {
    const outcome = await idempotentUpsertById(
      repository,
      { id: yeast.id },
      {
        name: yeast.name,
        type: yeast.type,
        form: yeast.form,
        producer_id: yeast.producer_id,
        product_code: yeast.product_code,
        min_temperature_c: yeast.min_temperature_c,
        max_temperature_c: yeast.max_temperature_c,
        flocculation: yeast.flocculation,
        attenuation_percent_typical: yeast.attenuation_percent_typical,
        notes: yeast.notes,
      },
    );
    inserted += outcome.inserted;
    updated += outcome.updated;
  }

  return { inserted, updated, total: inserted + updated };
}
