import { listRecipes } from "@/features/recipes/application/recipes.use-cases";
import type { Recipe } from "@/features/recipes/domain/recipe.types";
import {
  scanProductRepository,
  scanStorage,
} from "@/features/scan/data/scan.repository";
import {
  type ScanAttemptInput,
  type ScanConsentPreferences,
  type ScanConsentSettings,
  type ScanPendingCapture,
  type ScanPhotoCaptureStage,
  type ScanProcessOutcome,
  type ScanProductRecord,
  type ScanRecipeRecommendation,
  type ScanResolvedResult,
  type ScanResultDetailsViewModel,
} from "@/features/scan/domain/scan.types";

const DEFAULT_RETENTION_DAYS = 30;
const MAX_RECOMMENDATIONS = 3;
const EMPTY_VALUE = "";
const PENDING_TOAST_MESSAGE = "Saved locally for later analysis.";
const FRONT_CAPTURE_TOAST_MESSAGE =
  "Barcode not recognized. Capture the front of the bottle.";
const BACK_CAPTURE_TOAST_MESSAGE =
  "Front captured. Capture the back of the bottle.";

const DEFAULT_CONSENT_PREFERENCES: ScanConsentPreferences = {
  storeBarcodeValue: true,
  storeBottlePhotos: true,
  storeScanMetadata: true,
  useDataForModelTraining: true,
};

type GiveScanConsentInput =
  | number
  | {
      retentionDays?: number;
      preferences?: Partial<ScanConsentPreferences>;
    };

function normalize(value?: string | null): string {
  return value?.trim() ?? EMPTY_VALUE;
}

function sanitizeConsentPreferences(
  preferences?: Partial<ScanConsentPreferences> | null,
): ScanConsentPreferences {
  return {
    storeBarcodeValue:
      preferences?.storeBarcodeValue ??
      DEFAULT_CONSENT_PREFERENCES.storeBarcodeValue,
    storeBottlePhotos:
      preferences?.storeBottlePhotos ??
      DEFAULT_CONSENT_PREFERENCES.storeBottlePhotos,
    storeScanMetadata:
      preferences?.storeScanMetadata ??
      DEFAULT_CONSENT_PREFERENCES.storeScanMetadata,
    useDataForModelTraining:
      preferences?.useDataForModelTraining ??
      DEFAULT_CONSENT_PREFERENCES.useDataForModelTraining,
  };
}

function safeNumber(value: number | null | undefined): number {
  return Number.isFinite(value) ? (value as number) : 0;
}

function buildScanId(scannedAt: Date): string {
  return `scan-${scannedAt.getTime()}`;
}

function buildPendingCaptureId(scannedAt: Date): string {
  return `pending-${scannedAt.getTime()}`;
}

function toRoundedPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreRecipeSimilarity(
  recipe: Recipe,
  product: ScanProductRecord,
): number {
  const recipeStats = recipe.stats;
  if (!recipeStats) {
    return 0;
  }

  const abvDistance = Math.abs(safeNumber(recipeStats.abv) - product.abv);
  const ibuDistance = Math.abs(safeNumber(recipeStats.ibu) - product.ibu);
  const colorDistance = Math.abs(
    safeNumber(recipeStats.colorEbc) - product.colorEbc,
  );

  const abvScore = Math.max(0, 1 - abvDistance / 7);
  const ibuScore = Math.max(0, 1 - ibuDistance / 80);
  const colorScore = Math.max(0, 1 - colorDistance / 120);

  const styleSimilarity = recipe.name
    .toLocaleLowerCase()
    .includes(product.style.toLocaleLowerCase())
    ? 1
    : 0.35;

  const weightedScore =
    abvScore * 0.35 +
    ibuScore * 0.25 +
    colorScore * 0.2 +
    styleSimilarity * 0.2;

  return toRoundedPercent(weightedScore * 100);
}

function extractGiveConsentInput(input?: GiveScanConsentInput): {
  retentionDays?: number;
  preferences?: Partial<ScanConsentPreferences>;
} {
  if (typeof input === "number") {
    return {
      retentionDays: input,
    };
  }

  return input ?? {};
}

async function buildRecommendations(
  product: ScanProductRecord,
): Promise<ScanRecipeRecommendation[]> {
  const recipes = await listRecipes();

  return recipes
    .map((recipe) => ({
      recipeId: recipe.id,
      recipeName: recipe.name,
      equivalencePercent: scoreRecipeSimilarity(recipe, product),
    }))
    .sort((a, b) => b.equivalencePercent - a.equivalencePercent)
    .slice(0, MAX_RECOMMENDATIONS);
}

function buildScanMetadata(input: {
  scannedAtIso: string;
  barcodeValue: string;
  barcodeType: string;
  hasFrontPhoto: boolean;
  hasBackPhoto: boolean;
  backLabelMissing: boolean;
  consentSnapshot: ScanConsentPreferences;
}): string {
  if (!input.consentSnapshot.storeScanMetadata) {
    return "Metadata storage disabled by consent preferences.";
  }

  const metadataLines = [
    `Captured at: ${input.scannedAtIso}`,
    `Barcode: ${input.barcodeValue || "none"}`,
    `Barcode type: ${input.barcodeType || "none"}`,
    `Front photo captured: ${input.hasFrontPhoto ? "yes" : "no"}`,
    `Back photo captured: ${input.hasBackPhoto ? "yes" : "no"}`,
    `Back label missing: ${input.backLabelMissing ? "yes" : "no"}`,
    `Model training authorized: ${
      input.consentSnapshot.useDataForModelTraining ? "yes" : "no"
    }`,
  ];

  return metadataLines.join(" • ");
}

function sanitizeRetentionDays(days?: number): number {
  if (!Number.isFinite(days) || (days ?? 0) <= 0) {
    return DEFAULT_RETENTION_DAYS;
  }

  return Math.round(days as number);
}

async function resolveMatchedResult(input: {
  scannedAt: Date;
  matchedBy: "label" | "barcode";
  matchedValue: string;
  product: ScanProductRecord;
}): Promise<ScanResolvedResult> {
  const recommendations = await buildRecommendations(input.product);

  return {
    scanId: buildScanId(input.scannedAt),
    status: "matched",
    matchedBy: input.matchedBy,
    matchedValue: input.matchedValue,
    scannedAtIso: input.scannedAt.toISOString(),
    product: {
      id: input.product.id,
      name: input.product.name,
      brewery: input.product.brewery,
      style: input.product.style,
      format: input.product.format,
      abv: input.product.abv,
      ibu: input.product.ibu,
      colorEbc: input.product.colorEbc,
      thumbnailUri: input.product.thumbnailUri,
    },
    recommendations,
  };
}

function resolvePendingCapture(
  input: ScanAttemptInput,
  scannedAt: Date,
  consentSnapshot: ScanConsentPreferences,
): ScanPendingCapture {
  const barcodeValue = normalize(input.barcodeValue);
  const barcodeType = normalize(input.barcodeType);
  const frontPhotoUri = normalize(input.frontPhotoUri);
  const backPhotoUri = normalize(input.backPhotoUri);
  const backLabelMissing = Boolean(input.backLabelMissing);

  const storedBarcodeValue = consentSnapshot.storeBarcodeValue
    ? barcodeValue || null
    : null;
  const storedBarcodeType = consentSnapshot.storeBarcodeValue
    ? barcodeType || null
    : null;
  const storedFrontPhotoUri = consentSnapshot.storeBottlePhotos
    ? frontPhotoUri || null
    : null;
  const storedBackPhotoUri = consentSnapshot.storeBottlePhotos
    ? backPhotoUri || null
    : null;

  return {
    id: buildPendingCaptureId(scannedAt),
    status: "pending-analysis",
    createdAtIso: scannedAt.toISOString(),
    barcodeValue: storedBarcodeValue,
    barcodeType: storedBarcodeType,
    frontPhotoUri: storedFrontPhotoUri,
    backPhotoUri: storedBackPhotoUri,
    backLabelMissing,
    consentSnapshot,
    metadata: buildScanMetadata({
      scannedAtIso: scannedAt.toISOString(),
      barcodeValue,
      barcodeType,
      hasFrontPhoto: Boolean(frontPhotoUri),
      hasBackPhoto: Boolean(backPhotoUri),
      backLabelMissing,
      consentSnapshot,
    }),
  };
}

async function resolveConsentSnapshot(): Promise<ScanConsentPreferences> {
  const consentSettings = await scanStorage.getConsentSettings();
  return sanitizeConsentPreferences(consentSettings?.preferences);
}

export function getDefaultScanConsentPreferences(): ScanConsentPreferences {
  return {
    ...DEFAULT_CONSENT_PREFERENCES,
  };
}

export async function getScanConsentSettings(): Promise<ScanConsentSettings | null> {
  const settings = await scanStorage.getConsentSettings();
  if (!settings) {
    return null;
  }

  return {
    ...settings,
    preferences: sanitizeConsentPreferences(settings.preferences),
  };
}

export async function giveScanConsent(
  input: GiveScanConsentInput = DEFAULT_RETENTION_DAYS,
): Promise<ScanConsentSettings> {
  const normalizedInput = extractGiveConsentInput(input);
  const consentSettings: ScanConsentSettings = {
    hasConsent: true,
    consentedAtIso: new Date().toISOString(),
    retentionDays: sanitizeRetentionDays(normalizedInput.retentionDays),
    preferences: sanitizeConsentPreferences(normalizedInput.preferences),
  };

  await scanStorage.saveConsentSettings(consentSettings);
  return consentSettings;
}

function resolveRequiredPhotoCaptureStage(
  input: ScanAttemptInput,
): ScanPhotoCaptureStage | null {
  const normalizedFrontPhotoUri = normalize(input.frontPhotoUri);
  if (!normalizedFrontPhotoUri) {
    return "front";
  }

  if (input.backLabelMissing) {
    return null;
  }

  const normalizedBackPhotoUri = normalize(input.backPhotoUri);
  if (!normalizedBackPhotoUri) {
    return "back";
  }

  return null;
}

export async function processScanAttempt(
  input: ScanAttemptInput,
): Promise<ScanProcessOutcome> {
  const scannedAt = input.scannedAt ?? new Date();
  const normalizedBarcode = normalize(input.barcodeValue);

  if (normalizedBarcode) {
    const productByBarcode =
      await scanProductRepository.findByBarcode(normalizedBarcode);
    if (productByBarcode) {
      const result = await resolveMatchedResult({
        scannedAt,
        matchedBy: "barcode",
        matchedValue: normalizedBarcode,
        product: productByBarcode,
      });

      await scanStorage.saveResolvedResult(result);

      return {
        type: "matched",
        result,
      };
    }
  }

  const requiredCaptureStage = resolveRequiredPhotoCaptureStage(input);
  if (requiredCaptureStage === "front") {
    return {
      type: "requires-photo-capture",
      stage: "front",
      toastMessage: FRONT_CAPTURE_TOAST_MESSAGE,
    };
  }

  if (requiredCaptureStage === "back") {
    return {
      type: "requires-photo-capture",
      stage: "back",
      toastMessage: BACK_CAPTURE_TOAST_MESSAGE,
    };
  }

  const consentSnapshot = await resolveConsentSnapshot();
  const pendingCapture = resolvePendingCapture(
    input,
    scannedAt,
    consentSnapshot,
  );
  await scanStorage.savePendingCapture(pendingCapture);

  return {
    type: "pending",
    capture: pendingCapture,
    toastMessage: PENDING_TOAST_MESSAGE,
  };
}

export async function getScanResultDetails(
  scanId: string,
): Promise<ScanResultDetailsViewModel | null> {
  const normalizedScanId = normalize(scanId);
  if (!normalizedScanId) {
    return null;
  }

  const result = await scanStorage.getResolvedResultById(normalizedScanId);
  if (!result) {
    return null;
  }

  const details = await scanProductRepository.getProductDetails(
    result.product.id,
  );

  return {
    result,
    details,
  };
}

export async function listPendingScans(): Promise<ScanPendingCapture[]> {
  const captures = await scanStorage.listPendingCaptures();
  return [...captures].sort((a, b) =>
    b.createdAtIso.localeCompare(a.createdAtIso),
  );
}

export async function purgeScanLocalData(): Promise<void> {
  await scanStorage.purgeAll();
}

export function getPendingScanToastMessage(): string {
  return PENDING_TOAST_MESSAGE;
}
