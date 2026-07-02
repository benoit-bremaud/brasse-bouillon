import { RecipeStepType } from '../../../recipe/domain/enums/recipe-step-type.enum';

/**
 * One physical prep gesture of a step's PRÉP phase (F4), with its one-line
 * pedagogical why — the app teaches the craft, a novice must learn to brew
 * alone, not just execute (brew-day/01 + 06, educational vocation).
 */
export interface StepPrepAction {
  readonly action: string;
  readonly why: string;
}

/**
 * StepGuidance
 *
 * Beginner-facing guidance attached to a batch step at start time, keyed by the
 * brewing step type. Realises the "B1-live" brew-day assistant content: a
 * vulgarised "why" tip, a default planned duration (minutes) and the PRÉP-phase
 * physical gestures, so the mobile step card can show the ⓘ tip, a countdown
 * timer and the pre-start checklist in **live** mode (not only demo data). The
 * recipe-authored `description` is left untouched — this only adds the
 * type-level guidance.
 *
 * MVP source = per-step-type defaults (no recipe↔guidance link yet; that is a
 * later iteration). A `null` duration means "no countdown" (fermentation and
 * packaging run over days, tracked elsewhere).
 */
export interface StepGuidance {
  readonly pedagogicalTip: string;
  /** Default planned duration in minutes, or `null` when not time-boxed. */
  readonly plannedDurationMin: number | null;
  /**
   * Physical prep actions shown in the step's PRÉP phase (F4). Empty when the
   * step needs none (PACKAGING: the richer B3 bottling gate already covers it).
   */
  readonly prepActions: readonly StepPrepAction[];
}

const STEP_TYPE_GUIDANCE: Readonly<Record<RecipeStepType, StepGuidance>> = {
  [RecipeStepType.MASH]: {
    pedagogicalTip:
      "L'empâtage fait infuser le grain concassé dans l'eau chaude (~65-67°C) : les enzymes y convertissent l'amidon en sucres fermentescibles. Plus chaud donne une bière plus ronde, plus froid une bière plus sèche.",
    plannedDurationMin: 60,
    prepActions: [
      {
        action: "Chauffe ~7 L d'eau à ~72 °C (pour ~4 L de bière).",
        why: "Le grain versé fera chuter l'eau de 3-5 °C — on vise 66-67 °C dans la cuve, la température où les enzymes convertissent l'amidon en sucre.",
      },
      {
        action: 'Nettoie et rince la cuve, le sac et les ustensiles.',
        why: "Avant l'ébullition, « propre » suffit : le moût sera stérilisé en bouillant. La désinfection stricte commence après le refroidissement.",
      },
      {
        action: "Verse le grain concassé dans l'eau et mélange bien.",
        why: "Un grumeau sec, c'est de l'amidon que l'eau n'atteint pas : du sucre perdu, une bière plus légère que prévu.",
      },
    ],
  },
  [RecipeStepType.BOIL]: {
    pedagogicalTip:
      "L'ébullition stérilise le moût, isomérise les acides alpha du houblon (l'amertume) et concentre les sucres. Les houblons d'amertume vont tôt, les houblons d'arôme en toute fin d'ébullition.",
    plannedDurationMin: 60,
    prepActions: [
      {
        action:
          'Retire le sac de grain et laisse-le égoutter, en pressant doucement.',
        why: "Le sac ne doit pas cuire dans l'ébullition ; presser récupère du moût sucré, mais trop fort, le grain chaud relâche de l'astringence.",
      },
      {
        action: 'Monte le moût à ébullition franche, sans couvercle.',
        why: "À découvert, le DMS — un composé soufré au goût de maïs cuit — s'évapore au lieu de retomber dans le moût.",
      },
      {
        action: 'Prépare tes doses de houblon, chacune avec son horaire.',
        why: "Houblon tôt = amertume, houblon tard = arôme. En pleine ébullition tu n'auras pas le temps de peser : tout doit être prêt.",
      },
    ],
  },
  [RecipeStepType.WHIRLPOOL]: {
    pedagogicalTip:
      "Le whirlpool fait tourner le moût pour rassembler les résidus (le trub) au centre, puis on refroidit vite avant d'ensemencer la levure. À partir d'ici, tout ce qui touche le moût refroidi doit être désinfecté.",
    plannedDurationMin: 15,
    prepActions: [
      {
        action: 'Coupe le feu et remue le moût en cercle.',
        why: 'Le tourbillon rassemble le trub (protéines et houblon) en cône au centre : tu transféreras un moût plus clair.',
      },
      {
        action:
          "Prépare ton refroidissement (serpentin désinfecté ou bain d'eau glacée).",
        why: 'Chaque minute où le moût reste tiède est une porte ouverte aux microbes : tout doit être prêt avant de refroidir.',
      },
    ],
  },
  [RecipeStepType.FERMENTATION]: {
    pedagogicalTip:
      'La levure transforme les sucres en alcool et CO₂. Maintiens 18-20°C : trop chaud, elle stresse et produit des arômes indésirables. La fermentation est finie quand la densité est stable, pas à une date fixe.',
    plannedDurationMin: null,
    prepActions: [
      {
        action: 'Refroidis le moût à ~20 °C, aussi vite que possible.',
        why: "Ensemencée trop chaud, la levure stresse ou meurt et produit des faux-goûts ; refroidir vite limite aussi le risque d'infection.",
      },
      {
        action:
          'Désinfecte le fermenteur, le barboteur et tout ce qui touchera le moût.',
        why: "Le moût ne sera plus jamais bouilli : à partir d'ici, le moindre microbe s'y installe plus vite que la levure.",
      },
      {
        action: "Transfère le moût en l'aérant, puis ensemence la levure.",
        why: "C'est le seul moment où l'oxygène est utile — la levure en a besoin pour se multiplier. Après, il ne ferait qu'oxyder la bière.",
      },
      {
        action:
          "Pose le barboteur et place le fermenteur entre 18 et 20 °C, à l'abri de la lumière.",
        why: 'Une température stable donne un profil propre ; la lumière réagit avec le houblon et donne un goût de renfermé (« lightstruck »).',
      },
    ],
  },
  [RecipeStepType.PACKAGING]: {
    pedagogicalTip:
      "À l'embouteillage, on ajoute une dose précise de sucre (priming) pour la carbonatation : trop de sucre et les bouteilles explosent. Désinfecte les bouteilles, remplis, capsule, puis laisse conditionner ~2 semaines.",
    plannedDurationMin: null,
    // No PRÉP actions: the bottling flow already carries the richer B3 gate
    // (sanitize bottles + priming + bottle-bomb checkbox) — never duplicated.
    prepActions: [],
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
