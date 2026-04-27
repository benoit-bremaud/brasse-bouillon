/**
 * Maps a beer's EBC value (European Brewery Convention) to a hex
 * colour suitable for the BeerInfoCardScreen hero background. Lets
 * the same Punk IPA show up as amber-orange on the hero, La Chouffe
 * as a paler amber, and Rochefort 10 as a deep dark brown — making
 * the visual identity of each beer instantly recognisable in the
 * scan flow.
 *
 * The palette mirrors the SRM/EBC reference table used in the
 * Couleur calculator's "Palette" tab so a user comparing the
 * calculator and the info card sees a coherent colour story.
 *
 * The function picks the closest reference stop and returns its hex
 * code (no interpolation — keeps the output deterministic and the
 * palette readable).
 */

interface PaletteStop {
  ebc: number;
  hex: string;
}

/**
 * Reference stops anchored on canonical SRM rows converted to EBC
 * (`EBC ≈ SRM × 1.97`). Sorted ascending by EBC so a binary-style
 * scan finds the closest stop in O(n).
 */
const PALETTE: ReadonlyArray<PaletteStop> = [
  { ebc: 2, hex: "#F8F753" }, // Pale straw
  { ebc: 4, hex: "#F6F513" }, // Straw
  { ebc: 6, hex: "#EAE615" }, // Pale gold
  { ebc: 8, hex: "#E0D01B" }, // Deep gold
  { ebc: 12, hex: "#D5B521" }, // Pale amber
  { ebc: 16, hex: "#C18024" }, // Amber
  { ebc: 20, hex: "#BE7C2A" }, // Deep amber
  { ebc: 26, hex: "#BB6826" }, // Light copper
  { ebc: 33, hex: "#B26C2C" }, // Copper
  { ebc: 39, hex: "#A35E2A" }, // Deep copper
  { ebc: 47, hex: "#8B4524" }, // Light brown
  { ebc: 57, hex: "#6F2F1C" }, // Brown
  { ebc: 69, hex: "#5D341A" }, // Deep brown
  { ebc: 79, hex: "#4E2A17" }, // Very deep brown
  { ebc: 138, hex: "#26110A" }, // Black
];

const FALLBACK_HEX = "#B7824B"; // colors.brand.primary — neutral when EBC null

/**
 * Returns a CSS hex colour for the given EBC value. Returns the
 * brand primary when EBC is unknown / NaN / negative so the hero
 * still renders something brand-coherent rather than a glitched
 * background.
 */
export function ebcToHex(ebc: number | null): string {
  if (ebc == null || Number.isNaN(ebc) || ebc < 0) {
    return FALLBACK_HEX;
  }

  let closest = PALETTE[0];
  let minDelta = Math.abs(ebc - closest.ebc);
  for (const stop of PALETTE) {
    const delta = Math.abs(ebc - stop.ebc);
    if (delta < minDelta) {
      minDelta = delta;
      closest = stop;
    }
  }
  return closest.hex;
}

/**
 * Returns the hex colour the foreground (text, chips) should use to
 * stay readable on top of the hero background. White for darker
 * beers, near-black for pale ones — the threshold approximates a
 * WCAG AA contrast minimum without measuring it precisely.
 */
export function foregroundOnEbc(ebc: number | null): string {
  if (ebc == null || Number.isNaN(ebc) || ebc < 0) {
    return "#FFFFFF";
  }
  return ebc <= 18 ? "#1E1E1E" : "#FFFFFF";
}
