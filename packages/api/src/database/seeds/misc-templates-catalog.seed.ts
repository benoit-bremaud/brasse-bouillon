import { MiscTemplateOrmEntity } from '../../catalog/misc/entities/misc-template.orm.entity';
import {
  MiscType,
  MiscUseAt,
} from '../../catalog/misc/domain/misc-template.types';
import { Repository } from 'typeorm';
import { idempotentUpsertById } from './seed-utils';

/**
 * Seed for the `misc_templates` reference catalogue (Issue
 * #708 / #869, Phase 3 PR #8 — last catalogue of the series).
 * Operator-curated entries — drawn from the BeerXML 1.0
 * reference fixture (`docs/architecture/specs/fixtures/
 * libraries/misc.xml`, 5 entries) plus 5 modern essentials
 * picked to cover the TYPE × USE matrix end users actually
 * reach for in homebrew recipes.
 *
 * The 10 entries break down as:
 *   • 5 BeerXML canonical (verbatim from libraries/misc.xml):
 *     Apricot Extract (flavor / bottling), Calcium Chloride
 *     (water_agent / mash), Ginger Root (herb / boil),
 *     Irish Moss (fining / boil), Orange Peel Bitter
 *     (spice / boil).
 *   • 5 Brasse-Bouillon modern essentials:
 *     Coriandre graines (compagnon Witbier de l'Orange amère),
 *     Lactose (sucre non fermentescible — Milk Stout),
 *     Whirlfloc (clarifiant moderne — alt. Irish Moss en
 *     comprimé dosé), Servomyces (nutriment levure — santé
 *     fermentaire), Gypse CaSO₄ (compagnon eau du CaCl₂ —
 *     ratio sulfate/chlorure).
 *
 * UUID range `00000000-0000-4000-9000-7000-...` is reserved
 * for misc templates (hops `0`, fermentables `1`, yeasts `2`,
 * styles `3`, mash `4`, waters `5`, equipment `6`, misc `7`).
 */

export interface MiscTemplateSeed {
  id: string;
  name: string;
  type: MiscType;
  use_at: MiscUseAt;
  amount: number;
  amount_is_weight: boolean;
  time_min: number;
  use_for: string | null;
  notes: string | null;
}

export const MISC_TEMPLATES_CATALOG_SEED: readonly MiscTemplateSeed[] = [
  // ─── 5 BeerXML canonical entries (libraries/misc.xml) ──────────────
  {
    id: '00000000-0000-4000-9000-700000000000',
    name: 'Apricot Extract',
    type: MiscType.Flavor,
    use_at: MiscUseAt.Bottling,
    amount: 0.192229,
    amount_is_weight: false,
    time_min: 5,
    use_for: 'Fruit Beer',
    notes:
      "Extrait d'arôme d'abricot. À incorporer juste avant la mise en " +
      'bouteille pour préserver les composés volatils. Apporte une note ' +
      'fruitée nette aux ales légères et aux bières de blé. Coupler avec ' +
      "un houblonnage discret pour laisser la douceur s'exprimer.",
  },
  {
    id: '00000000-0000-4000-9000-700000000001',
    name: 'Calcium Chloride',
    type: MiscType.WaterAgent,
    use_at: MiscUseAt.Mash,
    amount: 0.005,
    amount_is_weight: true,
    time_min: 60,
    use_for: 'Water Agent',
    notes:
      "Chlorure de calcium (CaCl₂). Modifie le profil minéral de l'eau " +
      "et abaisse légèrement le pH d'empâtage. Renforce la rondeur et " +
      'le corps des malts (favorise les bières maltées : Munich, ' +
      'Märzen, Stout). Compagnon naturel du Gypse pour ajuster le ' +
      'ratio sulfate/chlorure cible — voir aussi le catalogue des ' +
      "profils d'eau de brassage.",
  },
  {
    id: '00000000-0000-4000-9000-700000000002',
    name: 'Ginger Root',
    type: MiscType.Herb,
    use_at: MiscUseAt.Boil,
    amount: 0.029574,
    amount_is_weight: false,
    time_min: 12,
    use_for: 'Holiday Beer',
    notes:
      'Gingembre frais râpé. Apporte une note piquante caractéristique ' +
      "aux Ginger Ales et bières d'hiver. Une dose discrète (15 g pour " +
      "20 L) reste perceptible ; jusqu'à 110 g pour 20 L pour une " +
      'Ginger Ale prononcée. Préférer la racine fraîche du primeur ' +
      'plutôt que le gingembre en poudre.',
  },
  {
    id: '00000000-0000-4000-9000-700000000003',
    name: 'Irish Moss',
    type: MiscType.Fining,
    use_at: MiscUseAt.Boil,
    amount: 0.001232,
    amount_is_weight: false,
    time_min: 10,
    use_for: 'Clarity',
    notes:
      'Algue marine séchée (clarifiant). Aide à la précipitation des ' +
      'protéines pendant le break protéique post-boil. Réduit le voile ' +
      'froid (chill haze) et améliore la limpidité finale. Ajout en ' +
      "fin d'ébullition (10 dernières minutes). Version moderne plus " +
      'dosée et plus pratique : voir Whirlfloc (comprimé).',
  },
  {
    id: '00000000-0000-4000-9000-700000000004',
    name: 'Orange Peel, Bitter',
    type: MiscType.Spice,
    use_at: MiscUseAt.Boil,
    amount: 0.02218,
    amount_is_weight: false,
    time_min: 5,
    use_for: 'Belgian Wit',
    notes:
      "Écorce d'orange amère (bigarade) séchée — classique des Witbier " +
      'et Belgian White Ales. Couleur vert-gris caractéristique. ' +
      'Compagnon obligatoire de la coriandre pour respecter le profil ' +
      "aromatique de la Witbier. Ajout en fin d'ébullition (5 dernières " +
      'minutes) pour préserver les huiles essentielles.',
  },
  // ─── 5 Brasse-Bouillon modern essentials ───────────────────────────
  {
    id: '00000000-0000-4000-9000-700000000005',
    name: 'Coriandre (graines)',
    type: MiscType.Spice,
    use_at: MiscUseAt.Boil,
    amount: 0.02,
    amount_is_weight: true,
    time_min: 10,
    use_for: 'Belgian Wit',
    notes:
      'Graines de coriandre fraîchement concassées au mortier. ' +
      "Compagnon obligatoire de l'Orange amère pour la Witbier — sans " +
      "elle, l'orange est solitaire et le profil aromatique " +
      'caractéristique manque. Dose de référence : 20 g pour 20 L. ' +
      "Ajout en fin d'ébullition (10 dernières minutes).",
  },
  {
    id: '00000000-0000-4000-9000-700000000006',
    name: 'Lactose',
    type: MiscType.Other,
    use_at: MiscUseAt.Boil,
    amount: 0.5,
    amount_is_weight: true,
    time_min: 15,
    use_for: 'Milk Stout',
    notes:
      'Sucre du lait, non fermentescible par la levure de bière. Reste ' +
      'dans la bière finie et apporte une rondeur sucrée caractéristique ' +
      'des Milk Stouts (Sweet Stouts). Dose typique : 250-500 g pour ' +
      "20 L selon l'intensité recherchée. Aussi utilisé dans les NEIPA " +
      'modernes pour la rondeur et la sensation laiteuse en bouche.',
  },
  {
    id: '00000000-0000-4000-9000-700000000007',
    name: 'Whirlfloc (comprimé)',
    type: MiscType.Fining,
    use_at: MiscUseAt.Boil,
    amount: 0.0025,
    amount_is_weight: true,
    time_min: 10,
    use_for: 'Clarity',
    notes:
      "Version moderne de l'Irish Moss : carraghénane purifiée + " +
      'Irish Moss compressée en comprimé dosé (~2,5 g par comprimé). ' +
      "Plus pratique et plus reproductible que l'algue séchée en " +
      'vrac. Un comprimé pour 20 L, ajouté dans les 10 dernières ' +
      "minutes d'ébullition. Améliore la limpidité et la stabilité " +
      'à froid.',
  },
  {
    id: '00000000-0000-4000-9000-700000000008',
    name: 'Servomyces (nutriment levure)',
    type: MiscType.Other,
    use_at: MiscUseAt.Boil,
    amount: 0.001,
    amount_is_weight: true,
    time_min: 10,
    use_for: 'Yeast Health',
    notes:
      'Nutriment de levure formulé sur sélection de levures enrichies ' +
      'en zinc. Soutient une fermentation saine et rapide, réduit le ' +
      'stress de la levure (notamment sur les bières fortes ou les ' +
      'moûts riches en adjuvants non maltés). Dose : 1 g pour 20 L, ' +
      "ajout en fin d'ébullition (10 dernières minutes). Quasi " +
      'systématique en brassage moderne pour la santé fermentaire.',
  },
  {
    id: '00000000-0000-4000-9000-700000000009',
    name: 'Gypse (sulfate de calcium, CaSO₄)',
    type: MiscType.WaterAgent,
    use_at: MiscUseAt.Mash,
    amount: 0.005,
    amount_is_weight: true,
    time_min: 60,
    use_for: 'Water Agent',
    notes:
      'Sulfate de calcium dihydraté. Compagnon naturel du chlorure ' +
      "de calcium pour ajuster le profil minéral de l'eau de " +
      "brassage. Renforce la sécheresse et l'amertume des houblons " +
      '(profil Burton-on-Trent — IPA, Pale Ales). Le ratio ' +
      'sulfate/chlorure pilote la perception finale : > 2 favorise ' +
      'les houblons, < 1 favorise les malts — voir aussi le ' +
      "catalogue des profils d'eau de brassage.",
  },
];

/**
 * Result returned by `seedMiscTemplatesCatalog` for
 * instrumentation / verification.
 */
export interface SeedMiscTemplatesCatalogResult {
  inserted: number;
  updated: number;
  total: number;
}

/**
 * Idempotent loader for the misc template reference catalogue.
 * Insert if the id is unknown, update in place otherwise.
 * Re-running the loader never duplicates rows.
 */
export async function seedMiscTemplatesCatalog(
  repository: Repository<MiscTemplateOrmEntity>,
  templates: readonly MiscTemplateSeed[] = MISC_TEMPLATES_CATALOG_SEED,
): Promise<SeedMiscTemplatesCatalogResult> {
  let inserted = 0;
  let updated = 0;

  for (const template of templates) {
    const outcome = await idempotentUpsertById(
      repository,
      { id: template.id },
      {
        name: template.name,
        type: template.type,
        use_at: template.use_at,
        amount: template.amount,
        amount_is_weight: template.amount_is_weight,
        time_min: template.time_min,
        use_for: template.use_for,
        notes: template.notes,
      },
    );
    inserted += outcome.inserted;
    updated += outcome.updated;
  }

  return { inserted, updated, total: inserted + updated };
}
