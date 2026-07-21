import { getAccountPreferences } from "../account-preferences.use-cases";
import {
  buildPersonalDataExport,
  exportPersonalData,
} from "../personal-data-export.use-cases";
import { getPersonalDataExport } from "../../data/personal-data-export.api";
import { writeAndSharePersonalDataExport } from "../../data/personal-data-export.file";
import { listConsentDecisions } from "@/features/consent/application/consent.use-cases";

jest.mock("../account-preferences.use-cases", () => ({
  getAccountPreferences: jest.fn(),
}));
jest.mock("../../data/personal-data-export.api", () => ({
  getPersonalDataExport: jest.fn(),
}));
jest.mock("@/features/consent/application/consent.use-cases", () => ({
  listConsentDecisions: jest.fn(),
}));
jest.mock("../../data/personal-data-export.file", () => ({
  writeAndSharePersonalDataExport: jest.fn(),
}));

const mockedGetAccountPreferences = jest.mocked(getAccountPreferences);
const mockedGetPersonalDataExport = jest.mocked(getPersonalDataExport);
const mockedListConsentDecisions = jest.mocked(listConsentDecisions);
const mockedWriteAndSharePersonalDataExport = jest.mocked(
  writeAndSharePersonalDataExport,
);

describe("personal data export use case", () => {
  beforeEach(() => {
    mockedGetAccountPreferences.mockReset();
    mockedGetPersonalDataExport.mockReset();
    mockedListConsentDecisions.mockReset();
    mockedWriteAndSharePersonalDataExport.mockReset();
  });

  it("merges API data with local preferences and consent history", async () => {
    // Arrange
    mockedGetPersonalDataExport.mockResolvedValue({
      schema_version: "1.0",
      exported_at: "2026-07-16T10:00:00.000Z",
      account: {
        id: "user-1",
        email: "brewer@example.com",
        username: "brewer",
        first_name: null,
        last_name: null,
        bio: null,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-02T00:00:00.000Z",
      },
      recipes: [],
      recipe_components: [],
      batches: [],
      batch_records: [],
      equipment_profiles: [],
      label_drafts: [],
      scans: [],
      scan_images: [],
    });
    mockedGetAccountPreferences.mockResolvedValue({
      theme: "dark",
      units: "imperial",
      notificationsEnabled: true,
      brewingRemindersEnabled: false,
      productUpdatesEnabled: false,
    });
    mockedListConsentDecisions.mockResolvedValue([
      {
        axis: "scan.photos",
        value: true,
        decidedAt: "2026-07-16T09:00:00.000Z",
        source: "profile",
      },
    ]);

    // Act
    const result = await buildPersonalDataExport();

    // Assert
    expect(result.local_preferences.units).toBe("imperial");
    expect(result.consent_history).toHaveLength(1);
    expect(result.account.id).toBe("user-1");
  });

  it("fails when the authenticated API export cannot be loaded", async () => {
    // Arrange
    mockedGetPersonalDataExport.mockRejectedValue(
      new Error("Export unavailable"),
    );
    mockedGetAccountPreferences.mockResolvedValue({
      theme: "system",
      units: "metric",
      notificationsEnabled: true,
      brewingRemindersEnabled: true,
      productUpdatesEnabled: false,
    });
    mockedListConsentDecisions.mockResolvedValue([]);

    // Act
    const exportPromise = buildPersonalDataExport();

    // Assert
    await expect(exportPromise).rejects.toThrow("Export unavailable");
  });

  it("writes the merged bundle through the file gateway", async () => {
    // Arrange
    mockedGetPersonalDataExport.mockResolvedValue({
      schema_version: "1.0",
      exported_at: "2026-07-16T10:00:00.000Z",
      account: {
        id: "user-1",
        email: "brewer@example.com",
        username: "brewer",
        first_name: null,
        last_name: null,
        bio: null,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-02T00:00:00.000Z",
      },
      recipes: [],
      recipe_components: [],
      batches: [],
      batch_records: [],
      equipment_profiles: [],
      label_drafts: [],
      scans: [],
      scan_images: [],
    });
    mockedGetAccountPreferences.mockResolvedValue({
      theme: "system",
      units: "metric",
      notificationsEnabled: true,
      brewingRemindersEnabled: true,
      productUpdatesEnabled: false,
    });
    mockedListConsentDecisions.mockResolvedValue([]);
    mockedWriteAndSharePersonalDataExport.mockResolvedValue(
      "file:///documents/export.json",
    );

    // Act
    const result = await exportPersonalData();

    // Assert
    expect(result).toBe("file:///documents/export.json");
    expect(mockedWriteAndSharePersonalDataExport).toHaveBeenCalledWith(
      expect.objectContaining({
        schema_version: "1.0",
        local_preferences: expect.objectContaining({ units: "metric" }),
        consent_history: [],
      }),
    );
  });
});
