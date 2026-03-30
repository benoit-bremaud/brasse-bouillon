import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "brassebouillon.access_token";

let accessToken: string | null = null;
let secureStoreAvailable: boolean | null = null;

async function canUseSecureStore(): Promise<boolean> {
  if (secureStoreAvailable !== null) {
    return secureStoreAvailable;
  }

  try {
    secureStoreAvailable = await SecureStore.isAvailableAsync();
  } catch {
    secureStoreAvailable = false;
  }

  return secureStoreAvailable;
}

function getWebStorage(): Storage | null {
  if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) {
    return null;
  }

  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

async function readPersistedToken(): Promise<string | null> {
  if (await canUseSecureStore()) {
    try {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch {
      // Fallback to web storage if the native module is not correctly available.
    }
  }

  const storage = getWebStorage();
  if (!storage) {
    return null;
  }

  try {
    return storage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

async function persistToken(token: string): Promise<void> {
  if (await canUseSecureStore()) {
    try {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
      return;
    } catch {
      // Fallback to web storage if the native module is not correctly available.
    }
  }

  const storage = getWebStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    // Ignore storage write errors.
  }
}

async function deletePersistedToken(): Promise<void> {
  if (await canUseSecureStore()) {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      return;
    } catch {
      // Fallback to web storage if the native module is not correctly available.
    }
  }

  const storage = getWebStorage();
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // Ignore storage removal errors.
  }
}

export const authSession = {
  getAccessToken() {
    return accessToken;
  },
  async load() {
    accessToken = await readPersistedToken();
    return accessToken;
  },
  async setAccessToken(token: string | null) {
    accessToken = token;
    if (token) {
      await persistToken(token);
    } else {
      await deletePersistedToken();
    }
  },
  async clear() {
    accessToken = null;
    await deletePersistedToken();
  },
};
