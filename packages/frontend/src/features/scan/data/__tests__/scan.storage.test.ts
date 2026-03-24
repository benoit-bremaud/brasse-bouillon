import type {
  ScanConsentSettings,
  ScanPendingCapture,
  ScanResolvedResult,
} from "@/features/scan/domain/scan.types";

import { scanStorageRepository } from "@/features/scan/data/scan.storage";

const mockAsyncStorageGetItem = jest.fn();
const mockAsyncStorageSetItem = jest.fn();
const mockAsyncStorageRemoveItem = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: (...args: unknown[]) => mockAsyncStorageGetItem(...args),
  setItem: (...args: unknown[]) => mockAsyncStorageSetItem(...args),
  removeItem: (...args: unknown[]) => mockAsyncStorageRemoveItem(...args),
}));

const ASYNC_STORAGE_UNAVAILABLE_ERROR =
  "AsyncStorageError: Native module is null, cannot access legacy storage";

function createUnavailableStorageError() {
  return new Error(ASYNC_STORAGE_UNAVAILABLE_ERROR);
}

function createConsentSettings(): ScanConsentSettings {
  return {
    hasConsent: true,
    consentedAtIso: "2026-02-01T08:00:00.000Z",
    retentionDays: 30,
    preferences: {
      storeBarcodeValue: true,
      storeBottlePhotos: true,
      storeScanMetadata: true,
      useDataForModelTraining: true,
    },
  };
}

function createPendingCapture(id: string): ScanPendingCapture {
  return {
    id,
    status: "pending-analysis",
    createdAtIso: "2026-02-01T10:00:00.000Z",
    barcodeValue: "0000000000000",
    barcodeType: "ean13",
    frontPhotoUri: "mock://front.jpg",
    backPhotoUri: "mock://back.jpg",
    backLabelMissing: false,
    consentSnapshot: {
      storeBarcodeValue: true,
      storeBottlePhotos: true,
      storeScanMetadata: true,
      useDataForModelTraining: true,
    },
    metadata: "meta",
  };
}

function createResolvedResult(scanId: string): ScanResolvedResult {
  return {
    scanId,
    status: "matched",
    matchedBy: "barcode",
    matchedValue: "3760241234501",
    scannedAtIso: "2026-02-01T10:00:00.000Z",
    product: {
      id: "beer-1",
      name: "Session IPA Citra",
      brewery: "Brasse Bouillon Labs",
      style: "Session IPA",
      format: "Can 44cl",
      abv: 5.1,
      ibu: 42,
      colorEbc: 11,
      thumbnailUri: "https://example.com/images/session-ipa-citra.jpg",
    },
    recommendations: [],
  };
}

describe("scanStorageRepository", () => {
  beforeEach(() => {
    mockAsyncStorageGetItem.mockReset();
    mockAsyncStorageSetItem.mockReset();
    mockAsyncStorageRemoveItem.mockReset();
  });

  it("rethrows non-native-module AsyncStorage errors", async () => {
    mockAsyncStorageGetItem.mockRejectedValue(new Error("Unexpected IO error"));

    await expect(scanStorageRepository.getConsentSettings()).rejects.toThrow(
      "Unexpected IO error",
    );
  });

  it("falls back to in-memory storage when AsyncStorage native module is unavailable", async () => {
    mockAsyncStorageGetItem.mockRejectedValue(createUnavailableStorageError());
    mockAsyncStorageSetItem.mockRejectedValue(createUnavailableStorageError());
    mockAsyncStorageRemoveItem.mockRejectedValue(
      createUnavailableStorageError(),
    );

    const consentSettings = createConsentSettings();

    await scanStorageRepository.saveConsentSettings(consentSettings);

    const storedSettings = await scanStorageRepository.getConsentSettings();
    expect(storedSettings).toEqual(consentSettings);

    const pendingCapture = createPendingCapture("pending-1");
    await scanStorageRepository.savePendingCapture(pendingCapture);
    const pendingCaptures = await scanStorageRepository.listPendingCaptures();
    expect(pendingCaptures).toEqual([pendingCapture]);

    const resolvedResult = createResolvedResult("scan-1");
    await scanStorageRepository.saveResolvedResult(resolvedResult);
    const storedResult = await scanStorageRepository.getResolvedResultById(
      resolvedResult.scanId,
    );
    expect(storedResult).toEqual(resolvedResult);

    await scanStorageRepository.purgeAll();

    expect(await scanStorageRepository.getConsentSettings()).toBeNull();
    expect(await scanStorageRepository.listPendingCaptures()).toEqual([]);
    expect(
      await scanStorageRepository.getResolvedResultById(resolvedResult.scanId),
    ).toBeNull();
  });
});
