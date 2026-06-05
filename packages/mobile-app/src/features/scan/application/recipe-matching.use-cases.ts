/**
 * Use-case for the recipe-matching feature on the scan info card
 * (Issue #700 — mobile UI consumer of Issue #699's API).
 *
 * Branches on `dataSource.useDemoData`:
 *
 * - **demo mode** (`EXPO_PUBLIC_USE_DEMO_DATA=true`) — reads from
 *   the curated `demoEquivalentRecipes` mock keyed by barcode.
 *   Returns `lowConfidence: false` because the demo set is
 *   editorially curated to always have at least one strong match.
 *
 * - **backend mode** — calls `GET /recipes/match/:beerId` via the
 *   `recipe-matching.api` data layer. Pass-through on the envelope
 *   shape: API `low_confidence` (snake_case) → UI `lowConfidence`.
 *
 * Both branches return the same `ScanMatchingResult` envelope so
 * the presentation layer doesn't have to know which mode it's in.
 */
import { dataSource } from "@/core/data/data-source";

import { SCAN_STYLE_PLACEHOLDER } from "@/features/scan/data/beers-import.api";
import { fetchMatchingRecipes } from "@/features/scan/data/recipe-matching.api";
import type {
  ScanCatalogItem,
  ScanMatchingResult,
} from "@/features/scan/domain/scan.types";
import { getDemoEquivalentRecipes } from "@/mocks/demo-data";

/**
 * Resolve the top-N matching recipes for a given recognised beer.
 *
 * Accepts the `barcode` (demo lookup key) plus the matching
 * characteristics (`style`/`abv`/`ibu`/`colorEbc`) the backend scores
 * against. The match no longer keys off the `scan_catalog_items` id, so
 * it works for beers resolved from the encyclopedia (scan cutover
 * #1186).
 */
export async function getMatchingRecipes(
  beer: Pick<ScanCatalogItem, "barcode" | "style" | "abv" | "ibu" | "colorEbc">,
): Promise<ScanMatchingResult> {
  if (dataSource.useDemoData) {
    const rankings = getDemoEquivalentRecipes(beer.barcode);
    return {
      rankings,
      // The demo set is curated — when we have at least one match,
      // it's by construction relevant. When the barcode isn't in
      // the demo map (rankings empty) the warning IS appropriate.
      lowConfidence: rankings.length === 0,
    };
  }

  return fetchMatchingRecipes({
    // "Style inconnu" is a display placeholder, not a real style — send
    // null so the matcher renormalises rather than scoring it as a
    // present-but-mismatched style (Codex P2 on #1190).
    style: beer.style === SCAN_STYLE_PLACEHOLDER ? null : beer.style,
    abv: beer.abv,
    ibu: beer.ibu,
    colorEbc: beer.colorEbc,
  });
}
