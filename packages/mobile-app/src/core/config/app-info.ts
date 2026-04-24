import Constants from "expo-constants";

export interface AppInfo {
  version: string;
  commit: string;
  buildDate: string;
}

const UNKNOWN_VERSION = "0.0.0-unknown";
const LOCAL_MARKER = "dev";
const LOCAL_BUILD_DATE = "local";

interface BuildInfoExtra {
  commit?: string;
  buildDate?: string;
}

/**
 * Resolves the current app build identity from Expo config. The CI/CD
 * pipeline injects `expo.extra.buildInfo.{commit, buildDate}` into
 * `app.json` at build time (see `packages/mobile-app/scripts/stamp-build.*`
 * when it ships — for now, the fields are absent in dev and we fall back
 * to `"dev"` / `"local"` sentinels).
 *
 * Exported as a pure function so tests can drive different Constants
 * states without having to re-import the module.
 */
export function getAppInfo(): AppInfo {
  const extra = Constants.expoConfig?.extra as
    | { buildInfo?: BuildInfoExtra }
    | undefined;
  const buildInfo = extra?.buildInfo;

  return {
    version: Constants.expoConfig?.version ?? UNKNOWN_VERSION,
    commit: buildInfo?.commit ?? LOCAL_MARKER,
    buildDate: buildInfo?.buildDate ?? LOCAL_BUILD_DATE,
  };
}

export const appInfo: AppInfo = getAppInfo();
