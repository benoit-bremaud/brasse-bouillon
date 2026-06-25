import { RecipeStepType } from '../../../recipe/domain/enums/recipe-step-type.enum';

/**
 * StepGuidance
 *
 * Beginner-facing guidance attached to a batch step at start time, keyed by the
 * brewing step type. Realises the "B1-live" brew-day assistant content: a
 * vulgarised "why" tip and a default planned duration (minutes) so the mobile
 * step card can show the ⓘ tip and a countdown timer in **live** mode (not only
 * demo data). The recipe-authored `description` is left untouched — this only
 * adds the type-level tip + duration.
 *
 * MVP source = per-step-type defaults (no recipe↔guidance link yet; that is a
 * later iteration). A `null` duration means "no countdown" (fermentation and
 * packaging run over days, tracked elsewhere).
 */
export interface StepGuidance {
  readonly pedagogicalTip: string;
  /** Default planned duration in minutes, or `null` when not time-boxed. */
  readonly plannedDurationMin: number | null;
}

const STEP_TYPE_GUIDANCE: Readonly<Record<RecipeStepType, StepGuidance>> = {
  [RecipeStepType.MASH]: {
    pedagogicalTip:
      "L'empâtage fait infuser le grain concassé dans l'eau chaude (~65-67°C) : les enzymes y convertissent l'amidon en sucres fermentescibles. Plus chaud donne une bière plus ronde, plus froid une bière plus sèche.",
    plannedDurationMin: 60,
  },
  [RecipeStepType.BOIL]: {
    pedagogicalTip:
      "L'ébullition stérilise le moût, isomérise les acides alpha du houblon (l'amertume) et concentre les sucres. Les houblons d'amertume vont tôt, les houblons d'arôme en toute fin d'ébullition.",
    plannedDurationMin: 60,
  },
  [RecipeStepType.WHIRLPOOL]: {
    pedagogicalTip:
      "Le whirlpool fait tourner le moût pour rassembler les résidus (le trub) au centre, puis on refroidit vite avant d'ensemencer la levure. À partir d'ici, tout ce qui touche le moût refroidi doit être désinfecté.",
    plannedDurationMin: 15,
  },
  [RecipeStepType.FERMENTATION]: {
    pedagogicalTip:
      'La levure transforme les sucres en alcool et CO₂. Maintiens 18-20°C : trop chaud, elle stresse et produit des arômes indésirables. La fermentation est finie quand la densité est stable, pas à une date fixe.',
    plannedDurationMin: null,
  },
  [RecipeStepType.PACKAGING]: {
    pedagogicalTip:
      "À l'embouteillage, on ajoute une dose précise de sucre (priming) pour la carbonatation : trop de sucre et les bouteilles explosent. Désinfecte les bouteilles, remplis, capsule, puis laisse conditionner ~2 semaines.",
    plannedDurationMin: null,
  },
};

/**
 * Returns the pedagogical guidance for a brewing step type, or `undefined` for
 * an unknown / unsupported type (graceful: the step then carries no tip/timer).
 */
export function getStepGuidance(
  type: RecipeStepType,
): StepGuidance | undefined {
  return STEP_TYPE_GUIDANCE[type];
}
