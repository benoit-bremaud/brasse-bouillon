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

import { fetchMatchingRecipes } from "@/features/scan/data/recipe-matching.api";
import type {
  ScanCatalogItem,
  ScanMatchingResult,
} from "@/features/scan/domain/scan.types";
import { getDemoEquivalentRecipes } from "@/mocks/demo-data";

/**
 * Resolve the top-N matching recipes for a given recognised beer.
 *
 * Accepts the full `ScanCatalogItem` so the use-case has both the
 * `barcode` (demo lookup key) and the `id` (backend lookup key)
 * without forcing the caller to pick the right one upstream.
 */
export async function getMatchingRecipes(
  beer: Pick<ScanCatalogItem, "id" | "barcode">,
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

  return fetchMatchingRecipes(beer.id);
}
