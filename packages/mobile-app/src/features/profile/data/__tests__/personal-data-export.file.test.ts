import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { writeAndSharePersonalDataExport } from "../personal-data-export.file";

jest.mock("expo-file-system/legacy", () => ({
  documentDirectory: "file:///documents/",
  writeAsStringAsync: jest.fn(),
}));
jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

const mockedWriteAsStringAsync = jest.mocked(FileSystem.writeAsStringAsync);
const mockedIsAvailableAsync = jest.mocked(Sharing.isAvailableAsync);
const mockedShareAsync = jest.mocked(Sharing.shareAsync);

const exportBundle = {
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
  local_preferences: {
    theme: "system" as const,
    units: "metric" as const,
    notificationsEnabled: true,
    brewingRemindersEnabled: true,
    productUpdatesEnabled: false,
  },
  consent_history: [],
};

describe("personal data export file adapter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedIsAvailableAsync.mockResolvedValue(true);
    mockedWriteAsStringAsync.mockResolvedValue(undefined);
    mockedShareAsync.mockResolvedValue(undefined);
  });

  it("writes a JSON file and opens the native share sheet", async () => {
    // Arrange

    // Act
    const uri = await writeAndSharePersonalDataExport(exportBundle);

    // Assert
    expect(uri).toMatch(/^file:\/\/\/documents\/brasse-bouillon-export-/);
    expect(mockedWriteAsStringAsync).toHaveBeenCalledWith(
      uri,
      JSON.stringify(exportBundle, null, 2),
    );
    expect(mockedShareAsync).toHaveBeenCalledWith(
      uri,
      expect.objectContaining({ mimeType: "application/json" }),
    );
  });

  it("fails clearly when native sharing is unavailable", async () => {
    // Arrange
    mockedIsAvailableAsync.mockResolvedValue(false);

    // Act
    const exportPromise = writeAndSharePersonalDataExport(exportBundle);

    // Assert
    await expect(exportPromise).rejects.toThrow(
      "Le partage de fichiers n'est pas disponible.",
    );
    expect(mockedWriteAsStringAsync).not.toHaveBeenCalled();
  });
});
