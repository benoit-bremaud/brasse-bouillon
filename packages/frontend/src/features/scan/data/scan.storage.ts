import {
  type ScanConsentSettings,
  type ScanPendingCapture,
  type ScanResolvedResult,
  type ScanStorageRepository,
} from "@/features/scan/domain/scan.types";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

export const scanStorageRepository: ScanStorageRepository = {
  async getConsentSettings(): Promise<ScanConsentSettings | null> {
    const raw = await safeGetItem(CONSENT_SETTINGS_KEY);
    return parseJson<ScanConsentSettings | null>(raw, null);
  },

  async saveConsentSettings(settings: ScanConsentSettings): Promise<void> {
    await safeSetItem(CONSENT_SETTINGS_KEY, JSON.stringify(settings));
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
  },
};
