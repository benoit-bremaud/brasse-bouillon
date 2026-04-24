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
 * Resolves the current app build identity from Expo config.
 *
 * In production, the CI/CD pipeline will inject
 * `expo.extra.buildInfo.{commit, buildDate}` into `app.json` at build
 * time. That injection mechanism is not wired yet — it will ship in a
 * follow-up PR alongside the EAS build configuration. Until then, the
 * fields are absent and this resolver falls back to `"dev"` / `"local"`
 * sentinels, which is the correct behaviour for local development.
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
