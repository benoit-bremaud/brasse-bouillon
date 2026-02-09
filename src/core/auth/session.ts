import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "brassebouillon.access_token";

let accessToken: string | null = null;

export const authSession = {
  getAccessToken() {
    return accessToken;
  },
  async load() {
    accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    return accessToken;
  },
  async setAccessToken(token: string | null) {
    accessToken = token;
    if (token) {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    }
  },
  async clear() {
    accessToken = null;
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  },
};
