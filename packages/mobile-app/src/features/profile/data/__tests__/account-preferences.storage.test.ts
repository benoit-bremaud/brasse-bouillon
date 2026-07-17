import { accountPreferencesRepository } from "@/features/profile/data/account-preferences.storage";

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
const mockRemoveItem = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
  removeItem: (...args: unknown[]) => mockRemoveItem(...args),
}));

const ASYNC_STORAGE_UNAVAILABLE_ERROR =
  "AsyncStorageError: Native module is null, cannot access legacy storage";

describe("accountPreferencesRepository", () => {
  beforeEach(() => {
    mockGetItem.mockReset();
    mockSetItem.mockReset();
    mockRemoveItem.mockReset();
  });

  it("reads valid persisted preferences", async () => {
    // Arrange
    const preferences = {
      theme: "dark",
      units: "imperial",
      notificationsEnabled: true,
      brewingRemindersEnabled: false,
      productUpdatesEnabled: true,
    };
    mockGetItem.mockResolvedValue(JSON.stringify(preferences));

    // Act
    const result = await accountPreferencesRepository.get();

    // Assert
    expect(result).toEqual(preferences);
    expect(mockGetItem).toHaveBeenCalledWith("profile:account-preferences");
  });

  it("returns null for malformed persisted preferences", async () => {
    // Arrange
    mockGetItem.mockResolvedValue("{invalid-json");

    // Act
    const result = await accountPreferencesRepository.get();

    // Assert
    expect(result).toBeNull();
  });

  it("uses in-memory fallback when AsyncStorage is unavailable", async () => {
    // Arrange
    mockGetItem.mockRejectedValue(new Error(ASYNC_STORAGE_UNAVAILABLE_ERROR));
    mockSetItem.mockRejectedValue(new Error(ASYNC_STORAGE_UNAVAILABLE_ERROR));
    mockRemoveItem.mockRejectedValue(
      new Error(ASYNC_STORAGE_UNAVAILABLE_ERROR),
    );
    const preferences = {
      theme: "system" as const,
      units: "metric" as const,
      notificationsEnabled: true,
      brewingRemindersEnabled: true,
      productUpdatesEnabled: false,
    };

    // Act
    await accountPreferencesRepository.save(preferences);
    const result = await accountPreferencesRepository.get();

    // Assert
    expect(result).toEqual(preferences);
    await accountPreferencesRepository.purge();
    expect(await accountPreferencesRepository.get()).toBeNull();
  });
});
