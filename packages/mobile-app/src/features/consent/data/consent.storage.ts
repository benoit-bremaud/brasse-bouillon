import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  ConsentAxis,
  ConsentDecision,
  ConsentRepository,
  ConsentSource,
} from "@/features/consent/domain/consent.types";

const CONSENT_LOG_KEY = "brasse.consent.log";
const ASYNC_STORAGE_UNAVAILABLE_PATTERNS = [
  "Native module is null",
  "NativeModule: AsyncStorage is null",
  "cannot access legacy storage",
];

const inMemoryStorage = new Map<string, string>();
let useInMemoryFallbackStorage = false;

const CONSENT_AXES: readonly ConsentAxis[] = [
  "scan.barcode",
  "scan.photos",
  "scan.metadata",
  "scan.training",
  "ml.training",
  "telemetry",
];

const CONSENT_SOURCES: readonly ConsentSource[] = ["profile", "scan", "system"];

function isAsyncStorageUnavailableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return ASYNC_STORAGE_UNAVAILABLE_PATTERNS.some((pattern) =>
    error.message.includes(pattern),
  );
}

function isConsentDecision(value: unknown): value is ConsentDecision {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  const axis = record.axis;
  const source = record.source;
  const decidedAt = record.decidedAt;

  return (
    typeof axis === "string" &&
    CONSENT_AXES.includes(axis as ConsentAxis) &&
    typeof record.value === "boolean" &&
    typeof source === "string" &&
    CONSENT_SOURCES.includes(source as ConsentSource) &&
    typeof decidedAt === "string" &&
    !Number.isNaN(Date.parse(decidedAt))
  );
}

function parseDecisions(value: string | null): ConsentDecision[] {
  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(isConsentDecision) : [];
  } catch {
    return [];
  }
}

async function getItem(): Promise<string | null> {
  if (useInMemoryFallbackStorage) {
    return inMemoryStorage.get(CONSENT_LOG_KEY) ?? null;
  }

  try {
    return await AsyncStorage.getItem(CONSENT_LOG_KEY);
  } catch (error) {
    if (!isAsyncStorageUnavailableError(error)) {
      throw error;
    }

    useInMemoryFallbackStorage = true;
    return inMemoryStorage.get(CONSENT_LOG_KEY) ?? null;
  }
}

async function setItem(value: string): Promise<void> {
  if (useInMemoryFallbackStorage) {
    inMemoryStorage.set(CONSENT_LOG_KEY, value);
    return;
  }

  try {
    await AsyncStorage.setItem(CONSENT_LOG_KEY, value);
  } catch (error) {
    if (!isAsyncStorageUnavailableError(error)) {
      throw error;
    }

    useInMemoryFallbackStorage = true;
    inMemoryStorage.set(CONSENT_LOG_KEY, value);
  }
}

export const consentRepository: ConsentRepository = {
  async listDecisions(): Promise<ConsentDecision[]> {
    return parseDecisions(await getItem());
  },

  async appendDecisions(decisions: ConsentDecision[]): Promise<void> {
    if (decisions.length === 0) {
      return;
    }

    const existingDecisions = await this.listDecisions();
    await setItem(JSON.stringify([...existingDecisions, ...decisions]));
  },

  async purgeAll(): Promise<void> {
    if (useInMemoryFallbackStorage) {
      inMemoryStorage.delete(CONSENT_LOG_KEY);
      return;
    }

    try {
      await AsyncStorage.removeItem(CONSENT_LOG_KEY);
    } catch (error) {
      if (!isAsyncStorageUnavailableError(error)) {
        throw error;
      }

      useInMemoryFallbackStorage = true;
      inMemoryStorage.delete(CONSENT_LOG_KEY);
    }
  },
};
