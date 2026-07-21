import type { ConsentDecision } from "@/features/consent/domain/consent.types";

const mockListDecisions = jest.fn();
const mockAppendDecisions = jest.fn();
const mockPurgeAll = jest.fn();

jest.mock("@/features/consent/data/consent.storage", () => ({
  consentRepository: {
    listDecisions: (...args: unknown[]) => mockListDecisions(...args),
    appendDecisions: (...args: unknown[]) => mockAppendDecisions(...args),
    purgeAll: (...args: unknown[]) => mockPurgeAll(...args),
  },
}));

// getConsentSettings only reaches AsyncStorage for the legacy fallback, which
// is never hit here because the mocked decisions form a complete canonical
// set. Mock it anyway so an accidental read never touches a native module.
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

import { scanStorageRepository } from "@/features/scan/data/scan.storage";

/**
 * The four axes `fromConsentDecisions` requires before it returns a non-null
 * canonical settings object. Training consent is resolved separately across
 * `scan.training` + `ml.training`, so callers override those two per case.
 */
function baseDecisions(decidedAt: string): ConsentDecision[] {
  return [
    { axis: "scan.barcode", value: true, decidedAt, source: "scan" },
    { axis: "scan.photos", value: true, decidedAt, source: "scan" },
    { axis: "scan.metadata", value: true, decidedAt, source: "scan" },
  ];
}

describe("scanStorageRepository training consent (ADR-0003, cross-axis)", () => {
  beforeEach(() => {
    mockListDecisions.mockReset();
    mockAppendDecisions.mockReset().mockResolvedValue(undefined);
    mockPurgeAll.mockReset().mockResolvedValue(undefined);
  });

  it("lets a newer ml.training opt-out revoke an older scan.training opt-in", async () => {
    mockListDecisions.mockResolvedValue([
      ...baseDecisions("2026-02-01T08:00:00.000Z"),
      {
        axis: "scan.training",
        value: true,
        decidedAt: "2026-02-01T08:00:00.000Z",
        source: "scan",
      },
      {
        axis: "ml.training",
        value: false,
        decidedAt: "2026-03-01T08:00:00.000Z",
        source: "profile",
      },
    ]);

    const settings = await scanStorageRepository.getConsentSettings();

    expect(settings?.preferences.useDataForModelTraining).toBe(false);
  });

  it("lets a newer ml.training opt-in override an older scan.training opt-out", async () => {
    mockListDecisions.mockResolvedValue([
      ...baseDecisions("2026-02-01T08:00:00.000Z"),
      {
        axis: "scan.training",
        value: false,
        decidedAt: "2026-02-01T08:00:00.000Z",
        source: "scan",
      },
      {
        axis: "ml.training",
        value: true,
        decidedAt: "2026-03-01T08:00:00.000Z",
        source: "profile",
      },
    ]);

    const settings = await scanStorageRepository.getConsentSettings();

    expect(settings?.preferences.useDataForModelTraining).toBe(true);
  });

  it("keeps an older ml.training decision from overriding a newer scan.training one", async () => {
    mockListDecisions.mockResolvedValue([
      ...baseDecisions("2026-03-01T08:00:00.000Z"),
      {
        axis: "scan.training",
        value: false,
        decidedAt: "2026-03-01T08:00:00.000Z",
        source: "scan",
      },
      {
        axis: "ml.training",
        value: true,
        decidedAt: "2026-01-01T08:00:00.000Z",
        source: "profile",
      },
    ]);

    const settings = await scanStorageRepository.getConsentSettings();

    expect(settings?.preferences.useDataForModelTraining).toBe(false);
  });

  it("falls back to scan.training alone when ml.training was never recorded", async () => {
    mockListDecisions.mockResolvedValue([
      ...baseDecisions("2026-02-01T08:00:00.000Z"),
      {
        axis: "scan.training",
        value: true,
        decidedAt: "2026-02-01T08:00:00.000Z",
        source: "scan",
      },
    ]);

    const settings = await scanStorageRepository.getConsentSettings();

    expect(settings?.preferences.useDataForModelTraining).toBe(true);
  });
});
