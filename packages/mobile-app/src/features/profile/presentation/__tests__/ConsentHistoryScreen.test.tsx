import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";

import { listConsentDecisions } from "@/features/consent/application/consent.use-cases";
import { ConsentHistoryScreen } from "../ConsentHistoryScreen";

const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
  usePathname: () => "/(app)/profile/privacy-history",
}));
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock("@/features/consent/application/consent.use-cases", () => ({
  listConsentDecisions: jest.fn(),
}));

const mockedListConsentDecisions = jest.mocked(listConsentDecisions);

describe("ConsentHistoryScreen", () => {
  beforeEach(() => {
    mockBack.mockReset();
    mockedListConsentDecisions.mockReset();
  });

  it("renders the consent decisions with status, source, and date", async () => {
    // Arrange
    mockedListConsentDecisions.mockResolvedValue([
      {
        axis: "scan.photos",
        value: true,
        source: "profile",
        decidedAt: "2026-07-15T10:00:00.000Z",
      },
      {
        axis: "scan.metadata",
        value: false,
        source: "scan",
        decidedAt: "2026-07-14T10:00:00.000Z",
      },
    ]);

    // Act
    render(<ConsentHistoryScreen />);

    // Assert
    await waitFor(() =>
      expect(screen.getByText("Photos de bouteille")).toBeTruthy(),
    );
    expect(screen.getByText("Autorisé")).toBeTruthy();
    expect(screen.getByText("Métadonnées de scan")).toBeTruthy();
    expect(screen.getByText("Refusé")).toBeTruthy();
    expect(screen.getByText(/Profil/)).toBeTruthy();
    expect(screen.getByText(/Scanner/)).toBeTruthy();
  });

  it("renders an explicit empty state when no decisions exist", async () => {
    // Arrange
    mockedListConsentDecisions.mockResolvedValue([]);

    // Act
    render(<ConsentHistoryScreen />);

    // Assert
    await waitFor(() =>
      expect(
        screen.getByText(
          "Aucune décision de consentement n'a encore été enregistrée.",
        ),
      ).toBeTruthy(),
    );
  });

  it("renders a safe fallback for a malformed stored timestamp", async () => {
    // Arrange
    mockedListConsentDecisions.mockResolvedValue([
      {
        axis: "scan.photos",
        value: true,
        source: "profile",
        decidedAt: "not-a-date",
      },
    ]);

    // Act
    render(<ConsentHistoryScreen />);

    // Assert
    expect(await screen.findByText(/Date inconnue/)).toBeTruthy();
  });

  it("renders the loading error when the history cannot be read", async () => {
    // Arrange
    mockedListConsentDecisions.mockRejectedValue(new Error("storage failed"));

    // Act
    render(<ConsentHistoryScreen />);

    // Assert
    await waitFor(() =>
      expect(screen.getByText("storage failed")).toBeTruthy(),
    );
  });

  it("returns to the privacy screen", () => {
    // Arrange
    mockedListConsentDecisions.mockResolvedValue([]);
    render(<ConsentHistoryScreen />);

    // Act
    fireEvent.press(screen.getByLabelText("Retour à la confidentialité"));

    // Assert
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
