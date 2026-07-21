import {
  type ScanConsentSettings,
  type ScanPendingCapture,
  type ScanResolvedResult,
  type ScanStorageRepository,
} from "@/features/scan/domain/scan.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { consentRepository } from "@/features/consent/data/consent.storage";
import type { ConsentDecision } from "@/features/consent/domain/consent.types";

const CONSENT_SETTINGS_KEY = "scan:consent-settings";
const PENDING_CAPTURES_KEY = "scan:pending-captures";
const RESOLVED_RESULTS_KEY = "scan:resolved-results";
const ASYNC_STORAGE_UNAVAILABLE_PATTERNS = [
  "Native module is null",
  "NativeModule: AsyncStorage is null",
  "cannot access legacy storage",
];

const inMemoryStorage = new Map<string, string>();
let useInMemoryFallbackStorage = false;

function isAsyncStorageUnavailableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return ASYNC_STORAGE_UNAVAILABLE_PATTERNS.some((pattern) =>
    error.message.includes(pattern),
  );
}

function enableInMemoryFallbackStorage() {
  useInMemoryFallbackStorage = true;
}

async function safeGetItem(key: string): Promise<string | null> {
  if (useInMemoryFallbackStorage) {
    return inMemoryStorage.get(key) ?? null;
  }

  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    if (isAsyncStorageUnavailableError(error)) {
      enableInMemoryFallbackStorage();
      return inMemoryStorage.get(key) ?? null;
    }

    throw error;
  }
}

async function safeSetItem(key: string, value: string): Promise<void> {
  if (useInMemoryFallbackStorage) {
    inMemoryStorage.set(key, value);
    return;
  }

  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    if (isAsyncStorageUnavailableError(error)) {
      enableInMemoryFallbackStorage();
      inMemoryStorage.set(key, value);
      return;
    }

    throw error;
  }
}

async function safeRemoveItem(key: string): Promise<void> {
  if (useInMemoryFallbackStorage) {
    inMemoryStorage.delete(key);
    return;
  }

  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    if (isAsyncStorageUnavailableError(error)) {
      enableInMemoryFallbackStorage();
      inMemoryStorage.delete(key);
      return;
    }

    throw error;
  }
}

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function readArray<T>(key: string): Promise<T[]> {
  const raw = await safeGetItem(key);
  return parseJson<T[]>(raw, []);
}

async function writeArray<T>(key: string, value: T[]): Promise<void> {
  await safeSetItem(key, JSON.stringify(value));
}

async function removeKeys(keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => safeRemoveItem(key)));
}

function toConsentDecisions(settings: ScanConsentSettings): ConsentDecision[] {
  const decidedAt = settings.consentedAtIso;
  const source = "scan" as const;

  return [
    {
      axis: "scan.barcode",
      value: settings.preferences.storeBarcodeValue,
      decidedAt,
      source,
    },
    {
      axis: "scan.photos",
      value: settings.preferences.storeBottlePhotos,
      decidedAt,
      source,
    },
    {
      axis: "scan.metadata",
      value: settings.preferences.storeScanMetadata,
      decidedAt,
      source,
    },
    {
      axis: "scan.training",
      value: settings.preferences.useDataForModelTraining,
      decidedAt,
      source,
    },
    {
      axis: "ml.training",
      value: settings.preferences.useDataForModelTraining,
      decidedAt,
      source,
    },
  ];
}

/**
 * Resolves the effective "use my data to train AI models" consent from the
 * two training axes. ADR-0003 makes consent a single source of truth where
 * the most recent decision wins across axes — so a newer opt-out on either
 * `scan.training` or `ml.training` must revoke an older opt-in on the other,
 * and vice versa. Reading a single axis would silently ignore a decision
 * recorded from another surface (e.g. a profile-level AI-training toggle).
 */
function canUseForTraining(
  latestByAxis: Map<ConsentDecision["axis"], ConsentDecision>,
): boolean {
  const trainingAxes: ConsentDecision["axis"][] = [
    "scan.training",
    "ml.training",
  ];

  let winner: ConsentDecision | null = null;
  for (const axis of trainingAxes) {
    const decision = latestByAxis.get(axis);
    if (!decision) {
      continue;
    }
    // `>=` lets the later-listed axis win an exact-timestamp tie. This is
    // harmless: the only writer that produces a tie (`toConsentDecisions`)
    // stamps both axes with the same value at the same instant, so a tie
    // never carries conflicting values.
    if (
      !winner ||
      Date.parse(decision.decidedAt) >= Date.parse(winner.decidedAt)
    ) {
      winner = decision;
    }
  }

  return winner?.value ?? false;
}

function fromConsentDecisions(
  decisions: ConsentDecision[],
): ScanConsentSettings | null {
  const latestByAxis = new Map<ConsentDecision["axis"], ConsentDecision>();
  for (const decision of decisions) {
    const current = latestByAxis.get(decision.axis);
    if (
      !current ||
      Date.parse(decision.decidedAt) >= Date.parse(current.decidedAt)
    ) {
      latestByAxis.set(decision.axis, decision);
    }
  }
  const requiredAxes = [
    "scan.barcode",
    "scan.photos",
    "scan.metadata",
    "scan.training",
  ] as const;

  if (!requiredAxes.every((axis) => latestByAxis.has(axis))) {
    return null;
  }

  const latestDate = requiredAxes
    .map((axis) => latestByAxis.get(axis)?.decidedAt ?? "")
    .sort()
    .at(-1);

  return {
    hasConsent: true,
    consentedAtIso: latestDate ?? new Date(0).toISOString(),
    retentionDays: 30,
    preferences: {
      storeBarcodeValue: latestByAxis.get("scan.barcode")?.value ?? false,
      storeBottlePhotos: latestByAxis.get("scan.photos")?.value ?? false,
      storeScanMetadata: latestByAxis.get("scan.metadata")?.value ?? false,
      useDataForModelTraining: canUseForTraining(latestByAxis),
    },
  };
}

export const scanStorageRepository: ScanStorageRepository = {
  async getConsentSettings(): Promise<ScanConsentSettings | null> {
    const canonicalSettings = fromConsentDecisions(
      await consentRepository.listDecisions(),
    );
    if (canonicalSettings) {
      return canonicalSettings;
    }

    const legacySettings = parseJson<ScanConsentSettings | null>(
      await safeGetItem(CONSENT_SETTINGS_KEY),
      null,
    );
    if (legacySettings) {
      await consentRepository.appendDecisions(
        toConsentDecisions(legacySettings),
      );
    }

    return legacySettings;
  },

  async saveConsentSettings(settings: ScanConsentSettings): Promise<void> {
    await consentRepository.appendDecisions(toConsentDecisions(settings));
  },

  async listPendingCaptures(): Promise<ScanPendingCapture[]> {
    return readArray<ScanPendingCapture>(PENDING_CAPTURES_KEY);
  },

  async savePendingCapture(capture: ScanPendingCapture): Promise<void> {
    const captures = await readArray<ScanPendingCapture>(PENDING_CAPTURES_KEY);
    await writeArray(PENDING_CAPTURES_KEY, [capture, ...captures]);
  },

  async removePendingCapture(captureId: string): Promise<void> {
    const captures = await readArray<ScanPendingCapture>(PENDING_CAPTURES_KEY);
    const filteredCaptures = captures.filter(
      (capture) => capture.id !== captureId,
    );
    await writeArray(PENDING_CAPTURES_KEY, filteredCaptures);
  },

  async saveResolvedResult(result: ScanResolvedResult): Promise<void> {
    const results = await readArray<ScanResolvedResult>(RESOLVED_RESULTS_KEY);
    const resultsWithoutCurrent = results.filter(
      (existingResult) => existingResult.scanId !== result.scanId,
    );

    await writeArray(RESOLVED_RESULTS_KEY, [result, ...resultsWithoutCurrent]);
  },

  async getResolvedResultById(
    scanId: string,
  ): Promise<ScanResolvedResult | null> {
    const results = await readArray<ScanResolvedResult>(RESOLVED_RESULTS_KEY);
    return results.find((result) => result.scanId === scanId) ?? null;
  },

  async purgeAll(): Promise<void> {
    await removeKeys([
      CONSENT_SETTINGS_KEY,
      PENDING_CAPTURES_KEY,
      RESOLVED_RESULTS_KEY,
    ]);
    await consentRepository.purgeAll();
  },
};
