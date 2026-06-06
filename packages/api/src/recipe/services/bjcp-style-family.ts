/**
 * BJCP style-family classification for recipe-matching v2 (ADR-0016 D2).
 *
 * The matcher receives **free-text style strings** (from the scanned beer and
 * from community recipes), not catalog ids — so the family/tier grouping lives
 * here in code (the "alias en code" decision), NOT as a DB lookup. The family
 * and tier values **mirror** the encyclopedia seed
 * (`packages/beer-encyclopedia/scripts/seed_styles.py`, PR #1204) so both sides
 * agree on what "same family" means; this module adds free-text synonyms
 * (FR/EN) and accent folding on top.
 *
 * Graded similarity replaces the old name-only `scoreStyle` (exact/substring):
 *   1.0  same canonical style
 *   0.7  same BJCP family       (e.g. Blonde Ale ≈ Kölsch ≈ Saison → Pale Ale)
 *   0.4  same colour + strength tier (a pale-standard ale vs a pale-standard lager)
 *   0    otherwise
 *   null when either side is unclassifiable/absent → the criterion drops out of
 *        the weighted match (Gower renormalisation), never a penalty.
 */

export type ColourTier = 'pale' | 'amber' | 'dark';
export type StrengthTier = 'standard' | 'strong';

export interface StyleClassification {
  /** Canonical style key — distinct styles in the same family differ here. */
  readonly canonical: string;
  /** BJCP family (mirrors seed_styles.py). */
  readonly family: string;
  readonly colourTier: ColourTier;
  readonly strengthTier: StrengthTier;
}

interface StyleDefinition extends StyleClassification {
  /** Folded synonyms (lowercase, accent-free) that resolve to this style. */
  readonly aliases: readonly string[];
}

/**
 * Fold a free-text style to a comparison key: NFD-decompose, strip diacritics,
 * lowercase, trim, collapse inner whitespace. So "Bière Blonde à l'Ancienne"
 * and "biere blonde a l'ancienne" compare equal.
 */
export const foldStyleKey = (style: string): string =>
  style
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // strip combining diacritics (accent folding)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

/**
 * Style catalogue. Families + tiers track seed_styles.py for the 15 seeded
 * styles; `kolsch` and `witbier` are added as distinct canonicals for common
 * free-text labels (same family as their cousins → graded 0.7, not 1.0).
 */
const STYLE_DEFINITIONS: readonly StyleDefinition[] = [
  {
    canonical: 'blonde_ale',
    family: 'Pale Ale',
    colourTier: 'pale',
    strengthTier: 'standard',
    aliases: [
      'blonde ale',
      'blonde',
      'biere blonde',
      "biere blonde a l'ancienne",
      'golden ale',
      'belgian blonde',
      'blonde belge',
    ],
  },
  {
    canonical: 'saison',
    family: 'Pale Ale',
    colourTier: 'pale',
    strengthTier: 'standard',
    aliases: ['saison', 'farmhouse', 'farmhouse ale'],
  },
  {
    canonical: 'kolsch',
    family: 'Pale Ale',
    colourTier: 'pale',
    strengthTier: 'standard',
    aliases: ['kolsch', 'koelsch'],
  },
  {
    canonical: 'ipa',
    family: 'IPA',
    colourTier: 'pale',
    strengthTier: 'standard',
    aliases: [
      'ipa',
      'india pale ale',
      'neipa',
      'ne ipa',
      'new england ipa',
      'hazy ipa',
      'american ipa',
      'double ipa',
      'dipa',
      'session ipa',
      'white ipa',
    ],
  },
  {
    canonical: 'pilsner',
    family: 'Pale Lager',
    colourTier: 'pale',
    strengthTier: 'standard',
    aliases: [
      'pilsner',
      'pils',
      'pilsener',
      'bohemian pilsner',
      'czech pilsner',
      'german pilsner',
    ],
  },
  {
    canonical: 'lager',
    family: 'Pale Lager',
    colourTier: 'pale',
    strengthTier: 'standard',
    aliases: [
      'lager',
      'pale lager',
      'international pale lager',
      'helles',
      'munich helles',
      'blonde lager',
    ],
  },
  {
    canonical: 'hefeweizen',
    family: 'Wheat Beer',
    colourTier: 'pale',
    strengthTier: 'standard',
    aliases: ['hefeweizen', 'weissbier', 'weizen', 'hefe', 'weiss'],
  },
  {
    canonical: 'wheat',
    family: 'Wheat Beer',
    colourTier: 'pale',
    strengthTier: 'standard',
    aliases: ['wheat', 'wheat beer', 'american wheat', 'biere de ble'],
  },
  {
    canonical: 'witbier',
    family: 'Wheat Beer',
    colourTier: 'pale',
    strengthTier: 'standard',
    aliases: ['witbier', 'wit', 'blanche', 'biere blanche', 'belgian white'],
  },
  {
    canonical: 'amber_ale',
    family: 'Amber Ale',
    colourTier: 'amber',
    strengthTier: 'standard',
    aliases: [
      'amber ale',
      'ambree',
      'biere ambree',
      'red ale',
      'irish red ale',
    ],
  },
  {
    canonical: 'dubbel',
    family: 'Belgian Ale',
    colourTier: 'amber',
    strengthTier: 'standard',
    aliases: ['belgian dubbel', 'dubbel', 'abbey dubbel'],
  },
  {
    canonical: 'tripel',
    family: 'Strong Belgian Ale',
    colourTier: 'pale',
    strengthTier: 'strong',
    aliases: ['belgian tripel', 'tripel', 'triple', 'abbey tripel'],
  },
  {
    canonical: 'quadrupel',
    family: 'Strong Belgian Ale',
    colourTier: 'dark',
    strengthTier: 'strong',
    aliases: ['belgian quadrupel', 'quadrupel', 'quad', 'abt'],
  },
  {
    canonical: 'barleywine',
    family: 'Strong Ale',
    colourTier: 'dark',
    strengthTier: 'strong',
    aliases: ['barleywine', 'barley wine', "vin d'orge"],
  },
  {
    canonical: 'porter',
    family: 'Porter',
    colourTier: 'dark',
    strengthTier: 'standard',
    aliases: ['porter', 'baltic porter', 'brown porter', 'robust porter'],
  },
  {
    canonical: 'stout',
    family: 'Stout',
    colourTier: 'dark',
    strengthTier: 'standard',
    aliases: [
      'stout',
      'dry stout',
      'irish stout',
      'imperial stout',
      'russian imperial stout',
      'oatmeal stout',
      'milk stout',
    ],
  },
  {
    canonical: 'sour',
    family: 'Sour Ale',
    colourTier: 'amber',
    strengthTier: 'standard',
    aliases: [
      'sour ale',
      'sour',
      'gose',
      'berliner weisse',
      'lambic',
      'gueuze',
      'acidulee',
    ],
  },
];

const ALIAS_INDEX: ReadonlyMap<string, StyleClassification> = (() => {
  const index = new Map<string, StyleClassification>();
  for (const def of STYLE_DEFINITIONS) {
    const classification: StyleClassification = {
      canonical: def.canonical,
      family: def.family,
      colourTier: def.colourTier,
      strengthTier: def.strengthTier,
    };
    for (const alias of def.aliases) {
      index.set(foldStyleKey(alias), classification);
    }
  }
  return index;
})();

/**
 * Resolve a free-text style to its BJCP classification, or `null` when the
 * label is empty or matches no known style/alias.
 */
export const normalizeStyle = (
  style: string | null | undefined,
): StyleClassification | null => {
  if (!style) {
    return null;
  }
  const key = foldStyleKey(style);
  if (!key) {
    return null;
  }
  return ALIAS_INDEX.get(key) ?? null;
};

/**
 * Graded style similarity in `{1.0, 0.7, 0.4, 0}`, or `null` when either side
 * is absent/unclassifiable (so the caller drops the criterion rather than
 * penalising an unknown style). When both sides are unclassifiable but their
 * folded labels are identical, returns `1.0` (a literal match still counts).
 */
export const styleSimilarity = (
  beerStyle: string | null | undefined,
  recipeStyle: string | null | undefined,
): number | null => {
  const a = normalizeStyle(beerStyle);
  const b = normalizeStyle(recipeStyle);

  if (a && b) {
    if (a.canonical === b.canonical) {
      return 1;
    }
    if (a.family === b.family) {
      return 0.7;
    }
    if (a.colourTier === b.colourTier && a.strengthTier === b.strengthTier) {
      return 0.4;
    }
    return 0;
  }

  // At least one side is unclassifiable: don't penalise an unknown style —
  // only honour a literal (folded) match, otherwise drop the criterion.
  const foldedBeer = beerStyle ? foldStyleKey(beerStyle) : '';
  const foldedRecipe = recipeStyle ? foldStyleKey(recipeStyle) : '';
  if (foldedBeer && foldedRecipe && foldedBeer === foldedRecipe) {
    return 1;
  }
  return null;
};
