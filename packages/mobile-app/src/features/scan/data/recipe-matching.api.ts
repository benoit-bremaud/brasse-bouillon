/**
 * Data layer for the backend `GET /recipes/match/:beerId` endpoint
 * (Issue #699 — full matching algorithm with low_confidence flag).
 *
 * Mirrors the api response shape `RankedRecipeResponseDto` and
 * normalizes the snake_case wire fields to camelCase. Use-case
 * orchestration (demo data branching, error handling) lives in
 * `application/recipe-matching.use-cases.ts`.
 */
import { request } from "@/core/http/http-client";

import type { ScanMatchingResult, ScanRecipeMatch } from "../domain/scan.types";

/**
 * Wire shape — single ranked recipe carried inside the envelope.
 * The backend embeds the full ORM row, but the mobile UI only
 * needs a curated subset.
 */
type RankedRecipeWireDto = {
  recipe: {
    id: string;
    name: string;
    style?: string | null;
    avg_rating?: number | null;
    brew_count: number;
    is_official: boolean;
    owner_id: string;
    // Other fields are present in the wire response but not
    // consumed by the matching UI; intentionally omitted to keep
    // the contract narrow.
  };
  score: number;
};

type MatchingResponseWireDto = {
  rankings: RankedRecipeWireDto[];
  low_confidence: boolean;
};

/**
 * Map a single wire row to the mobile `ScanRecipeMatch` shape used
 * across the scan presentation layer. `recipeId` carries the
 * backend UUID so the UI can navigate / import via
 * `POST /recipes/import-from-community/:id`. `brewer` is derived
 * from the owner — for the v0.1 seed all curated PUBLIC recipes
 * carry the system sentinel UUID, which we surface as the
 * generic "Communauté Brasse-Bouillon" attribution. Per-author
 * attribution will land with the community v0.2 work.
 */
function mapRankedRecipe(dto: RankedRecipeWireDto): ScanRecipeMatch {
  return {
    recipeId: dto.recipe.id,
    publicRecipeId: dto.recipe.id,
    name: dto.recipe.name,
    brewer: "Communauté Brasse-Bouillon",
    rating: dto.recipe.avg_rating ?? 0,
    brewedCount: dto.recipe.brew_count,
    score: dto.score,
    isOfficial: dto.recipe.is_official,
    style: dto.recipe.style ?? undefined,
  };
}

/**
 * The recognised beer's characteristics the matcher scores against.
 * Source-agnostic: the values come from the scanned beer (encyclopedia
 * or NestJS), not a `scan_catalog_items` id — so matching keeps working
 * after the scan cutover (#1186). See
 * docs/architecture/diagrams/recipes/06-sequence-recipe-matching.md.
 */
export interface BeerMatchCharacteristics {
  style: string | null;
  abv: number | null;
  ibu: number | null;
  colorEbc: number | null;
}

/**
 * Fetch the top-N recipes that best match the given beer
 * characteristics, plus the `low_confidence` flag the API computes when
 * the best match is genuinely below the threshold (per brainstorm
 * scan-2026-04-24 §3.4 + Codex P1 fix on PR #792).
 *
 * POSTs the characteristics to `/recipes/match` instead of keying off a
 * `scan_catalog_items` id — required once the scan resolves beers from
 * the encyclopedia (#1186). Missing values are omitted; the API
 * renormalises the weights.
 *
 * Throws on transport or HTTP errors — the use-case layer is
 * responsible for translating those into UI-facing error messages.
 */
export async function fetchMatchingRecipes(
  characteristics: BeerMatchCharacteristics,
): Promise<ScanMatchingResult> {
  const data = await request<MatchingResponseWireDto>("/recipes/match", {
    method: "POST",
    body: {
      style: characteristics.style ?? undefined,
      abv: characteristics.abv ?? undefined,
      ibu: characteristics.ibu ?? undefined,
      colorEbc: characteristics.colorEbc ?? undefined,
    },
  });
  return {
    rankings: data.rankings.map(mapRankedRecipe),
    lowConfidence: data.low_confidence,
  };
}
