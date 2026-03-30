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
