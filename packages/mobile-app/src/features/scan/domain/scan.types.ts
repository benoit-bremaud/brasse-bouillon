export type ScanMatchMethod = "label" | "barcode";

export type ScanMode = "barcode" | "bottle";

export type ScanPhotoCaptureStage = "front" | "back";

export interface ScanConsentPreferences {
  storeBarcodeValue: boolean;
  storeBottlePhotos: boolean;
  storeScanMetadata: boolean;
  useDataForModelTraining: boolean;
}

export interface ScanConsentSettings {
  hasConsent: boolean;
  consentedAtIso: string;
  retentionDays: number;
  preferences: ScanConsentPreferences;
}

export interface ScanAttemptInput {
  barcodeValue?: string | null;
  barcodeType?: string | null;
  frontPhotoUri?: string | null;
  backPhotoUri?: string | null;
  backLabelMissing?: boolean;
  scannedAt?: Date;
}

export interface ScanProductProfile {
  id: string;
  name: string;
  brewery: string;
  style: string;
  format: string;
  abv: number;
  ibu: number;
  colorEbc: number;
  thumbnailUri?: string;
}

export interface ScanProductRecord extends ScanProductProfile {
  barcodeValues: string[];
  labelKeywords: string[];
}

export interface ScanProductDetails {
  productId: string;
  description: string;
  ingredients: string[];
  tastingNotes: string[];
  servingTemperatureCelsius: string;
  foodPairings: string[];
}

export interface ScanRecipeRecommendation {
  recipeId: string;
  recipeName: string;
  equivalencePercent: number;
}

export interface ScanResolvedResult {
  scanId: string;
  status: "matched";
  matchedBy: ScanMatchMethod;
  matchedValue: string;
  scannedAtIso: string;
  product: ScanProductProfile;
  recommendations: ScanRecipeRecommendation[];
}

export interface ScanPendingCapture {
  id: string;
  status: "pending-analysis";
  createdAtIso: string;
  barcodeValue: string | null;
  barcodeType: string | null;
  frontPhotoUri: string | null;
  backPhotoUri: string | null;
  backLabelMissing: boolean;
  consentSnapshot: ScanConsentPreferences;
  metadata: string;
}

export interface ScanProductRepository {
  findByLabel(labelHint: string): Promise<ScanProductRecord | null>;
  findByBarcode(barcodeValue: string): Promise<ScanProductRecord | null>;
  getProductDetails(productId: string): Promise<ScanProductDetails | null>;
}

export interface ScanStorageRepository {
  getConsentSettings(): Promise<ScanConsentSettings | null>;
  saveConsentSettings(settings: ScanConsentSettings): Promise<void>;
  listPendingCaptures(): Promise<ScanPendingCapture[]>;
  savePendingCapture(capture: ScanPendingCapture): Promise<void>;
  removePendingCapture(captureId: string): Promise<void>;
  saveResolvedResult(result: ScanResolvedResult): Promise<void>;
  getResolvedResultById(scanId: string): Promise<ScanResolvedResult | null>;
  purgeAll(): Promise<void>;
}

export type ScanProcessOutcome =
  | {
      type: "matched";
      result: ScanResolvedResult;
    }
  | {
      type: "requires-photo-capture";
      stage: ScanPhotoCaptureStage;
      toastMessage: string;
    }
  | {
      type: "pending";
      capture: ScanPendingCapture;
      toastMessage: string;
    };

export interface ScanResultDetailsViewModel {
  result: ScanResolvedResult;
  details: ScanProductDetails | null;
}

/**
 * Provenance of the data returned by the backend `GET /scan/lookup/:ean`
 * endpoint (Epic #594 chunk #1, backend issue #696).
 */
export type ScanLookupSource =
  | "cache_hit_fresh"
  | "cache_hit_stale"
  | "cache_miss_fetched";

/**
 * Source the backend assigned when the row was originally created in
 * `scan_catalog_items`. `seed` and `manual` rows never expire;
 * `openfoodfacts` rows respect the 1-hour TTL.
 */
export type ScanCatalogItemOrigin = "seed" | "openfoodfacts" | "manual";

/**
 * Domain shape of a single beer entry returned by the lookup endpoint.
 * snake_case backend fields are normalised to camelCase here to keep
 * presentation/use-case code idiomatic React Native.
 */
export interface ScanCatalogItem {
  id: string;
  barcode: string;
  name: string;
  brewery: string;
  style: string;
  abv: number | null;
  ibu: number | null;
  /**
   * ADR-0017 interval bounds, for display ("20–28"). The scalar `ibu`
   * above stays the representative midpoint consumed by the bucket
   * formatters and the recipe-matching scorer. Optional: mock/demo
   * items carry only the scalar.
   */
  ibuMin?: number | null;
  ibuMax?: number | null;
  colorEbc: number | null;
  colorEbcMin?: number | null;
  colorEbcMax?: number | null;
  fermentationType: string;
  aromaticTags: string | null;
  notesSource: string | null;
  isAbvEstimated: boolean;
  isIbuEstimated: boolean;
  isColorEbcEstimated: boolean;
  isStyleEstimated: boolean;
  origin: ScanCatalogItemOrigin;
  fetchedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response shape for the lookup use-case. Mirrors the backend
 * `ScanLookupResultDto`: `item` is the resolved beer, `source` tells
 * the caller where the data came from so the UI can render "from
 * cache" vs "fetched live" cues, `rawPayloadAvailable` exposes that
 * the backend has the raw OpenFoodFacts response server-side (the
 * raw payload itself is never returned to the client).
 */
export interface ScanLookupResult {
  item: ScanCatalogItem;
  source: ScanLookupSource;
  rawPayloadAvailable: boolean;
}

/**
 * One candidate recipe surfaced under "Equivalent recipes" on the
 * scan info card. Shape anticipates the matching backend (#699) but
 * stays consumer-driven: today the data comes from the demo mock,
 * tomorrow the same shape lands from the API.
 *
 * `score` is the matching algo's confidence (0-1). Presentation
 * sorts by score desc and caps to the top 3.
 */
export interface ScanRecipeMatch {
  /**
   * Demo-mode recipe id — references a row in `demoRecipes` so the
   * UI can navigate to the resolvable detail page when the app
   * runs in `EXPO_PUBLIC_USE_DEMO_DATA=true`.
   */
  recipeId: string;
  /**
   * Backend-mode recipe id (UUID) — references a PUBLIC row in the
   * `recipes` table seeded by `public-recipes.seed.ts` (Issue #701).
   * Used as the source id when calling
   * `POST /recipes/import-from-community/:id` against the real
   * backend. Optional because legacy / partial mocks may not carry
   * it; pickers fall back to `recipeId` if absent.
   */
  publicRecipeId?: string;
  name: string;
  brewer: string;
  rating: number;
  brewedCount: number;
  score: number;
  /**
   * Match completeness in `[0..1]` (ADR-0016 D4) — how much of the full
   * picture (style / colour / IBU / ABV) the comparison actually used, a
   * confidence signal distinct from `score`. Wired through the backend path
   * for future use; not surfaced in the UI yet (every shown recipe already
   * cleared the server-side completeness threshold). Optional: demo-mode
   * matches omit it.
   */
  completeness?: number;
  /**
   * `true` if the recipe is the brewer-endorsed official clone of
   * a beer (Issue #699). Drives the pharmacy metaphor split on the
   * scan result screen: officials surface in the "🏆 Brewery
   * recipe" section, non-officials in "🧪 Recettes équivalentes".
   */
  isOfficial?: boolean;
  /**
   * Style label of the recipe (e.g. "Session IPA", "Belgian
   * Tripel"). Surfaced on the recipe row alongside the brewer +
   * rating per the brainstorm scan-2026-04-24 §2 layout. Optional
   * because legacy mocks did not carry it.
   */
  style?: string;
}

/**
 * Response envelope for the recipe-matching backend (Issue #699).
 * Mirrors the API's `RankedRecipeResponseDto` so the data layer can
 * pass-through without remapping in shape.
 *
 * - `rankings` — the recipes that cleared the acceptance thresholds
 *   (ADR-0016 D5: match strength + completeness), ordered by descending
 *   match strength.
 * - `lowConfidence` — `true` when **nothing** cleared the thresholds (empty
 *   `rankings`). The UI then renders an honest "no reliable equivalent" empty
 *   state rather than a misleading closest match (matcher v2, ADR-0016).
 *
 * Shape kept consumer-driven: today the data comes from
 * `getDemoEquivalentRecipes(barcode)` in demo mode; tomorrow the
 * same shape lands from `GET /recipes/match/:beerId` in backend mode.
 */
export interface ScanMatchingResult {
  rankings: ReadonlyArray<ScanRecipeMatch>;
  lowConfidence: boolean;
}
