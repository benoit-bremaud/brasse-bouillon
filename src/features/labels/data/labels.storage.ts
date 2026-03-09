import {
  LabelDraft,
  LabelDraftStorageRepository,
} from "@/features/labels/domain/label.types";

import AsyncStorage from "@react-native-async-storage/async-storage";

const LABEL_DRAFTS_STORAGE_KEY = "labels:drafts";
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

function enableInMemoryFallbackStorage(): void {
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

async function listStoredDrafts(): Promise<LabelDraft[]> {
  const raw = await safeGetItem(LABEL_DRAFTS_STORAGE_KEY);
  return parseJson<LabelDraft[]>(raw, []);
}

async function writeStoredDrafts(drafts: LabelDraft[]): Promise<void> {
  await safeSetItem(LABEL_DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
}

export const labelsStorageRepository: LabelDraftStorageRepository = {
  async listDrafts(): Promise<LabelDraft[]> {
    return listStoredDrafts();
  },

  async getDraftById(draftId: string): Promise<LabelDraft | null> {
    const drafts = await listStoredDrafts();
    return drafts.find((draft) => draft.id === draftId) ?? null;
  },

  async saveDraft(draft: LabelDraft): Promise<void> {
    const drafts = await listStoredDrafts();
    const otherDrafts = drafts.filter((item) => item.id !== draft.id);
    await writeStoredDrafts([draft, ...otherDrafts]);
  },

  async removeDraft(draftId: string): Promise<void> {
    const drafts = await listStoredDrafts();
    await writeStoredDrafts(drafts.filter((draft) => draft.id !== draftId));
  },

  async purgeAll(): Promise<void> {
    await safeRemoveItem(LABEL_DRAFTS_STORAGE_KEY);
  },
};
