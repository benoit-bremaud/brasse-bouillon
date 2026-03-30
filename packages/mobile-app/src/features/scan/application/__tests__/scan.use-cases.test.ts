import {
  getDefaultScanConsentPreferences,
  getPendingScanToastMessage,
  getScanResultDetails,
  giveScanConsent,
  listPendingScans,
  processScanAttempt,
  purgeScanLocalData,
} from "@/features/scan/application/scan.use-cases";
import {
  scanProductRepository,
  scanStorage,
} from "@/features/scan/data/scan.repository";
import type {
  ScanConsentPreferences,
  ScanPendingCapture,
  ScanProductDetails,
  ScanProductRecord,
  ScanResolvedResult,
} from "@/features/scan/domain/scan.types";

import { listRecipes } from "@/features/recipes/application/recipes.use-cases";
import type { Recipe } from "@/features/recipes/domain/recipe.types";

jest.mock("@/features/recipes/application/recipes.use-cases", () => ({
  listRecipes: jest.fn(),
}));

jest.mock("@/features/scan/data/scan.repository", () => ({
  scanProductRepository: {
    findByLabel: jest.fn(),
    findByBarcode: jest.fn(),
    getProductDetails: jest.fn(),
  },
  scanStorage: {
    getConsentSettings: jest.fn(),
    saveConsentSettings: jest.fn(),
    listPendingCaptures: jest.fn(),
    savePendingCapture: jest.fn(),
    removePendingCapture: jest.fn(),
    saveResolvedResult: jest.fn(),
    getResolvedResultById: jest.fn(),
    purgeAll: jest.fn(),
  },
}));

const mockedListRecipes = listRecipes as jest.MockedFunction<
  typeof listRecipes
>;
const mockedScanProductRepository = scanProductRepository as jest.Mocked<
  typeof scanProductRepository
>;
const mockedScanStorage = scanStorage as jest.Mocked<typeof scanStorage>;

const DEFAULT_PREFERENCES: ScanConsentPreferences = {
  storeBarcodeValue: true,
  storeBottlePhotos: true,
  storeScanMetadata: true,
  useDataForModelTraining: true,
};
const MISSING_CONSENT_ERROR_MESSAGE =
  "Scan consent is required before processing scan attempts.";

const MOCK_PRODUCT: ScanProductRecord = {
  id: "beer-1",
  name: "Session IPA Citra",
  brewery: "Brasse Bouillon Labs",
  style: "Session IPA",
  format: "Can 44cl",
  abv: 5.1,
  ibu: 42,
  colorEbc: 11,
  thumbnailUri: "https://example.com/images/session-ipa-citra.jpg",
  barcodeValues: ["3760241234501"],
  labelKeywords: ["session ipa", "citra"],
};

function buildRecipe(input: {
  id: string;
  name: string;
  abv: number;
  ibu: number;
  colorEbc: number;
}): Recipe {
  return {
    id: input.id,
    ownerId: "u1",
    name: input.name,
    description: null,
    stats: {
      abv: input.abv,
      ibu: input.ibu,
      og: 1.052,
      fg: 1.011,
      volumeLiters: 20,
      colorEbc: input.colorEbc,
    },
    ingredients: [],
    equipment: [],
    visibility: "private",
    version: 1,
    rootRecipeId: input.id,
    parentRecipeId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function buildResolvedResult(scanId: string): ScanResolvedResult {
  return {
    scanId,
    status: "matched",
    matchedBy: "barcode",
    matchedValue: "3760241234501",
    scannedAtIso: "2026-01-05T10:00:00.000Z",
    product: {
      id: MOCK_PRODUCT.id,
      name: MOCK_PRODUCT.name,
      brewery: MOCK_PRODUCT.brewery,
      style: MOCK_PRODUCT.style,
      format: MOCK_PRODUCT.format,
      abv: MOCK_PRODUCT.abv,
      ibu: MOCK_PRODUCT.ibu,
      colorEbc: MOCK_PRODUCT.colorEbc,
      thumbnailUri: MOCK_PRODUCT.thumbnailUri,
    },
    recommendations: [
      {
        recipeId: "r-1",
        recipeName: "Hoppy Session IPA",
        equivalencePercent: 92,
      },
    ],
  };
}

describe("scan use-cases", () => {
  beforeEach(() => {
    mockedListRecipes.mockReset();
    mockedScanProductRepository.findByLabel.mockReset();
    mockedScanProductRepository.findByBarcode.mockReset();
    mockedScanProductRepository.getProductDetails.mockReset();
    mockedScanStorage.getConsentSettings.mockReset();
    mockedScanStorage.saveConsentSettings.mockReset();
    mockedScanStorage.listPendingCaptures.mockReset();
    mockedScanStorage.savePendingCapture.mockReset();
    mockedScanStorage.removePendingCapture.mockReset();
    mockedScanStorage.saveResolvedResult.mockReset();
    mockedScanStorage.getResolvedResultById.mockReset();
    mockedScanStorage.purgeAll.mockReset();

    mockedListRecipes.mockResolvedValue([
      buildRecipe({
        id: "r-1",
        name: "Session IPA Hero",
        abv: 5,
        ibu: 40,
        colorEbc: 12,
      }),
      buildRecipe({
        id: "r-2",
        name: "Amber Ale Balance",
        abv: 5.6,
        ibu: 29,
        colorEbc: 26,
      }),
      buildRecipe({
        id: "r-3",
        name: "Imperial Stout Core",
        abv: 9,
        ibu: 65,
        colorEbc: 150,
      }),
      buildRecipe({
        id: "r-4",
        name: "Golden Ale Fresh",
        abv: 4.6,
        ibu: 20,
        colorEbc: 8,
      }),
    ]);
  });

  it("exposes aggressive business defaults for consent preferences", () => {
    const preferences = getDefaultScanConsentPreferences();

    expect(preferences).toEqual(DEFAULT_PREFERENCES);
  });

  it("saves consent with sanitized retention and provided preferences", async () => {
    const consent = await giveScanConsent({
      retentionDays: -5,
      preferences: {
        storeScanMetadata: false,
      },
    });

    expect(consent.hasConsent).toBe(true);
    expect(consent.retentionDays).toBe(30);
    expect(consent.preferences.storeScanMetadata).toBe(false);
    expect(consent.preferences.storeBarcodeValue).toBe(true);
    expect(mockedScanStorage.saveConsentSettings).toHaveBeenCalledTimes(1);
  });

  it("matches by barcode on first stage", async () => {
    const scannedAt = new Date("2026-02-01T08:00:00.000Z");
    mockedScanProductRepository.findByBarcode.mockResolvedValue(MOCK_PRODUCT);
    mockedScanStorage.getConsentSettings.mockResolvedValue({
      hasConsent: true,
      consentedAtIso: "2026-02-01T08:00:00.000Z",
      retentionDays: 30,
      preferences: DEFAULT_PREFERENCES,
    });

    const outcome = await processScanAttempt({
      barcodeValue: "3760241234501",
      scannedAt,
    });

    expect(mockedScanProductRepository.findByBarcode).toHaveBeenCalledWith(
      "3760241234501",
    );
    expect(outcome.type).toBe("matched");

    if (outcome.type !== "matched") {
      throw new Error("Expected matched outcome");
    }

    expect(outcome.result.matchedBy).toBe("barcode");
    expect(outcome.result.recommendations).toHaveLength(3);
    expect(mockedScanStorage.saveResolvedResult).toHaveBeenCalledWith(
      outcome.result,
    );
  });

  it("asks for front photo when barcode is unmatched", async () => {
    mockedScanProductRepository.findByBarcode.mockResolvedValue(null);
    mockedScanStorage.getConsentSettings.mockResolvedValue({
      hasConsent: true,
      consentedAtIso: "2026-02-01T08:00:00.000Z",
      retentionDays: 30,
      preferences: DEFAULT_PREFERENCES,
    });

    const outcome = await processScanAttempt({
      barcodeValue: "0000000000000",
      scannedAt: new Date("2026-02-02T08:00:00.000Z"),
    });

    expect(outcome.type).toBe("requires-photo-capture");
    if (outcome.type !== "requires-photo-capture") {
      throw new Error("Expected requires-photo-capture outcome");
    }

    expect(outcome.stage).toBe("front");
  });

  it("asks for back photo when front exists but back is missing", async () => {
    mockedScanProductRepository.findByBarcode.mockResolvedValue(null);
    mockedScanStorage.getConsentSettings.mockResolvedValue({
      hasConsent: true,
      consentedAtIso: "2026-02-01T08:00:00.000Z",
      retentionDays: 30,
      preferences: DEFAULT_PREFERENCES,
    });

    const outcome = await processScanAttempt({
      barcodeValue: "0000000000000",
      frontPhotoUri: "mock://front.jpg",
      scannedAt: new Date("2026-02-03T08:00:00.000Z"),
    });

    expect(outcome.type).toBe("requires-photo-capture");
    if (outcome.type !== "requires-photo-capture") {
      throw new Error("Expected requires-photo-capture outcome");
    }

    expect(outcome.stage).toBe("back");
  });

  it("stores a pending capture after barcode + front + back are provided", async () => {
    mockedScanProductRepository.findByBarcode.mockResolvedValue(null);
    mockedScanStorage.getConsentSettings.mockResolvedValue({
      hasConsent: true,
      consentedAtIso: "2026-02-01T08:00:00.000Z",
      retentionDays: 30,
      preferences: {
        storeBarcodeValue: false,
        storeBottlePhotos: true,
        storeScanMetadata: false,
        useDataForModelTraining: false,
      },
    });

    const scannedAt = new Date("2026-02-04T08:00:00.000Z");
    const outcome = await processScanAttempt({
      barcodeValue: "0000000000000",
      barcodeType: "ean13",
      frontPhotoUri: "mock://front.jpg",
      backPhotoUri: "mock://back.jpg",
      scannedAt,
    });

    expect(outcome.type).toBe("pending");
    if (outcome.type !== "pending") {
      throw new Error("Expected pending outcome");
    }

    expect(outcome.capture.id).toBe(`pending-${scannedAt.getTime()}`);
    expect(outcome.capture.barcodeValue).toBeNull();
    expect(outcome.capture.frontPhotoUri).toBe("mock://front.jpg");
    expect(outcome.capture.backPhotoUri).toBe("mock://back.jpg");
    expect(outcome.capture.backLabelMissing).toBe(false);
    expect(outcome.capture.metadata).toBe(
      "Metadata storage disabled by consent preferences.",
    );
    expect(outcome.toastMessage).toBe(getPendingScanToastMessage());
    expect(mockedScanStorage.savePendingCapture).toHaveBeenCalledWith(
      outcome.capture,
    );
  });

  it("returns a details view model for a stored matched result", async () => {
    const resolvedResult = buildResolvedResult("scan-42");
    const productDetails: ScanProductDetails = {
      productId: MOCK_PRODUCT.id,
      description: "Session IPA with bright citrus notes.",
      ingredients: ["Water", "Barley malt", "Citra hops", "Yeast"],
      tastingNotes: ["Citrus", "Pine"],
      servingTemperatureCelsius: "6-8°C",
      foodPairings: ["Fish tacos"],
    };

    mockedScanStorage.getResolvedResultById.mockResolvedValue(resolvedResult);
    mockedScanProductRepository.getProductDetails.mockResolvedValue(
      productDetails,
    );

    const details = await getScanResultDetails("  scan-42  ");

    expect(mockedScanStorage.getResolvedResultById).toHaveBeenCalledWith(
      "scan-42",
    );
    expect(details?.result.scanId).toBe("scan-42");
    expect(details?.details?.productId).toBe(MOCK_PRODUCT.id);
  });

  it("returns null details when scan id is empty", async () => {
    const details = await getScanResultDetails("   ");

    expect(details).toBeNull();
    expect(mockedScanStorage.getResolvedResultById).not.toHaveBeenCalled();
  });

  it("sorts pending captures from newest to oldest", async () => {
    const captures: ScanPendingCapture[] = [
      {
        id: "pending-1",
        status: "pending-analysis",
        createdAtIso: "2026-02-01T08:00:00.000Z",
        barcodeValue: null,
        barcodeType: null,
        frontPhotoUri: null,
        backPhotoUri: null,
        backLabelMissing: false,
        consentSnapshot: DEFAULT_PREFERENCES,
        metadata: "meta-1",
      },
      {
        id: "pending-3",
        status: "pending-analysis",
        createdAtIso: "2026-02-03T08:00:00.000Z",
        barcodeValue: null,
        barcodeType: null,
        frontPhotoUri: null,
        backPhotoUri: null,
        backLabelMissing: false,
        consentSnapshot: DEFAULT_PREFERENCES,
        metadata: "meta-3",
      },
      {
        id: "pending-2",
        status: "pending-analysis",
        createdAtIso: "2026-02-02T08:00:00.000Z",
        barcodeValue: null,
        barcodeType: null,
        frontPhotoUri: null,
        backPhotoUri: null,
        backLabelMissing: false,
        consentSnapshot: DEFAULT_PREFERENCES,
        metadata: "meta-2",
      },
    ];

    mockedScanStorage.listPendingCaptures.mockResolvedValue(captures);

    const result = await listPendingScans();

    expect(result.map((capture) => capture.id)).toEqual([
      "pending-3",
      "pending-2",
      "pending-1",
    ]);
  });

  it("purges local scan storage", async () => {
    await purgeScanLocalData();

    expect(mockedScanStorage.purgeAll).toHaveBeenCalledTimes(1);
  });

  it("stores pending capture when back label is explicitly missing", async () => {
    mockedScanProductRepository.findByBarcode.mockResolvedValue(null);
    mockedScanStorage.getConsentSettings.mockResolvedValue({
      hasConsent: true,
      consentedAtIso: "2026-02-01T08:00:00.000Z",
      retentionDays: 30,
      preferences: DEFAULT_PREFERENCES,
    });

    const outcome = await processScanAttempt({
      barcodeValue: "0000000000000",
      barcodeType: "ean13",
      frontPhotoUri: "mock://front.jpg",
      backPhotoUri: null,
      backLabelMissing: true,
      scannedAt: new Date("2026-02-05T08:00:00.000Z"),
    });

    expect(outcome.type).toBe("pending");
    if (outcome.type !== "pending") {
      throw new Error("Expected pending outcome");
    }

    expect(outcome.capture.backPhotoUri).toBeNull();
    expect(outcome.capture.backLabelMissing).toBe(true);
    expect(outcome.capture.metadata).toContain("Back label missing: yes");
  });

  it("throws when consent settings are missing", async () => {
    mockedScanProductRepository.findByBarcode.mockResolvedValue(MOCK_PRODUCT);
    mockedScanStorage.getConsentSettings.mockResolvedValue(null);

    await expect(
      processScanAttempt({
        barcodeValue: "3760241234501",
        scannedAt: new Date("2026-02-06T08:00:00.000Z"),
      }),
    ).rejects.toThrow(MISSING_CONSENT_ERROR_MESSAGE);

    expect(mockedScanStorage.saveResolvedResult).not.toHaveBeenCalled();
    expect(mockedScanStorage.savePendingCapture).not.toHaveBeenCalled();
  });

  it("throws when consent exists but is explicitly denied", async () => {
    mockedScanProductRepository.findByBarcode.mockResolvedValue(null);
    mockedScanStorage.getConsentSettings.mockResolvedValue({
      hasConsent: false,
      consentedAtIso: "2026-02-01T08:00:00.000Z",
      retentionDays: 30,
      preferences: DEFAULT_PREFERENCES,
    });

    await expect(
      processScanAttempt({
        barcodeValue: "0000000000000",
        frontPhotoUri: "mock://front.jpg",
        backPhotoUri: "mock://back.jpg",
        scannedAt: new Date("2026-02-07T08:00:00.000Z"),
      }),
    ).rejects.toThrow(MISSING_CONSENT_ERROR_MESSAGE);

    expect(mockedScanStorage.savePendingCapture).not.toHaveBeenCalled();
  });
});
