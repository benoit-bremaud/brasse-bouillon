import {
  HopProduct,
  HopSpecGroup,
} from "@/features/ingredients/domain/hop.types";
import {
  Ingredient,
  IngredientCategory,
  IngredientCategorySummary,
  IngredientFilters,
} from "@/features/ingredients/domain/ingredient.types";
import {
  MaltProduct,
  MaltSpecGroup,
} from "@/features/ingredients/domain/malt.types";
import {
  YeastProduct,
  YeastSpecGroup,
} from "@/features/ingredients/domain/yeast.types";

import { dataSource } from "@/core/data/data-source";
import {
  getMiscDetailsApi,
  listMiscApi,
  type MiscProduct,
} from "@/features/ingredients/data/misc.api";
import { demoIngredients, demoMalts } from "@/mocks/demo-data";
import {
  getHopDetails,
  listHops,
} from "@/features/ingredients/application/hops.use-cases";
import {
  getMaltDetails,
  listMalts,
} from "@/features/ingredients/application/malts.use-cases";
import {
  getYeastDetails,
  listYeasts,
} from "@/features/ingredients/application/yeasts.use-cases";

/**
 * Polymorphic ingredient catalogue use-cases for the `ShopScreen` hub
 * (the catalog's single door) + `IngredientCategoryScreen` picker.
 *
 * Live-mode dispatch (Issue #887): every per-category list/details
 * call delegates to the dedicated per-category use-case
 * (`listMalts/Hops/Yeasts` + `getMaltDetails/Hop/Yeast`). Those
 * use-cases handle their own `dataSource.useDemoData` branching
 * and consume the real `/catalog/*` endpoints in live mode.
 *
 * Demo-mode dispatch (preserved): same as before, the polymorphic
 * surface reads from `demoIngredients` + `demoMalts` directly so
 * the soutenance demo path stays untouched.
 *
 * The type adapter functions below convert the per-category
 * domain shapes (`MaltProduct/HopProduct/YeastProduct` with
 * `specGroups`) to the `Ingredient` union type (with flat
 * numeric fields). Parsing logic mirrors the per-category
 * use-case parsers (`getColorEbc`, `getAlphaAcid`,
 * `getAttenuation`) — substring match on row labels in
 * English (codebase stays EN until i18n work begins).
 */

/**
 * Twin of the guard in `presentation/ingredient-category.constants.ts`, which
 * this layer must not import (application never depends on presentation) while
 * `domain/` is types-only by convention. Both lists must grow together: a stale
 * copy here is invisible to `tsc` — a shorter `readonly IngredientCategory[]`
 * is still a valid one — so it fails silently, not loudly.
 */
function isIngredientCategory(value: string): value is IngredientCategory {
  const categories: readonly IngredientCategory[] = [
    "malt",
    "hop",
    "yeast",
    "misc",
  ];
  return categories.includes(value as IngredientCategory);
}

function normalizeSearch(search?: string): string {
  return search?.trim().toLocaleLowerCase() ?? "";
}

function parseNumericValue(value: string): number | null {
  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRangeAverage(value: string): number | null {
  if (!value.includes("-")) {
    return parseNumericValue(value);
  }

  const [minRaw, maxRaw] = value.split("-");
  const minValue = parseNumericValue(minRaw);
  const maxValue = parseNumericValue(maxRaw);

  if (minValue === null || maxValue === null) {
    return null;
  }

  return (minValue + maxValue) / 2;
}

function findRowValueByLabel(
  groups: readonly { rows: readonly { label: string; value: string }[] }[],
  labelToken: string,
): string | null {
  const normalizedToken = labelToken.toLocaleLowerCase();
  for (const group of groups) {
    for (const row of group.rows) {
      if (row.label.toLocaleLowerCase().includes(normalizedToken)) {
        return row.value;
      }
    }
  }

  return null;
}

function findRangeFromGroups(
  groups:
    | readonly MaltSpecGroup[]
    | readonly HopSpecGroup[]
    | readonly YeastSpecGroup[],
  labelToken: string,
): { min: number; max: number } | null {
  const value = findRowValueByLabel(groups, labelToken);
  if (!value) {
    return null;
  }

  if (value.includes("-")) {
    const [minRaw, maxRaw] = value.split("-");
    const min = parseNumericValue(minRaw);
    const max = parseNumericValue(maxRaw);
    if (min === null || max === null) {
      return null;
    }
    return { min, max };
  }

  const single = parseNumericValue(value);
  if (single === null) {
    return null;
  }
  return { min: single, max: single };
}

function normalizeMaltType(
  raw?: string,
): "base" | "caramel" | "roasted" | "specialty" {
  const normalized = raw?.trim().toLocaleLowerCase() ?? "";
  if (normalized.includes("caramel") || normalized.includes("crystal")) {
    return "caramel";
  }
  if (normalized.includes("roast") || normalized.includes("chocolate")) {
    return "roasted";
  }
  if (
    normalized.includes("base") ||
    normalized.includes("pilsen") ||
    normalized.includes("pale")
  ) {
    return "base";
  }
  return "specialty";
}

function maltToIngredient(malt: MaltProduct): Ingredient {
  const ebcValue = findRowValueByLabel(malt.specGroups, "color");
  const ebc = ebcValue ? (parseRangeAverage(ebcValue) ?? 0) : 0;
  const potentialValue = findRowValueByLabel(
    malt.specGroups,
    "potential gravity",
  );
  const potentialSg = potentialValue
    ? (parseRangeAverage(potentialValue) ?? 1.03)
    : 1.03;

  return {
    id: malt.id,
    name: malt.name,
    category: "malt",
    maltType: normalizeMaltType(malt.maltType),
    ebc,
    potentialSg,
    maxPercent: 100,
    origin: malt.originCountry,
    notes: malt.description,
  };
}

function normalizeHopForm(raw: string | undefined): "pellet" | "whole" {
  const normalized = raw?.trim().toLocaleLowerCase() ?? "";
  return normalized.includes("leaf") || normalized.includes("whole")
    ? "whole"
    : "pellet";
}

function getHopFormFromSpecGroups(hop: HopProduct): string | undefined {
  return findRowValueByLabel(hop.specGroups, "form") ?? undefined;
}

function normalizeHopUse(raw?: string): "bittering" | "aroma" | "dual" {
  const normalized = raw?.trim().toLocaleLowerCase() ?? "";
  if (normalized.includes("bittering")) {
    return "bittering";
  }
  if (normalized === "both" || normalized.includes("dual")) {
    return "dual";
  }
  return "aroma";
}

function hopToIngredient(hop: HopProduct): Ingredient {
  const alphaValue = findRowValueByLabel(hop.specGroups, "alpha");
  const alphaAcid = alphaValue ? (parseRangeAverage(alphaValue) ?? 0) : 0;
  const betaValue = findRowValueByLabel(hop.specGroups, "beta");
  const betaAcid = betaValue ? (parseRangeAverage(betaValue) ?? 0) : 0;

  return {
    id: hop.id,
    name: hop.name,
    category: "hop",
    form: normalizeHopForm(getHopFormFromSpecGroups(hop)),
    hopUse: normalizeHopUse(hop.hopType),
    alphaAcid,
    betaAcid,
    origin: hop.originCountry,
    notes: hop.description,
  };
}

function normalizeYeastType(
  raw?: string,
): "ale" | "lager" | "wheat" | "belgian" {
  const normalized = raw?.trim().toLocaleLowerCase() ?? "";
  if (normalized === "lager") {
    return "lager";
  }
  if (normalized === "wheat") {
    return "wheat";
  }
  if (normalized === "wine" || normalized === "champagne") {
    return "belgian";
  }
  return "ale";
}

function normalizeFlocculation(raw?: string): "low" | "medium" | "high" {
  const normalized = raw?.trim().toLocaleLowerCase() ?? "";
  if (normalized === "low") {
    return "low";
  }
  if (normalized === "high" || normalized === "very_high") {
    return "high";
  }
  return "medium";
}

function yeastToIngredient(yeast: YeastProduct): Ingredient {
  const attenuationValue = findRowValueByLabel(yeast.specGroups, "attenuation");
  const attenuationCenter = attenuationValue
    ? (parseRangeAverage(attenuationValue) ?? 75)
    : 75;
  const tempRange =
    findRangeFromGroups(yeast.specGroups, "temperature") ??
    ({ min: 18, max: 24 } as const);
  const flocculationValue = findRowValueByLabel(
    yeast.specGroups,
    "flocculation",
  );

  return {
    id: yeast.id,
    name: yeast.name,
    category: "yeast",
    yeastType: normalizeYeastType(yeast.yeastType),
    attenuationMin: Math.max(0, attenuationCenter - 2),
    attenuationMax: Math.min(100, attenuationCenter + 2),
    flocculation: normalizeFlocculation(flocculationValue ?? undefined),
    fermentationMinC: tempRange.min,
    fermentationMaxC: tempRange.max,
    notes: yeast.description,
  };
}

/**
 * Misc is the flattest catalog: no `specGroups` to parse and every field
 * nullable, so this mapper carries values across rather than deriving them.
 */
function miscToIngredient(misc: MiscProduct): Ingredient {
  return {
    id: misc.id,
    name: misc.name,
    category: "misc",
    miscType: misc.miscType,
    useAt: misc.useAt,
    useFor: misc.useFor,
    timeMin: misc.timeMin,
    notes: misc.description,
  };
}

function applyFilters(
  items: Ingredient[],
  category: IngredientCategory,
  filters: IngredientFilters,
): Ingredient[] {
  const search = normalizeSearch(filters.search);

  return items.filter((item) => {
    if (search && !item.name.toLocaleLowerCase().includes(search)) {
      return false;
    }

    if (category === "malt" && item.category === "malt") {
      if (filters.ebcMin !== undefined && item.ebc < filters.ebcMin) {
        return false;
      }
      if (filters.ebcMax !== undefined && item.ebc > filters.ebcMax) {
        return false;
      }
    }

    if (category === "hop" && item.category === "hop") {
      if (
        filters.alphaAcidMin !== undefined &&
        item.alphaAcid < filters.alphaAcidMin
      ) {
        return false;
      }
    }

    if (category === "yeast" && item.category === "yeast") {
      if (
        filters.attenuationMin !== undefined &&
        item.attenuationMax < filters.attenuationMin
      ) {
        return false;
      }
    }

    return true;
  });
}

function getDemoIngredientsByCategory(
  category: IngredientCategory,
): Ingredient[] {
  return demoIngredients.filter((item) => item.category === category);
}

// Both dispatchers below switch exhaustively rather than letting the last
// category fall out of an implicit `else`. They used to end on yeast, so
// adding `misc` to IngredientCategory would silently have served yeasts to
// the Accessoires rayon — green types, wrong data.
async function listLiveIngredientsByCategory(
  category: IngredientCategory,
): Promise<Ingredient[]> {
  switch (category) {
    case "malt": {
      const malts = await listMalts();
      return malts.map(maltToIngredient);
    }
    case "hop": {
      const hops = await listHops();
      return hops.map(hopToIngredient);
    }
    case "yeast": {
      const yeasts = await listYeasts();
      return yeasts.map(yeastToIngredient);
    }
    case "misc": {
      // Straight to the api: misc has no per-type use-case because it has no
      // dedicated filters and no demo-only path of its own — a pass-through
      // module would be indirection for its own sake.
      const miscs = await listMiscApi();
      return miscs.map(miscToIngredient);
    }
  }
}

async function getLiveIngredientDetails(
  category: IngredientCategory,
  ingredientId: string,
): Promise<Ingredient | null> {
  switch (category) {
    case "malt": {
      const malt = await getMaltDetails(ingredientId);
      return malt ? maltToIngredient(malt) : null;
    }
    case "hop": {
      const hop = await getHopDetails(ingredientId);
      return hop ? hopToIngredient(hop) : null;
    }
    case "yeast": {
      const yeast = await getYeastDetails(ingredientId);
      return yeast ? yeastToIngredient(yeast) : null;
    }
    case "misc": {
      const misc = await getMiscDetailsApi(ingredientId);
      return misc ? miscToIngredient(misc) : null;
    }
  }
}

export async function listIngredientCategoriesSummary(): Promise<
  IngredientCategorySummary[]
> {
  if (dataSource.useDemoData) {
    // Count from the SAME source each category list screen consumes,
    // so the Ingredients home counter never drifts from the list it
    // points at (regression guard for #623):
    //   • Malts list → `listMalts()` → demoMalts (10 items)
    //   • Hops list → `listIngredientsByCategory("hop")` → demoIngredients (4 items)
    //   • Yeasts list → `listIngredientsByCategory("yeast")` → demoIngredients (4 items)
    return [
      { category: "malt", count: demoMalts.length },
      {
        category: "hop",
        count: demoIngredients.filter((item) => item.category === "hop").length,
      },
      {
        category: "yeast",
        count: demoIngredients.filter((item) => item.category === "yeast")
          .length,
      },
      {
        category: "misc",
        count: demoIngredients.filter((item) => item.category === "misc")
          .length,
      },
    ];
  }

  // Live mode: count from the per-category catalogue endpoints
  // (the same source `listIngredientsByCategory` consumes below),
  // so the Ingredients home counter stays in sync with the list
  // screens.
  const [malts, hops, yeasts, miscs] = await Promise.all([
    listMalts(),
    listHops(),
    listYeasts(),
    listMiscApi(),
  ]);
  return [
    { category: "malt", count: malts.length },
    { category: "hop", count: hops.length },
    { category: "yeast", count: yeasts.length },
    { category: "misc", count: miscs.length },
  ];
}

export async function listIngredientsByCategory(
  category: IngredientCategory,
  filters: IngredientFilters = {},
): Promise<Ingredient[]> {
  if (dataSource.useDemoData) {
    const categoryItems = getDemoIngredientsByCategory(category);
    return applyFilters(categoryItems, category, filters);
  }

  const categoryItems = await listLiveIngredientsByCategory(category);
  return applyFilters(categoryItems, category, filters);
}

export async function getIngredientDetails(
  category: IngredientCategory,
  ingredientId: string,
): Promise<Ingredient | null> {
  if (!ingredientId) {
    return null;
  }

  if (dataSource.useDemoData) {
    const [categoryFromId] = ingredientId.split("-");
    if (categoryFromId && isIngredientCategory(categoryFromId)) {
      if (categoryFromId !== category) {
        return null;
      }
    }

    return (
      demoIngredients.find(
        (item) => item.id === ingredientId && item.category === category,
      ) ?? null
    );
  }

  return getLiveIngredientDetails(category, ingredientId);
}
