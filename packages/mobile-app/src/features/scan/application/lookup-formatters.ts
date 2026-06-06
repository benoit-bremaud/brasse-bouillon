/**
 * Pure formatters that turn the technical metrics returned by
 * `lookupBeerByBarcode` (numeric ABV / IBU / EBC) into French words
 * the BeerInfoCardScreen surfaces under "Style / Couleur / Amertume".
 *
 * Per the issue #698 acceptance criteria and persona Léa la Curieuse:
 * the at-a-glance row uses words, not numbers. Numbers stay
 * available for users who open the "Détails techniques" fold.
 *
 * All thresholds are deterministic, locale-stable, and easy to
 * tweak — no backend lookup, no localisation hop.
 */

const UNKNOWN = "Inconnu";

/**
 * Beer color buckets keyed on EBC (European Brewery Convention).
 * Boundaries chosen to match the Couleur calculator palette tab
 * already in the app (so the at-a-glance word matches the hero
 * background colour the user sees).
 *
 *  EBC      | Word
 *  ---------+-------------
 *   0–6     | Très claire
 *   7–10    | Blonde
 *  11–18    | Ambrée
 *  19–30    | Cuivrée
 *  31–45    | Brune
 *  46–80    | Brune foncée
 *  81+      | Noire
 */
export function ebcToColorWord(ebc: number | null): string {
  if (ebc == null || Number.isNaN(ebc) || ebc < 0) {
    return UNKNOWN;
  }
  if (ebc <= 6) return "Très claire";
  if (ebc <= 10) return "Blonde";
  if (ebc <= 18) return "Ambrée";
  if (ebc <= 30) return "Cuivrée";
  if (ebc <= 45) return "Brune";
  if (ebc <= 80) return "Brune foncée";
  return "Noire";
}

/**
 * Bitterness buckets keyed on IBU (International Bitterness Units).
 * Buckets sized so a Pilsner (~25 IBU), Pale Ale (~35 IBU), IPA
 * (~50 IBU), and Imperial IPA (~80 IBU) each fall in a distinct
 * category that a non-expert can still parse.
 *
 *  IBU      | Word
 *  ---------+----------------------
 *   0–10    | Très peu amère
 *  11–25    | Légèrement amère
 *  26–40    | Modérément amère
 *  41–60    | Marquée
 *  61–90    | Intense
 *  91+      | Extrême
 */
export function ibuToBitternessWord(ibu: number | null): string {
  if (ibu == null || Number.isNaN(ibu) || ibu < 0) {
    return UNKNOWN;
  }
  if (ibu <= 10) return "Très peu amère";
  if (ibu <= 25) return "Légèrement amère";
  if (ibu <= 40) return "Modérément amère";
  if (ibu <= 60) return "Marquée";
  if (ibu <= 90) return "Intense";
  return "Extrême";
}

/**
 * ABV buckets keyed on alcohol percentage. Helps the at-a-glance row
 * surface the "drinkability" cue alongside the raw percentage.
 *
 *  ABV %     | Word
 *  ----------+----------------
 *   < 0.5    | Sans alcool
 *  0.5–3.5   | Légère
 *  3.6–5.5   | De session
 *  5.6–7.5   | Standard
 *  7.6–10    | Forte
 *  10.1+     | Très forte
 */
export function abvToStrengthWord(abv: number | null): string {
  if (abv == null || Number.isNaN(abv) || abv < 0) {
    return UNKNOWN;
  }
  if (abv < 0.5) return "Sans alcool";
  if (abv <= 3.5) return "Légère";
  if (abv <= 5.5) return "De session";
  if (abv <= 7.5) return "Standard";
  if (abv <= 10) return "Forte";
  return "Très forte";
}

/**
 * Render an ADR-0017 [min, max] interval for display: a single value
 * when the bounds coincide ("20"), a dash-joined range otherwise
 * ("20–28"). A single known bound renders on its own. The scalar
 * `fallback` stands in only when neither bound is known (mock/demo
 * items that carry just a scalar) — never paired with a real bound,
 * which would fabricate a misleading range. Returns null when nothing
 * is known.
 */
export function formatInterval(
  min: number | null | undefined,
  max: number | null | undefined,
  fallback: number | null,
): string | null {
  if (min == null && max == null) {
    return fallback == null ? null : String(fallback);
  }
  const lo = min ?? max;
  const hi = max ?? min;
  return lo === hi ? String(lo) : `${lo}–${hi}`;
}
