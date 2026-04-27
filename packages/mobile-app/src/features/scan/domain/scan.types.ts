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
  colorEbc: number | null;
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
  recipeId: string;
  name: string;
  brewer: string;
  rating: number;
  brewedCount: number;
  score: number;
}
