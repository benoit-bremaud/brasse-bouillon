import { RecipeDifficultyLevel } from '../enums/recipe-difficulty-level.enum';
import { RecipeYeastType } from '../enums/recipe-yeast-type.enum';
import {
  DifficultyInput,
  DifficultyReason,
  DifficultyResult,
} from './recipe-difficulty.types';

// Re-exported so existing importers of the domain service keep a single entry
// point; the shapes themselves live in `recipe-difficulty.types` so the ORM
// entity / DTO / application service can depend on them without importing a
// service file.
export type {
  DifficultyInput,
  DifficultyReason,
  DifficultyResult,
} from './recipe-difficulty.types';

type YeastClass = 'ale' | 'lager' | 'wild';

/** Per-factor score: an integer tier and, when it fires, its explanation. */
interface FactorScore {
  readonly id: string;
  readonly tier: 0 | 1 | 2;
  readonly sentence?: string;
}

/** Calibration knobs (v1 defaults — ADR-0024, spec §6). */
const OG_MODERATE = 1.055;
const OG_HIGH = 1.075;
const ABV_MODERATE = 5.5;
const ABV_HIGH = 7.5;
const PALE_EBC_MAX = 10;
const COLD_FERMENT_MAX_C = 14;
const HOT_FERMENT_MIN_C = 26;
const COMPLEXITY_MAX = 7;
const COMPOUNDING_MIN_MODERATE = 3;

const SENTENCES = {
  wild: 'levure sauvage (Brett) ou fermentation acide : c’est long, imprévisible, et il faut une hygiène irréprochable',
  lager:
    'elle fermente au froid (≈10 °C) puis se garde plusieurs semaines : il te faut de quoi refroidir et de la patience',
  coldAle:
    'elle fermente au froid : il te faut de quoi refroidir, la marge d’erreur est faible',
  hot: 'elle fermente au chaud (>26 °C) et finit très sèche : la fermentation peut caler, il faut savoir la relancer',
  gravityModerate:
    'bière assez forte : il y a beaucoup de sucres à transformer, la fermentation demande plus d’attention',
  gravityHigh:
    'grosse bière : il faut BEAUCOUP de levure au départ (un « pied de levure »), sinon la fermentation risque de s’arrêter avant la fin',
  faultExposing:
    'une lager blonde et nette : ni houblon fort ni malt torréfié pour cacher un défaut — la moindre erreur se voit tout de suite',
  water:
    'l’eau est ajustée avec des sels minéraux pour coller au style : il faut mesurer et calculer, une étape que les débutants sautent souvent',
  complexity:
    'recette riche : beaucoup d’ingrédients différents à gérer et à minuter, plus d’occasions de se tromper',
  facile:
    'Recette accessible : fermentation haute, densité modérée, pas de technique avancée — idéale pour un premier brassin.',
} as const;

const LEVELS: readonly RecipeDifficultyLevel[] = [
  RecipeDifficultyLevel.FACILE,
  RecipeDifficultyLevel.INTERMEDIAIRE,
  RecipeDifficultyLevel.AVANCE,
];

function classifyYeast(yeast: DifficultyInput['yeast']): YeastClass {
  if (!yeast) {
    return 'ale';
  }
  if (
    yeast.type === RecipeYeastType.WILD ||
    yeast.type === RecipeYeastType.BRETT
  ) {
    return 'wild';
  }
  if (yeast.type === RecipeYeastType.LAGER) {
    return 'lager';
  }
  return 'ale';
}

/** F1 — fermentation/yeast. Tier from the signal, sentence from the type. */
function scoreYeast(
  yeastClass: YeastClass,
  temperatureMaxC?: number | null,
): FactorScore {
  if (yeastClass === 'wild') {
    return { id: 'F1', tier: 2, sentence: SENTENCES.wild };
  }
  if (yeastClass === 'lager') {
    return { id: 'F1', tier: 1, sentence: SENTENCES.lager };
  }
  if (temperatureMaxC != null && temperatureMaxC < COLD_FERMENT_MAX_C) {
    return { id: 'F1', tier: 1, sentence: SENTENCES.coldAle };
  }
  if (temperatureMaxC != null && temperatureMaxC > HOT_FERMENT_MIN_C) {
    return { id: 'F1', tier: 1, sentence: SENTENCES.hot };
  }
  return { id: 'F1', tier: 0 };
}

/** F2 — gravity. Prefer OG; else derive the band from ABV. */
function scoreGravity(
  ogTarget?: number | null,
  abvEstimated?: number | null,
): FactorScore {
  let tier: 0 | 1 | 2 = 0;
  if (ogTarget != null) {
    tier = ogTarget <= OG_MODERATE ? 0 : ogTarget <= OG_HIGH ? 1 : 2;
  } else if (abvEstimated != null) {
    tier = abvEstimated < ABV_MODERATE ? 0 : abvEstimated <= ABV_HIGH ? 1 : 2;
  }
  if (tier === 0) {
    return { id: 'F2', tier };
  }
  return {
    id: 'F2',
    tier,
    sentence: tier === 2 ? SENTENCES.gravityHigh : SENTENCES.gravityModerate,
  };
}

/** F3 — fault-tolerance, lager-gated on a pale colour (IBU intentionally unused). */
function scoreFaultTolerance(
  yeastClass: YeastClass,
  ebcTarget?: number | null,
): FactorScore {
  if (
    yeastClass === 'lager' &&
    ebcTarget != null &&
    ebcTarget <= PALE_EBC_MAX
  ) {
    return { id: 'F3', tier: 2, sentence: SENTENCES.faultExposing };
  }
  return { id: 'F3', tier: 0 };
}

/** F4 — water chemistry: a real target profile, not a lone sachet. */
function scoreWater(water: DifficultyInput['water']): FactorScore {
  if (!water) {
    return { id: 'F4', tier: 0 };
  }
  const ionTargets = [
    water.calciumPpm,
    water.magnesiumPpm,
    water.sulfatePpm,
    water.chloridePpm,
  ].filter((v) => v != null).length;
  if (water.phTarget != null || ionTargets >= 2) {
    return { id: 'F4', tier: 1, sentence: SENTENCES.water };
  }
  return { id: 'F4', tier: 0 };
}

/** F6 — recipe complexity (distinct varieties, not timed additions). */
function scoreComplexity(input: DifficultyInput): FactorScore {
  const complexity =
    (input.distinctFermentables ?? 0) +
    (input.distinctHopVarieties ?? 0) +
    (input.additives ?? 0);
  if (complexity > COMPLEXITY_MAX) {
    return { id: 'F6', tier: 1, sentence: SENTENCES.complexity };
  }
  return { id: 'F6', tier: 0 };
}

/**
 * Deterministic, explainable recipe brewing-difficulty engine (ADR-0024).
 *
 * Rule-based, max-dominates with bounded compounding. Pure — a function of the
 * recipe alone, so it is trivially unit-tested (the spec's worked examples are
 * the fixtures) and identical across all clients.
 *
 * F5 (mash complexity) is deferred in v1: `recipe-step` carries no per-rest
 * temperature, so a step/decoction mash is not detectable yet (spec §F5/§6).
 */
export class RecipeDifficultyDomainService {
  static compute(input: DifficultyInput): DifficultyResult {
    const yeastClass = classifyYeast(input.yeast);

    const factors: FactorScore[] = [
      scoreYeast(yeastClass, input.yeast?.temperatureMaxC),
      scoreGravity(input.ogTarget, input.abvEstimated),
      scoreFaultTolerance(yeastClass, input.ebcTarget),
      scoreWater(input.water),
      // F5 deferred → always tier 0.
      { id: 'F5', tier: 0 },
      scoreComplexity(input),
    ];

    const base = factors.reduce((max, f) => Math.max(max, f.tier), 0);
    const moderateCount = factors.filter((f) => f.tier === 1).length;
    const tier =
      moderateCount >= COMPOUNDING_MIN_MODERATE ? Math.min(base + 1, 2) : base;
    const computed = LEVELS[tier];

    if (tier === 0) {
      return {
        computed,
        reasons: [{ factor: 'facile', tier: 0, sentence: SENTENCES.facile }],
      };
    }

    const reasons: DifficultyReason[] = factors
      .filter((f) => f.tier >= 1 && f.sentence != null)
      // Highest tier first; ties broken by factor id (F1→F6) for a stable order.
      .sort((a, b) => b.tier - a.tier || a.id.localeCompare(b.id))
      .map((f) => ({
        factor: f.id,
        tier: f.tier,
        sentence: f.sentence as string,
      }));

    return { computed, reasons };
  }
}
