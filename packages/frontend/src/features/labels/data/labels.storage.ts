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

type MemoryOperation<T> = () => T;
type AsyncStorageOperation<T> = () => Promise<T>;

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

async function runWithStorageFallback<T>(
  runAsyncStorage: AsyncStorageOperation<T>,
  runInMemoryStorage: MemoryOperation<T>,
): Promise<T> {
  if (useInMemoryFallbackStorage) {
    return runInMemoryStorage();
  }

  try {
    return await runAsyncStorage();
  } catch (error) {
    if (!isAsyncStorageUnavailableError(error)) {
      throw error;
    }

    enableInMemoryFallbackStorage();
    return runInMemoryStorage();
  }
}

async function safeGetItem(key: string): Promise<string | null> {
  return runWithStorageFallback(
    () => AsyncStorage.getItem(key),
    () => inMemoryStorage.get(key) ?? null,
  );
}

async function safeSetItem(key: string, value: string): Promise<void> {
  await runWithStorageFallback(
    async () => {
      await AsyncStorage.setItem(key, value);
    },
    () => {
      inMemoryStorage.set(key, value);
    },
  );
}

async function safeRemoveItem(key: string): Promise<void> {
  await runWithStorageFallback(
    async () => {
      await AsyncStorage.removeItem(key);
    },
    () => {
      inMemoryStorage.delete(key);
    },
  );
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
