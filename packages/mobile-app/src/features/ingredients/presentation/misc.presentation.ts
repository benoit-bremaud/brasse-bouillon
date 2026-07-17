/**
 * French labels for the BeerXML `<MISC>` enums.
 *
 * The catalog serves these raw (`fining`, `water_agent`, `boil`), which is
 * fine for a spec but not for a novice: "water_agent" tells them nothing.
 * Shared by the category list and the datasheet so a misc reads the same
 * wherever it appears — the list rendered raw values while the fiche
 * translated them, which is exactly the drift this module prevents.
 */
const MISC_TYPE_LABELS: Record<string, string> = {
  spice: "Épice",
  fining: "Clarifiant",
  water_agent: "Sel d'eau",
  herb: "Plante",
  flavor: "Arôme",
  other: "Autre",
};

const MISC_USE_LABELS: Record<string, string> = {
  mash: "Empâtage",
  boil: "Ébullition",
  primary: "Fermentation primaire",
  secondary: "Fermentation secondaire",
  bottling: "Embouteillage",
};

function translate(
  raw: string | undefined,
  labels: Record<string, string>,
): string | null {
  if (!raw) {
    return null;
  }
  // Fall back to the raw value rather than dropping it: an enum the catalog
  // adds before this map knows it is still information, and hiding it would
  // make the ingredient look incomplete.
  return labels[raw.trim().toLocaleLowerCase()] ?? raw;
}

/** e.g. `"fining"` → `"Clarifiant"`; unknown values pass through. */
export function getMiscTypeLabel(miscType?: string): string | null {
  return translate(miscType, MISC_TYPE_LABELS);
}

/** e.g. `"boil"` → `"Ébullition"`; unknown values pass through. */
export function getMiscUseLabel(useAt?: string): string | null {
  return translate(useAt, MISC_USE_LABELS);
}
