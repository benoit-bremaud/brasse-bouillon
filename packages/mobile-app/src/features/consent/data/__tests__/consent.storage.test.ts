import { consentRepository } from "@/features/consent/data/consent.storage";

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

describe("consentRepository", () => {
  beforeEach(() => {
    mockGetItem.mockReset();
    mockSetItem.mockReset();
    mockRemoveItem.mockReset();
  });

  it("appends decisions to the canonical log", async () => {
    // Arrange
    mockGetItem.mockResolvedValue(
      JSON.stringify([
        {
          axis: "telemetry",
          value: false,
          decidedAt: "2026-07-14T10:00:00.000Z",
          source: "profile",
        },
      ]),
    );
    const decision = {
      axis: "scan.photos" as const,
      value: true,
      decidedAt: "2026-07-15T10:00:00.000Z",
      source: "profile" as const,
    };

    // Act
    await consentRepository.appendDecisions([decision]);

    // Assert
    expect(mockSetItem).toHaveBeenCalledWith(
      "brasse.consent.log",
      JSON.stringify([
        {
          axis: "telemetry",
          value: false,
          decidedAt: "2026-07-14T10:00:00.000Z",
          source: "profile",
        },
        decision,
      ]),
    );
  });

  it("ignores malformed log content instead of exposing invalid decisions", async () => {
    // Arrange
    mockGetItem.mockResolvedValue("{invalid-json");

    // Act
    const decisions = await consentRepository.listDecisions();

    // Assert
    expect(decisions).toEqual([]);
  });

  it("filters malformed decisions from an otherwise valid log", async () => {
    // Arrange
    mockGetItem.mockResolvedValue(
      JSON.stringify([
        {
          axis: "scan.photos",
          value: true,
          decidedAt: "2026-07-15T10:00:00.000Z",
          source: "profile",
        },
        {
          axis: "unknown.axis",
          value: true,
          decidedAt: "2026-07-15T10:00:00.000Z",
          source: "profile",
        },
        {
          axis: "scan.metadata",
          value: "yes",
          decidedAt: "not-a-date",
          source: "scan",
        },
      ]),
    );

    // Act
    const decisions = await consentRepository.listDecisions();

    // Assert
    expect(decisions).toEqual([
      {
        axis: "scan.photos",
        value: true,
        decidedAt: "2026-07-15T10:00:00.000Z",
        source: "profile",
      },
    ]);
  });

  it("falls back to memory when the native module is unavailable", async () => {
    // Arrange
    mockGetItem.mockRejectedValue(new Error(ASYNC_STORAGE_UNAVAILABLE_ERROR));
    mockSetItem.mockRejectedValue(new Error(ASYNC_STORAGE_UNAVAILABLE_ERROR));
    mockRemoveItem.mockRejectedValue(
      new Error(ASYNC_STORAGE_UNAVAILABLE_ERROR),
    );
    const decision = {
      axis: "scan.barcode" as const,
      value: true,
      decidedAt: "2026-07-15T10:00:00.000Z",
      source: "scan" as const,
    };

    // Act
    await consentRepository.appendDecisions([decision]);
    const decisions = await consentRepository.listDecisions();

    // Assert
    expect(decisions).toEqual([decision]);
    await consentRepository.purgeAll();
    expect(await consentRepository.listDecisions()).toEqual([]);
  });
});
