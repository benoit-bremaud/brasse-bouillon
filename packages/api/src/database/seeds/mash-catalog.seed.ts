import { MashProfileOrmEntity } from '../../catalog/mash/entities/mash-profile.orm.entity';
import { MashStepOrmEntity } from '../../catalog/mash/entities/mash-step.orm.entity';
import { MashStepType } from '../../catalog/mash/domain/enums/mash-step-type.enum';
import { Repository } from 'typeorm';
import { idempotentUpsertById } from './seed-utils';

/**
 * Seed for the `mash_profiles` + `mash_steps` reference catalogue
 * (Issue #708 / #869, Phase 2 PR #5). Operator-curated entries —
 * drawn from the BeerXML 1.0 reference fixture
 * (`docs/architecture/specs/fixtures/libraries/mash.xml`, 5 profiles
 * with 18 steps total) and from standard homebrew literature for
 * the modern profiles, but deliberately not a verbatim copy of
 * either source. French notes / descriptions follow the convention
 * of the previous catalogues.
 *
 * The 10 profiles are split:
 *   • 5 BeerXML canonical (Temperature Mash 1-Step Light Body,
 *     Single Infusion Light Body No Mash Out, Single Infusion Full
 *     Body, Double Infusion Medium Body, Decoction Mash Triple) —
 *     verbatim from libraries/mash.xml.
 *   • 5 modern profiles for the demo recipes:
 *     - Single Infusion 65°C 60min (American Pale / IPA)
 *     - Single Infusion 67°C 60min (NEIPA / Belgian)
 *     - Step Mash 50→65→78°C (Witbier / Hefeweizen)
 *     - Single Infusion 70°C 75min (Wee Heavy / full-body Stout)
 *     - Hochkurz Lager (Pilsner / Helles classique)
 *
 * UUID range `00000000-0000-4000-9000-4000-...` is reserved for
 * mash profiles. Mash steps use `00000000-0000-4000-9000-4001-...`
 * onwards (one range per parent profile, suffixed by step_index).
 */

export interface MashStepSeed {
  id: string;
  step_index: number;
  name: string;
  type: MashStepType;
  step_time_min: number | null;
  step_temp_c: number | null;
  ramp_time_min: number | null;
  end_temp_c: number | null;
  infuse_amount_l: number | null;
  infuse_temp_c: number | null;
  decoction_amount_l: number | null;
  water_grain_ratio: number | null;
  description: string | null;
}

export interface MashProfileSeed {
  id: string;
  name: string;
  grain_temp_c: number | null;
  tun_temp_c: number | null;
  sparge_temp_c: number | null;
  ph: number | null;
  tun_weight_kg: number | null;
  tun_specific_heat: number | null;
  equip_adjust: boolean;
  notes: string | null;
  steps: readonly MashStepSeed[];
}

export const MASH_CATALOG_SEED: readonly MashProfileSeed[] = [
  // ─── 5 BeerXML canonical profiles (libraries/mash.xml) ─────────────────
  {
    id: '00000000-0000-4000-9000-400000000001',
    name: 'Temperature Mash, 1 Step, Light Body',
    grain_temp_c: 22.2,
    tun_temp_c: 22.2,
    sparge_temp_c: 75.5,
    ph: 5.4,
    tun_weight_kg: 0,
    tun_specific_heat: 0.12,
    equip_adjust: false,
    notes:
      'Empâtage à monter en température, utilisable avec une casserole ' +
      'sur plaque (sans cuve isolée). Maintenir la température cible ' +
      'manuellement à la chauffe.',
    steps: [
      {
        id: '00000000-0000-4000-9000-400100000001',
        step_index: 1,
        name: 'Saccharification',
        type: MashStepType.INFUSION,
        step_time_min: 75,
        step_temp_c: 65.5,
        ramp_time_min: 15,
        end_temp_c: 65.5,
        infuse_amount_l: 11.8,
        infuse_temp_c: 71.9,
        decoction_amount_l: 0,
        water_grain_ratio: 1.25,
        description: "Ajouter 11,8 L d'eau à 71,9°C. Maintenir 65,5°C 75 min.",
      },
      {
        id: '00000000-0000-4000-9000-400100000002',
        step_index: 2,
        name: 'Mash Out',
        type: MashStepType.TEMPERATURE,
        step_time_min: 10,
        step_temp_c: 75.5,
        ramp_time_min: 10,
        end_temp_c: 75.5,
        infuse_amount_l: 0,
        infuse_temp_c: null,
        decoction_amount_l: 0,
        water_grain_ratio: 1.25,
        description: 'Monter à 75,5°C en 10 min, maintenir 10 min.',
      },
    ],
  },
  {
    id: '00000000-0000-4000-9000-400000000002',
    name: 'Single Infusion, Light Body, No Mash Out',
    grain_temp_c: 22.2,
    tun_temp_c: 22.2,
    sparge_temp_c: 75.5,
    ph: 5.4,
    tun_weight_kg: 0,
    tun_specific_heat: 0.12,
    equip_adjust: false,
    notes:
      "Mono-palier d'infusion simple, sans mash out. Convient pour la " +
      'plupart des malts modernes bien modifiés (~95% des cas).',
    steps: [
      {
        id: '00000000-0000-4000-9000-400200000001',
        step_index: 1,
        name: 'Mash In',
        type: MashStepType.INFUSION,
        step_time_min: 75,
        step_temp_c: 65.5,
        ramp_time_min: 2,
        end_temp_c: 65.5,
        infuse_amount_l: 11.8,
        infuse_temp_c: 71.9,
        decoction_amount_l: 0,
        water_grain_ratio: 1.25,
        description: "Ajouter 11,8 L d'eau à 71,9°C. Maintenir 65,5°C 75 min.",
      },
    ],
  },
  {
    id: '00000000-0000-4000-9000-400000000003',
    name: 'Single Infusion, Full Body',
    grain_temp_c: 22.2,
    tun_temp_c: 22.2,
    sparge_temp_c: 75.5,
    ph: 5.4,
    tun_weight_kg: 0,
    tun_specific_heat: 0.12,
    equip_adjust: false,
    notes:
      "Mono-palier d'infusion à température élevée (70°C) pour favoriser " +
      'les sucres non fermentescibles et obtenir un corps plein. Avec mash out.',
    steps: [
      {
        id: '00000000-0000-4000-9000-400300000001',
        step_index: 1,
        name: 'Mash In',
        type: MashStepType.INFUSION,
        step_time_min: 45,
        step_temp_c: 70,
        ramp_time_min: 2,
        end_temp_c: 70,
        infuse_amount_l: 11.8,
        infuse_temp_c: 76.9,
        decoction_amount_l: 0,
        water_grain_ratio: 1.25,
        description: "Ajouter 11,8 L d'eau à 76,9°C. Maintenir 70°C 45 min.",
      },
      {
        id: '00000000-0000-4000-9000-400300000002',
        step_index: 2,
        name: 'Mash Out',
        type: MashStepType.INFUSION,
        step_time_min: 10,
        step_temp_c: 75.5,
        ramp_time_min: 2,
        end_temp_c: 75.5,
        infuse_amount_l: 4.7,
        infuse_temp_c: 91.4,
        decoction_amount_l: 0,
        water_grain_ratio: 1.75,
        description: "Ajouter 4,7 L d'eau à 91,4°C pour atteindre 75,5°C.",
      },
    ],
  },
  {
    id: '00000000-0000-4000-9000-400000000004',
    name: 'Double Infusion, Medium Body',
    grain_temp_c: 22.2,
    tun_temp_c: 22.2,
    sparge_temp_c: 75.5,
    ph: 5.4,
    tun_weight_kg: 0,
    tun_specific_heat: 0.12,
    equip_adjust: false,
    notes:
      'Double palier avec repos protéique. Pour bières de corps moyen ' +
      'avec un fort taux de céréales non maltées ou adjoints (wheat, oats).',
    steps: [
      {
        id: '00000000-0000-4000-9000-400400000001',
        step_index: 1,
        name: 'Protein Rest',
        type: MashStepType.INFUSION,
        step_time_min: 30,
        step_temp_c: 50,
        ramp_time_min: 2,
        end_temp_c: 50,
        infuse_amount_l: 6.6,
        infuse_temp_c: 57.2,
        decoction_amount_l: 0,
        water_grain_ratio: 0.7,
        description: "Ajouter 6,6 L d'eau à 57,2°C. Repos protéique 30 min.",
      },
      {
        id: '00000000-0000-4000-9000-400400000002',
        step_index: 2,
        name: 'Saccharification',
        type: MashStepType.INFUSION,
        step_time_min: 30,
        step_temp_c: 67.8,
        ramp_time_min: 2,
        end_temp_c: 67.8,
        infuse_amount_l: 6.6,
        infuse_temp_c: 90.2,
        decoction_amount_l: 0,
        water_grain_ratio: 1.4,
        description: "Ajouter 6,6 L d'eau à 90,2°C pour atteindre 67,8°C.",
      },
      {
        id: '00000000-0000-4000-9000-400400000003',
        step_index: 3,
        name: 'Mash Out',
        type: MashStepType.INFUSION,
        step_time_min: 10,
        step_temp_c: 75.5,
        ramp_time_min: 2,
        end_temp_c: 75.5,
        infuse_amount_l: 6.6,
        infuse_temp_c: 93.1,
        decoction_amount_l: 0,
        water_grain_ratio: 2.1,
        description: "Ajouter 6,6 L d'eau à 93,1°C pour atteindre 75,5°C.",
      },
    ],
  },
  {
    id: '00000000-0000-4000-9000-400000000005',
    name: 'Decoction Mash, Triple',
    grain_temp_c: 22.2,
    tun_temp_c: 22.2,
    sparge_temp_c: 75.5,
    ph: 5.4,
    tun_weight_kg: 0,
    tun_specific_heat: 0.12,
    equip_adjust: false,
    notes:
      'Empâtage par décoction triple, méthode allemande/tchèque ' +
      'authentique. Prélever la décoction depuis la partie épaisse de ' +
      'la maische. Certains brasseurs recommandent un repos de ' +
      'saccharification de 15 min à 70°C pour chaque décoction avant ' +
      'ébullition.',
    steps: [
      {
        id: '00000000-0000-4000-9000-400500000001',
        step_index: 1,
        name: 'Acid Rest',
        type: MashStepType.INFUSION,
        step_time_min: 45,
        step_temp_c: 35,
        ramp_time_min: 2,
        end_temp_c: 35,
        infuse_amount_l: 18.9,
        infuse_temp_c: 36.2,
        decoction_amount_l: 0,
        water_grain_ratio: 2,
        description: "Ajouter 18,9 L d'eau à 36,2°C. Repos acide 45 min.",
      },
      {
        id: '00000000-0000-4000-9000-400500000002',
        step_index: 2,
        name: 'Protein Rest',
        type: MashStepType.DECOCTION,
        step_time_min: 60,
        step_temp_c: 50,
        ramp_time_min: 2,
        end_temp_c: 50,
        infuse_amount_l: 0,
        infuse_temp_c: null,
        decoction_amount_l: 5.1,
        water_grain_ratio: 2,
        description: 'Décoction de 5,1 L de maische et bouillir.',
      },
      {
        id: '00000000-0000-4000-9000-400500000003',
        step_index: 3,
        name: 'Saccharification 1',
        type: MashStepType.DECOCTION,
        step_time_min: 15,
        step_temp_c: 64.4,
        ramp_time_min: 2,
        end_temp_c: 64.4,
        infuse_amount_l: 0,
        infuse_temp_c: null,
        decoction_amount_l: 6.3,
        water_grain_ratio: 2,
        description: 'Décoction de 6,3 L de maische et bouillir.',
      },
      {
        id: '00000000-0000-4000-9000-400500000004',
        step_index: 4,
        name: 'Saccharification 2',
        type: MashStepType.DECOCTION,
        step_time_min: 15,
        step_temp_c: 70,
        ramp_time_min: 2,
        end_temp_c: 70,
        infuse_amount_l: 0,
        infuse_temp_c: null,
        decoction_amount_l: 3.4,
        water_grain_ratio: 2,
        description: 'Décoction de 3,4 L de maische et bouillir.',
      },
      {
        id: '00000000-0000-4000-9000-400500000005',
        step_index: 5,
        name: 'Mash Out',
        type: MashStepType.TEMPERATURE,
        step_time_min: 10,
        step_temp_c: 75.5,
        ramp_time_min: 10,
        end_temp_c: 75.5,
        infuse_amount_l: 0,
        infuse_temp_c: null,
        decoction_amount_l: 0,
        water_grain_ratio: 2,
        description: 'Monter à 75,5°C en 10 min.',
      },
    ],
  },
  // ─── 5 modern profiles for the demo recipes ──────────────────────────
  {
    id: '00000000-0000-4000-9000-400000000006',
    name: 'Single Infusion 65°C 60min (American Pale / IPA)',
    grain_temp_c: 22,
    tun_temp_c: 22,
    sparge_temp_c: 76,
    ph: 5.4,
    tun_weight_kg: 3,
    tun_specific_heat: 0.12,
    equip_adjust: false,
    notes:
      'Profil standard pour les IPA américaines modernes (Punk IPA, ' +
      'Sierra Nevada Pale, Stone IPA). 65°C favorise une atténuation ' +
      'élevée et une finale sèche qui laisse parler le houblon.',
    steps: [
      {
        id: '00000000-0000-4000-9000-400600000001',
        step_index: 1,
        name: 'Mash In',
        type: MashStepType.INFUSION,
        step_time_min: 60,
        step_temp_c: 65,
        ramp_time_min: 2,
        end_temp_c: 65,
        infuse_amount_l: 15,
        infuse_temp_c: 71,
        decoction_amount_l: null,
        water_grain_ratio: 3,
        description: 'Empâtage à 65°C pendant 60 min (rapport 3 L/kg).',
      },
      {
        id: '00000000-0000-4000-9000-400600000002',
        step_index: 2,
        name: 'Mash Out',
        type: MashStepType.TEMPERATURE,
        step_time_min: 10,
        step_temp_c: 76,
        ramp_time_min: 10,
        end_temp_c: 76,
        infuse_amount_l: null,
        infuse_temp_c: null,
        decoction_amount_l: null,
        water_grain_ratio: 3,
        description: 'Monter à 76°C en 10 min pour stopper les enzymes.',
      },
    ],
  },
  {
    id: '00000000-0000-4000-9000-400000000007',
    name: 'Single Infusion 67°C 60min (NEIPA / Belgian)',
    grain_temp_c: 22,
    tun_temp_c: 22,
    sparge_temp_c: 76,
    ph: 5.4,
    tun_weight_kg: 3,
    tun_specific_heat: 0.12,
    equip_adjust: false,
    notes:
      'Profil équilibré 67°C : bon compromis atténuation/corps. Pour ' +
      'NEIPA (corps crémeux préservé), Belgian Tripel, Saison.',
    steps: [
      {
        id: '00000000-0000-4000-9000-400700000001',
        step_index: 1,
        name: 'Mash In',
        type: MashStepType.INFUSION,
        step_time_min: 60,
        step_temp_c: 67,
        ramp_time_min: 2,
        end_temp_c: 67,
        infuse_amount_l: 15,
        infuse_temp_c: 73,
        decoction_amount_l: null,
        water_grain_ratio: 3,
        description: 'Empâtage à 67°C pendant 60 min.',
      },
      {
        id: '00000000-0000-4000-9000-400700000002',
        step_index: 2,
        name: 'Mash Out',
        type: MashStepType.TEMPERATURE,
        step_time_min: 10,
        step_temp_c: 76,
        ramp_time_min: 10,
        end_temp_c: 76,
        infuse_amount_l: null,
        infuse_temp_c: null,
        decoction_amount_l: null,
        water_grain_ratio: 3,
        description: 'Monter à 76°C en 10 min.',
      },
    ],
  },
  {
    id: '00000000-0000-4000-9000-400000000008',
    name: 'Step Mash 50→65→78°C (Witbier / Hefeweizen)',
    grain_temp_c: 22,
    tun_temp_c: 22,
    sparge_temp_c: 78,
    ph: 5.4,
    tun_weight_kg: 3,
    tun_specific_heat: 0.12,
    equip_adjust: false,
    notes:
      'Empâtage à paliers multiples pour bières de blé. Repos protéique ' +
      'à 50°C nécessaire avec le wheat malt non modifié. Saccharification ' +
      'à 65°C pour finale sèche typique du style.',
    steps: [
      {
        id: '00000000-0000-4000-9000-400800000001',
        step_index: 1,
        name: 'Protein Rest',
        type: MashStepType.INFUSION,
        step_time_min: 20,
        step_temp_c: 50,
        ramp_time_min: 2,
        end_temp_c: 50,
        infuse_amount_l: 12,
        infuse_temp_c: 56,
        decoction_amount_l: null,
        water_grain_ratio: 3,
        description: 'Empâtage à 50°C, repos protéique 20 min.',
      },
      {
        id: '00000000-0000-4000-9000-400800000002',
        step_index: 2,
        name: 'Saccharification',
        type: MashStepType.TEMPERATURE,
        step_time_min: 45,
        step_temp_c: 65,
        ramp_time_min: 15,
        end_temp_c: 65,
        infuse_amount_l: null,
        infuse_temp_c: null,
        decoction_amount_l: null,
        water_grain_ratio: 3,
        description: 'Monter à 65°C en 15 min, maintenir 45 min.',
      },
      {
        id: '00000000-0000-4000-9000-400800000003',
        step_index: 3,
        name: 'Mash Out',
        type: MashStepType.TEMPERATURE,
        step_time_min: 10,
        step_temp_c: 78,
        ramp_time_min: 10,
        end_temp_c: 78,
        infuse_amount_l: null,
        infuse_temp_c: null,
        decoction_amount_l: null,
        water_grain_ratio: 3,
        description: 'Monter à 78°C en 10 min.',
      },
    ],
  },
  {
    id: '00000000-0000-4000-9000-400000000009',
    name: 'Single Infusion 70°C 75min (Wee Heavy / full-body Stout)',
    grain_temp_c: 22,
    tun_temp_c: 22,
    sparge_temp_c: 76,
    ph: 5.4,
    tun_weight_kg: 3,
    tun_specific_heat: 0.12,
    equip_adjust: false,
    notes:
      'Profil corps plein à 70°C : favorise les dextrines non ' +
      'fermentescibles. Pour Wee Heavy, Imperial Stout, Russian Imperial ' +
      'Stout, Old Ale — toutes les bières où on veut une bouche dense ' +
      'et de la sucrosité résiduelle.',
    steps: [
      {
        id: '00000000-0000-4000-9000-400900000001',
        step_index: 1,
        name: 'Mash In',
        type: MashStepType.INFUSION,
        step_time_min: 75,
        step_temp_c: 70,
        ramp_time_min: 2,
        end_temp_c: 70,
        infuse_amount_l: 15,
        infuse_temp_c: 76,
        decoction_amount_l: null,
        water_grain_ratio: 3,
        description: 'Empâtage à 70°C pendant 75 min pour corps plein.',
      },
      {
        id: '00000000-0000-4000-9000-400900000002',
        step_index: 2,
        name: 'Mash Out',
        type: MashStepType.TEMPERATURE,
        step_time_min: 10,
        step_temp_c: 76,
        ramp_time_min: 10,
        end_temp_c: 76,
        infuse_amount_l: null,
        infuse_temp_c: null,
        decoction_amount_l: null,
        water_grain_ratio: 3,
        description: 'Monter à 76°C en 10 min.',
      },
    ],
  },
  {
    id: '00000000-0000-4000-9000-40000000000a',
    name: 'Hochkurz Lager (Pilsner / Helles classique)',
    grain_temp_c: 22,
    tun_temp_c: 22,
    sparge_temp_c: 78,
    ph: 5.3,
    tun_weight_kg: 3,
    tun_specific_heat: 0.12,
    equip_adjust: false,
    notes:
      'Profil court allemand classique pour lagers. Maltose à 62°C ' +
      'pour atténuation, dextrinization à 72°C pour structure, mash out ' +
      'à 78°C. Donne une bière nette caractéristique des Pilsner et Helles.',
    steps: [
      {
        id: '00000000-0000-4000-9000-400a00000001',
        step_index: 1,
        name: 'Maltose Rest',
        type: MashStepType.INFUSION,
        step_time_min: 30,
        step_temp_c: 62,
        ramp_time_min: 2,
        end_temp_c: 62,
        infuse_amount_l: 12,
        infuse_temp_c: 68,
        decoction_amount_l: null,
        water_grain_ratio: 2.5,
        description: 'Empâtage à 62°C, repos maltose 30 min.',
      },
      {
        id: '00000000-0000-4000-9000-400a00000002',
        step_index: 2,
        name: 'Dextrinization Rest',
        type: MashStepType.TEMPERATURE,
        step_time_min: 30,
        step_temp_c: 72,
        ramp_time_min: 10,
        end_temp_c: 72,
        infuse_amount_l: null,
        infuse_temp_c: null,
        decoction_amount_l: null,
        water_grain_ratio: 2.5,
        description: 'Monter à 72°C, repos dextrinization 30 min.',
      },
      {
        id: '00000000-0000-4000-9000-400a00000003',
        step_index: 3,
        name: 'Mash Out',
        type: MashStepType.TEMPERATURE,
        step_time_min: 10,
        step_temp_c: 78,
        ramp_time_min: 10,
        end_temp_c: 78,
        infuse_amount_l: null,
        infuse_temp_c: null,
        decoction_amount_l: null,
        water_grain_ratio: 2.5,
        description: 'Monter à 78°C en 10 min.',
      },
    ],
  },
];

/**
 * Result returned by `seedMashCatalog` for instrumentation /
 * verification. Counts profiles AND steps separately so callers
 * can verify the full tree was loaded.
 */
export interface SeedMashCatalogResult {
  profilesInserted: number;
  profilesUpdated: number;
  profilesTotal: number;
  stepsInserted: number;
  stepsUpdated: number;
  stepsTotal: number;
}

/**
 * Idempotent loader for the mash profile + step catalogue. Inserts
 * profiles first (parents), then steps (children with FK). Uses
 * `idempotentUpsertById` for both, so re-running the loader never
 * duplicates rows. Profile FK constraint guarantees steps reference
 * an existing profile.
 *
 * Order matters: profiles must be persisted before their steps, so
 * the FK lookup succeeds. The flat single-pass loop relies on each
 * profile's steps being defined alongside the profile in the seed
 * data.
 */
export async function seedMashCatalog(
  profileRepository: Repository<MashProfileOrmEntity>,
  stepRepository: Repository<MashStepOrmEntity>,
  profiles: readonly MashProfileSeed[] = MASH_CATALOG_SEED,
): Promise<SeedMashCatalogResult> {
  let profilesInserted = 0;
  let profilesUpdated = 0;
  let stepsInserted = 0;
  let stepsUpdated = 0;

  for (const profile of profiles) {
    const profileOutcome = await idempotentUpsertById(
      profileRepository,
      { id: profile.id },
      {
        name: profile.name,
        grain_temp_c: profile.grain_temp_c,
        tun_temp_c: profile.tun_temp_c,
        sparge_temp_c: profile.sparge_temp_c,
        ph: profile.ph,
        tun_weight_kg: profile.tun_weight_kg,
        tun_specific_heat: profile.tun_specific_heat,
        equip_adjust: profile.equip_adjust,
        notes: profile.notes,
      },
    );
    profilesInserted += profileOutcome.inserted;
    profilesUpdated += profileOutcome.updated;

    for (const step of profile.steps) {
      const stepOutcome = await idempotentUpsertById(
        stepRepository,
        { id: step.id },
        {
          mash_profile_id: profile.id,
          step_index: step.step_index,
          name: step.name,
          type: step.type,
          step_time_min: step.step_time_min,
          step_temp_c: step.step_temp_c,
          ramp_time_min: step.ramp_time_min,
          end_temp_c: step.end_temp_c,
          infuse_amount_l: step.infuse_amount_l,
          infuse_temp_c: step.infuse_temp_c,
          decoction_amount_l: step.decoction_amount_l,
          water_grain_ratio: step.water_grain_ratio,
          description: step.description,
        },
      );
      stepsInserted += stepOutcome.inserted;
      stepsUpdated += stepOutcome.updated;
    }
  }

  const totalSteps = profiles.reduce((sum, p) => sum + p.steps.length, 0);
  return {
    profilesInserted,
    profilesUpdated,
    profilesTotal: profiles.length,
    stepsInserted,
    stepsUpdated,
    stepsTotal: totalSteps,
  };
}
