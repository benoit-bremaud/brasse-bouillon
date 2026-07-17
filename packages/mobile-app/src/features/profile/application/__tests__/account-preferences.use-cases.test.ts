import {
  getAccountPreferences,
  getDefaultAccountPreferences,
  saveAccountPreferences,
} from "@/features/profile/application/account-preferences.use-cases";
import { accountPreferencesRepository } from "@/features/profile/data/account-preferences.storage";

jest.mock("@/features/profile/data/account-preferences.storage", () => ({
  accountPreferencesRepository: {
    get: jest.fn(),
    save: jest.fn(),
    purge: jest.fn(),
  },
}));

const mockedRepository = accountPreferencesRepository as jest.Mocked<
  typeof accountPreferencesRepository
>;

describe("account preferences use-cases", () => {
  beforeEach(() => {
    mockedRepository.get.mockReset();
    mockedRepository.save.mockReset();
    mockedRepository.purge.mockReset();
  });

  it("returns stable defaults for a new account", () => {
    // Arrange

    // Act
    const preferences = getDefaultAccountPreferences();

    // Assert
    expect(preferences).toEqual({
      theme: "system",
      units: "metric",
      notificationsEnabled: true,
      brewingRemindersEnabled: true,
      productUpdatesEnabled: false,
    });
  });

  it("merges missing persisted fields with safe defaults", async () => {
    // Arrange
    mockedRepository.get.mockResolvedValue({
      theme: "dark",
      units: "unknown",
      notificationsEnabled: false,
    } as unknown as import("@/features/profile/domain/account-preferences.types").AccountPreferences);

    // Act
    const preferences = await getAccountPreferences();

    // Assert
    expect(preferences).toEqual({
      theme: "dark",
      units: "metric",
      notificationsEnabled: false,
      brewingRemindersEnabled: true,
      productUpdatesEnabled: false,
    });
  });

  it("normalizes and persists a complete preference update", async () => {
    // Arrange
    const input = {
      theme: "light" as const,
      units: "imperial" as const,
      notificationsEnabled: false,
      brewingRemindersEnabled: false,
      productUpdatesEnabled: true,
    };

    // Act
    const preferences = await saveAccountPreferences(input);

    // Assert
    expect(preferences).toEqual(input);
    expect(mockedRepository.save).toHaveBeenCalledWith(input);
  });
});
