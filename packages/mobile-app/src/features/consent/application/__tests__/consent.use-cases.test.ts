import {
  getLatestConsentDecision,
  recordConsentDecisions,
} from "@/features/consent/application/consent.use-cases";
import { consentRepository } from "@/features/consent/data/consent.storage";

jest.mock("@/features/consent/data/consent.storage", () => ({
  consentRepository: {
    listDecisions: jest.fn(),
    appendDecisions: jest.fn(),
    purgeAll: jest.fn(),
  },
}));

const mockedConsentRepository = consentRepository as jest.Mocked<
  typeof consentRepository
>;

describe("consent use-cases", () => {
  beforeEach(() => {
    mockedConsentRepository.listDecisions.mockReset();
    mockedConsentRepository.appendDecisions.mockReset();
    mockedConsentRepository.purgeAll.mockReset();
  });

  it("records a consent decision with an explicit timestamp", async () => {
    // Arrange
    const input = {
      axis: "scan.photos" as const,
      value: false,
      source: "profile" as const,
      decidedAt: "2026-07-15T10:00:00.000Z",
    };

    // Act
    const decisions = await recordConsentDecisions([input]);

    // Assert
    expect(decisions).toEqual([input]);
    expect(mockedConsentRepository.appendDecisions).toHaveBeenCalledWith(
      decisions,
    );
  });

  it("rejects an invalid decision date before writing anything", async () => {
    // Arrange
    const input = {
      axis: "scan.photos" as const,
      value: true,
      source: "profile" as const,
      decidedAt: "not-a-date",
    };

    // Act and Assert
    await expect(recordConsentDecisions([input])).rejects.toThrow(
      "Consent decision date must be a valid ISO date.",
    );
    expect(mockedConsentRepository.appendDecisions).not.toHaveBeenCalled();
  });

  it("returns the most recent decision when the log is out of insertion order", async () => {
    // Arrange
    mockedConsentRepository.listDecisions.mockResolvedValue([
      {
        axis: "scan.training",
        value: true,
        source: "scan",
        decidedAt: "2026-07-14T10:00:00.000Z",
      },
      {
        axis: "scan.training",
        value: false,
        source: "profile",
        decidedAt: "2026-07-15T10:00:00.000Z",
      },
    ]);

    // Act
    const decision = await getLatestConsentDecision("scan.training");

    // Assert
    expect(decision?.value).toBe(false);
    expect(decision?.decidedAt).toBe("2026-07-15T10:00:00.000Z");
  });

  it("returns null when no decision exists for the requested axis", async () => {
    // Arrange
    mockedConsentRepository.listDecisions.mockResolvedValue([]);

    // Act
    const decision = await getLatestConsentDecision("telemetry");

    // Assert
    expect(decision).toBeNull();
  });
});
