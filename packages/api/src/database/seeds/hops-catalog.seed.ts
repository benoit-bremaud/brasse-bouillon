import { HopForm } from '../../catalog/hop/domain/enums/hop-form.enum';
import { HopOrmEntity } from '../../catalog/hop/entities/hop.orm.entity';
import { HopUsageType } from '../../catalog/hop/domain/enums/hop-usage-type.enum';
import { Repository } from 'typeorm';
import { idempotentUpsertById } from './seed-utils';

/**
 * Seed for the `hops` reference catalogue (Issue #708 / #869,
 * Phase 1 PR #1). Operator-curated entries — drawn FROM the
 * BeerXML 1.0 reference fixture (`docs/architecture/specs/fixtures/
 * libraries/hops.xml`, 5 entries) and BeerJSON-aligned datasheet
 * sources (Yakima Chief Hops, BarthHaas, Hops Direct), but
 * deliberately not a verbatim copy of either spec. Each row is
 * authored to be picker-friendly: a single representative
 * `alpha_acid_typical` rather than a min/max range, French notes
 * matching the convention of `PUBLIC_RECIPES_SEED.description`.
 *
 * The 20 entries are split:
 *   • 5 BeerXML canonical (Cascade, Galena, Goldings B.C.,
 *     Northern Brewer, Tettnang) — the ones in `libraries/hops.xml`.
 *   • 15 popular varieties needed by the demo recipes (Punk IPA,
 *     NEIPA, Saison, Belgian Tripel, etc.) and the broader
 *     homebrew vocabulary (Citra, Mosaic, Magnum, Saaz,
 *     Hallertau Mittelfrueh, Simcoe, Amarillo, Centennial,
 *     Chinook, East Kent Goldings, Fuggles, Styrian Goldings,
 *     Spalt, Columbus, Willamette).
 *
 * UUID range `00000000-0000-4000-9000-…` is reserved for the
 * reference catalogues. Public recipes use `…-8000-…`; batches
 * use `…-8000-…b1`-style suffixes. Keeping the catalogue in its
 * own range avoids any collision when the deterministic
 * identifiers grow.
 *
 * Producer / substitute relations are intentionally absent — they
 * land via a follow-up "normalize-producers" PR that introduces
 * `producers` + `hop_producers` + `hop_substitutes` (and the
 * analogous tables for yeasts and fermentables) as one coherent
 * normalised model after Phase 1 ships.
 */

export interface HopCatalogSeed {
  id: string;
  name: string;
  origin: string | null;
  alpha_acid_typical: number | null;
  beta_acid_typical: number | null;
  hop_stability_index: number | null;
  usage_type: HopUsageType;
  form: HopForm;
  notes: string | null;
}

export const HOPS_CATALOG_SEED: readonly HopCatalogSeed[] = [
  // ─── 5 BeerXML canonical entries (libraries/hops.xml) ────────────────────
  {
    id: '00000000-0000-4000-9000-000000000001',
    name: 'Cascade',
    origin: 'United States',
    alpha_acid_typical: 5.5,
    beta_acid_typical: 6,
    hop_stability_index: 50,
    usage_type: HopUsageType.BOTH,
    form: HopForm.PELLET,
    notes:
      "Houblon emblématique de l'IPA américaine. Profil agrumes/" +
      'pamplemousse avec notes florales et résineuses. ' +
      'Parfait en houblonnage tardif et dry hop.',
  },
  {
    id: '00000000-0000-4000-9000-000000000002',
    name: 'Galena',
    origin: 'United States',
    alpha_acid_typical: 13,
    beta_acid_typical: 7.5,
    hop_stability_index: 15,
    usage_type: HopUsageType.BITTERING,
    form: HopForm.PELLET,
    notes:
      'Houblon amérisant général américain. Amertume propre et ' +
      'équilibrée. Très bonne stabilité au stockage en cave fraîche.',
  },
  {
    id: '00000000-0000-4000-9000-000000000003',
    name: 'Goldings, B.C.',
    origin: 'Canada',
    alpha_acid_typical: 5,
    beta_acid_typical: 3.2,
    hop_stability_index: 40,
    usage_type: HopUsageType.AROMA,
    form: HopForm.PELLET,
    notes:
      'Variante canadienne du Goldings anglais. Arôme épicé, ' +
      'floral, rond et léger. Idéal pour ales britanniques, ' +
      'bitters, porters et stouts.',
  },
  {
    id: '00000000-0000-4000-9000-000000000004',
    name: 'Northern Brewer',
    origin: 'Germany',
    alpha_acid_typical: 8.5,
    beta_acid_typical: 4,
    hop_stability_index: 35,
    usage_type: HopUsageType.BOTH,
    form: HopForm.PELLET,
    notes:
      'Aussi appelé Hallertauer Northern Brewers. Amertume sèche ' +
      'et propre, saveur unique. Référence pour Anchor Steam et ' +
      'Old Peculiar.',
  },
  {
    id: '00000000-0000-4000-9000-000000000005',
    name: 'Tettnang',
    origin: 'Germany',
    alpha_acid_typical: 4.5,
    beta_acid_typical: 3.5,
    hop_stability_index: 40,
    usage_type: HopUsageType.AROMA,
    form: HopForm.PELLET,
    notes:
      'Houblon noble allemand. Arôme fin, mild, légèrement épicé. ' +
      'Pour ales et lagers allemandes, weizens.',
  },
  // ─── 15 popular varieties needed by the demo recipes ─────────────────────
  {
    id: '00000000-0000-4000-9000-000000000006',
    name: 'Citra',
    origin: 'United States',
    alpha_acid_typical: 12,
    beta_acid_typical: 4,
    hop_stability_index: 60,
    usage_type: HopUsageType.AROMA,
    form: HopForm.PELLET,
    notes:
      'Star de la NEIPA et de la Punk IPA. Profil tropical massif : ' +
      'fruit de la passion, mangue, agrumes. Surtout en houblonnage ' +
      'tardif et dry hop pour préserver les huiles aromatiques.',
  },
  {
    id: '00000000-0000-4000-9000-000000000007',
    name: 'Mosaic',
    origin: 'United States',
    alpha_acid_typical: 12.5,
    beta_acid_typical: 3.5,
    hop_stability_index: 65,
    usage_type: HopUsageType.BOTH,
    form: HopForm.PELLET,
    notes:
      'Complément naturel du Citra dans les NEIPA modernes. Profil ' +
      'tropical complexe : myrtille, mangue, fruit de la passion, ' +
      'pin léger. Excellent en double dry hop.',
  },
  {
    id: '00000000-0000-4000-9000-000000000008',
    name: 'Magnum',
    origin: 'Germany',
    alpha_acid_typical: 14,
    beta_acid_typical: 5.5,
    hop_stability_index: 25,
    usage_type: HopUsageType.BITTERING,
    form: HopForm.PELLET,
    notes:
      "Amérisant allemand neutre, à très haut taux d'alpha. " +
      'Apporte une amertume propre sans interférer avec les arômes ' +
      'des houblons aromatiques. Choix par défaut pour amériser ' +
      'une Punk IPA.',
  },
  {
    id: '00000000-0000-4000-9000-000000000009',
    name: 'Saaz',
    origin: 'Czech Republic',
    alpha_acid_typical: 3.5,
    beta_acid_typical: 4,
    hop_stability_index: 55,
    usage_type: HopUsageType.AROMA,
    form: HopForm.PELLET,
    notes:
      'Houblon noble tchèque, signature des pilsners de Bohême ' +
      '(Pilsner Urquell). Arôme épicé, floral, terreux. ' +
      'Très peu amérisant.',
  },
  {
    id: '00000000-0000-4000-9000-00000000000a',
    name: 'Hallertau Mittelfrueh',
    origin: 'Germany',
    alpha_acid_typical: 4.5,
    beta_acid_typical: 3.5,
    hop_stability_index: 60,
    usage_type: HopUsageType.AROMA,
    form: HopForm.PELLET,
    notes:
      'Houblon noble allemand par excellence. Référence pour les ' +
      'lagers continentales, weizens, helles. Arôme délicat, ' +
      'épicé et floral.',
  },
  {
    id: '00000000-0000-4000-9000-00000000000b',
    name: 'Simcoe',
    origin: 'United States',
    alpha_acid_typical: 13,
    beta_acid_typical: 4.5,
    hop_stability_index: 75,
    usage_type: HopUsageType.BOTH,
    form: HopForm.PELLET,
    notes:
      'Houblon polyvalent du Pacific Northwest. Profil pin, ' +
      'fruits à noyau, agrumes. Parfois une note "cat piss" en ' +
      'dry hop excessif. Souvent utilisé en synergie avec Citra.',
  },
  {
    id: '00000000-0000-4000-9000-00000000000c',
    name: 'Amarillo',
    origin: 'United States',
    alpha_acid_typical: 9,
    beta_acid_typical: 6.5,
    hop_stability_index: 60,
    usage_type: HopUsageType.AROMA,
    form: HopForm.PELLET,
    notes:
      'Profil orange / agrumes / fleur. Plus doux et juteux que ' +
      'Cascade. Excellent en flameout et dry hop pour Pale Ales ' +
      'et IPAs équilibrées.',
  },
  {
    id: '00000000-0000-4000-9000-00000000000d',
    name: 'Centennial',
    origin: 'United States',
    alpha_acid_typical: 10,
    beta_acid_typical: 4,
    hop_stability_index: 65,
    usage_type: HopUsageType.BOTH,
    form: HopForm.PELLET,
    notes:
      'Surnommé "Super Cascade". Plus puissant en agrumes et ' +
      "fleurs que Cascade, avec assez d'alpha pour amériser. " +
      'Référence des American IPAs classiques (Two Hearted Ale).',
  },
  {
    id: '00000000-0000-4000-9000-00000000000e',
    name: 'Chinook',
    origin: 'United States',
    alpha_acid_typical: 13,
    beta_acid_typical: 3.5,
    hop_stability_index: 70,
    usage_type: HopUsageType.BITTERING,
    form: HopForm.PELLET,
    notes:
      'Amérisant américain musclé. Profil pin, résineux, ' +
      'pamplemousse. Souvent utilisé en single-hop pour West Coast ' +
      "IPAs intenses. Très haut taux d'alpha.",
  },
  {
    id: '00000000-0000-4000-9000-00000000000f',
    name: 'East Kent Goldings',
    origin: 'United Kingdom',
    alpha_acid_typical: 5.5,
    beta_acid_typical: 2.5,
    hop_stability_index: 30,
    usage_type: HopUsageType.AROMA,
    form: HopForm.PELLET,
    notes:
      'Variété protégée par appellation (East Kent, UK). Référence ' +
      'des bitters anglaises. Arôme floral, doux, légèrement ' +
      'miellé. Indispensable pour ESB et Best Bitter authentiques.',
  },
  {
    id: '00000000-0000-4000-9000-000000000010',
    name: 'Fuggles',
    origin: 'United Kingdom',
    alpha_acid_typical: 4.5,
    beta_acid_typical: 2,
    hop_stability_index: 30,
    usage_type: HopUsageType.AROMA,
    form: HopForm.PELLET,
    notes:
      'Compagnon historique du Goldings. Arôme terreux, boisé, ' +
      'rustique. Pour milds, browns, porters traditionnels. ' +
      'Souvent utilisé en complément du Goldings.',
  },
  {
    id: '00000000-0000-4000-9000-000000000011',
    name: 'Styrian Goldings',
    origin: 'Slovenia',
    alpha_acid_typical: 5,
    beta_acid_typical: 3,
    hop_stability_index: 40,
    usage_type: HopUsageType.AROMA,
    form: HopForm.PELLET,
    notes:
      'Origine génétique : Fuggles cultivé en Slovénie. Arôme ' +
      'doux, épicé, légèrement résineux. Présent dans certaines ' +
      'lagers belges et tripels.',
  },
  {
    id: '00000000-0000-4000-9000-000000000012',
    name: 'Spalt',
    origin: 'Germany',
    alpha_acid_typical: 4,
    beta_acid_typical: 4.5,
    hop_stability_index: 45,
    usage_type: HopUsageType.AROMA,
    form: HopForm.PELLET,
    notes:
      'Houblon noble allemand de la région de Spalt. Plus discret ' +
      'que Hallertau. Pour kölsch, altbier, et certaines lagers ' +
      'régionales bavaroises.',
  },
  {
    id: '00000000-0000-4000-9000-000000000013',
    name: 'Columbus',
    origin: 'United States',
    alpha_acid_typical: 14.5,
    beta_acid_typical: 4.5,
    hop_stability_index: 70,
    usage_type: HopUsageType.BITTERING,
    form: HopForm.PELLET,
    notes:
      'Aussi commercialisé sous Tomahawk et Zeus (trio "CTZ"). ' +
      'Très haut alpha, profil résineux, terreux, agrumes. ' +
      'Standard pour amériser les West Coast IPAs.',
  },
  {
    id: '00000000-0000-4000-9000-000000000014',
    name: 'Willamette',
    origin: 'United States',
    alpha_acid_typical: 5,
    beta_acid_typical: 4,
    hop_stability_index: 30,
    usage_type: HopUsageType.AROMA,
    form: HopForm.PELLET,
    notes:
      'Cousine américaine du Fuggles, cultivée en Oregon. ' +
      'Arôme doux, fruité, floral, légèrement épicé. Pour porters, ' +
      'browns et certaines pale ales équilibrées.',
  },
];

/**
 * Result returned by `seedHopsCatalog` for instrumentation /
 * verification. Lets callers (tests, CLI, npm scripts) report what
 * happened without re-querying the DB.
 */
export interface SeedHopsCatalogResult {
  inserted: number;
  updated: number;
  total: number;
}

/**
 * Idempotent loader for the hop reference catalogue. Insert if the
 * id is unknown, update in place otherwise. Re-running the loader
 * never duplicates rows — see `idempotentUpsertById` for the shared
 * upsert pattern.
 */
export async function seedHopsCatalog(
  repository: Repository<HopOrmEntity>,
  hops: readonly HopCatalogSeed[] = HOPS_CATALOG_SEED,
): Promise<SeedHopsCatalogResult> {
  let inserted = 0;
  let updated = 0;

  for (const hop of hops) {
    const outcome = await idempotentUpsertById(
      repository,
      { id: hop.id },
      {
        name: hop.name,
        origin: hop.origin,
        alpha_acid_typical: hop.alpha_acid_typical,
        beta_acid_typical: hop.beta_acid_typical,
        hop_stability_index: hop.hop_stability_index,
        usage_type: hop.usage_type,
        form: hop.form,
        notes: hop.notes,
      },
    );
    inserted += outcome.inserted;
    updated += outcome.updated;
  }

  return { inserted, updated, total: inserted + updated };
}
