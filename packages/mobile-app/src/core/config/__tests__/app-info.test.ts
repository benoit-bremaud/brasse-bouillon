/**
 * Tests cover happy path (all three values present via Constants.extra),
 * sad path (extra.buildInfo absent, fallback to `dev` / `local`), and
 * edge case (expoConfig itself null → version falls back to a recognisable
 * sentinel).
 */

import Constants from "expo-constants";

import { getAppInfo } from "@/core/config/app-info";
import { getOtaInfo } from "@/core/config/app-info";

jest.mock("expo-updates", () => ({
  channel: "preview",
  updateId: "ota-123",
  createdAt: new Date("2026-07-15T10:00:00.000Z"),
}));

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: {
      version: "0.1.0-alpha2",
      extra: {},
    },
  },
}));

interface MockConstantsShape {
  expoConfig: {
    version?: string;
    extra?: {
      buildInfo?: { commit?: string; buildDate?: string };
    };
  } | null;
}

const mockedConstants = Constants as unknown as MockConstantsShape;

describe("getAppInfo", () => {
  beforeEach(() => {
    mockedConstants.expoConfig = {
      version: "0.1.0-alpha2",
      extra: {},
    };
  });

  it("happy path — reads version + commit + buildDate from Constants.extra.buildInfo", () => {
    mockedConstants.expoConfig = {
      version: "0.1.0-alpha2",
      extra: {
        buildInfo: { commit: "abc1234", buildDate: "2026-05-07" },
      },
    };

    expect(getAppInfo()).toEqual({
      version: "0.1.0-alpha2",
      commit: "abc1234",
      buildDate: "2026-05-07",
    });
  });

  it("sad path — falls back to 'dev' / 'local' when extra.buildInfo is absent", () => {
    const info = getAppInfo();

    expect(info.version).toBe("0.1.0-alpha2");
    expect(info.commit).toBe("dev");
    expect(info.buildDate).toBe("local");
  });

  it("edge case — falls back to a recognisable sentinel when expoConfig is null", () => {
    mockedConstants.expoConfig = null;

    expect(getAppInfo().version).toBe("0.0.0-unknown");
  });

  it("reads OTA channel and update metadata", () => {
    // Arrange

    // Act
    const otaInfo = getOtaInfo();

    // Assert
    expect(otaInfo).toEqual({
      channel: "preview",
      updateId: "ota-123",
      lastUpdate: "2026-07-15T10:00:00.000Z",
    });
  });
});
