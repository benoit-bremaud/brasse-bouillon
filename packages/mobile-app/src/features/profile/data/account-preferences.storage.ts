import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  AccountPreferences,
  AccountPreferencesRepository,
} from "@/features/profile/domain/account-preferences.types";

const ACCOUNT_PREFERENCES_KEY = "profile:account-preferences";
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

function parsePreferences(value: string | null): AccountPreferences | null {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as AccountPreferences)
      : null;
  } catch {
    return null;
  }
}

async function getItem(): Promise<string | null> {
  if (useInMemoryFallbackStorage) {
    return inMemoryStorage.get(ACCOUNT_PREFERENCES_KEY) ?? null;
  }

  try {
    return await AsyncStorage.getItem(ACCOUNT_PREFERENCES_KEY);
  } catch (error) {
    if (!isAsyncStorageUnavailableError(error)) {
      throw error;
    }

    useInMemoryFallbackStorage = true;
    return inMemoryStorage.get(ACCOUNT_PREFERENCES_KEY) ?? null;
  }
}

async function setItem(value: string): Promise<void> {
  if (useInMemoryFallbackStorage) {
    inMemoryStorage.set(ACCOUNT_PREFERENCES_KEY, value);
    return;
  }

  try {
    await AsyncStorage.setItem(ACCOUNT_PREFERENCES_KEY, value);
  } catch (error) {
    if (!isAsyncStorageUnavailableError(error)) {
      throw error;
    }

    useInMemoryFallbackStorage = true;
    inMemoryStorage.set(ACCOUNT_PREFERENCES_KEY, value);
  }
}

export const accountPreferencesRepository: AccountPreferencesRepository = {
  async get(): Promise<AccountPreferences | null> {
    return parsePreferences(await getItem());
  },

  async save(preferences: AccountPreferences): Promise<void> {
    await setItem(JSON.stringify(preferences));
  },

  async purge(): Promise<void> {
    if (useInMemoryFallbackStorage) {
      inMemoryStorage.delete(ACCOUNT_PREFERENCES_KEY);
      return;
    }

    try {
      await AsyncStorage.removeItem(ACCOUNT_PREFERENCES_KEY);
    } catch (error) {
      if (!isAsyncStorageUnavailableError(error)) {
        throw error;
      }

      useInMemoryFallbackStorage = true;
      inMemoryStorage.delete(ACCOUNT_PREFERENCES_KEY);
    }
  },
};
